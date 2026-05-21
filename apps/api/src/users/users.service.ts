import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleProfileInput } from '@workspace/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private parseEmailList(value: string | undefined): string[] {
    if (!value?.trim()) return [];
    return value
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }

  private roleForNewUser(email: string): UserRole {
    const normalized = email.toLowerCase();
    if (
      this.parseEmailList(process.env.SUPER_ADMIN_EMAILS).includes(normalized)
    ) {
      return UserRole.SUPER_ADMIN;
    }
    if (this.parseEmailList(process.env.TEACHER_EMAILS).includes(normalized)) {
      return UserRole.TEACHER;
    }
    return UserRole.STUDENT;
  }

  async upsertFromGoogle(input: GoogleProfileInput): Promise<User> {
    const { googleId, email, name, image } = input;
    const existing = await this.prisma.user.findUnique({ where: { googleId } });
    if (existing) {
      return this.prisma.user.update({
        where: { googleId },
        data: {
          name: name ?? existing.name,
          image: image ?? existing.image,
        },
      });
    }
    return this.prisma.user.create({
      data: {
        googleId,
        email,
        name,
        image,
        role: this.roleForNewUser(email),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
