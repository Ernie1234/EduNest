import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleProfileInput } from '@workspace/types';
import { ASSIGNABLE_BY_ADMIN_TIER } from '../common/constants/roles.constants';

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

  /** Lists users in the caller's school (SUPER_ADMIN with no school sees all). */
  async listForCaller(callerId: string, role?: UserRole) {
    const caller = await this.prisma.user.findUniqueOrThrow({
      where: { id: callerId },
      select: { schoolId: true, role: true },
    });

    return this.prisma.user.findMany({
      where: {
        ...(caller.role === UserRole.SUPER_ADMIN && !caller.schoolId
          ? {}
          : { schoolId: caller.schoolId }),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        status: true,
        schoolId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Assigns a role to a target user, enforcing the tiered role-assignment
   * restriction: only SUPER_ADMIN may grant an admin-tier role. */
  async assignRole(
    callerId: string,
    targetUserId: string,
    role: UserRole,
  ): Promise<User> {
    const caller = await this.prisma.user.findUniqueOrThrow({
      where: { id: callerId },
      select: { role: true, schoolId: true },
    });
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (caller.role !== UserRole.SUPER_ADMIN) {
      if (caller.schoolId && target.schoolId !== caller.schoolId) {
        throw new ForbiddenException('Cannot manage users outside your school');
      }
      if (!ASSIGNABLE_BY_ADMIN_TIER.includes(role)) {
        throw new ForbiddenException(
          `Only SUPER_ADMIN can assign the role ${role}`,
        );
      }
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });
  }
}
