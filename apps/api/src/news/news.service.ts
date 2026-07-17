import { Injectable, NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { CreateNewsPostDto } from './dto/create-news-post.dto';
import { UpdateNewsPostDto } from './dto/update-news-post.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCallerSchoolId(callerId: string): Promise<string> {
    const caller = await this.prisma.user.findUniqueOrThrow({
      where: { id: callerId },
      select: { schoolId: true },
    });
    if (!caller.schoolId) {
      throw new NotFoundException('No school is associated with this account');
    }
    return caller.schoolId;
  }

  async create(callerId: string, dto: CreateNewsPostDto) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    return this.prisma.newsPost.create({
      data: {
        schoolId,
        authorId: callerId,
        title: dto.title,
        body: dto.body,
        mediaId: dto.mediaId,
        visibility: dto.visibility,
      },
    });
  }

  async listForCaller(callerId: string) {
    const caller = await this.prisma.user.findUniqueOrThrow({
      where: { id: callerId },
      select: { schoolId: true, role: true },
    });
    if (!caller.schoolId) return [];

    const isAdminTier = ADMIN_TIER_ROLES.includes(caller.role);

    return this.prisma.newsPost.findMany({
      where: {
        schoolId: caller.schoolId,
        ...(isAdminTier ? {} : { status: PublishStatus.PUBLISHED }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findOwned(callerId: string, id: string) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    const post = await this.prisma.newsPost.findFirst({ where: { id, schoolId } });
    if (!post) {
      throw new NotFoundException('News post not found');
    }
    return post;
  }

  async getForCaller(callerId: string, id: string) {
    return this.findOwned(callerId, id);
  }

  async update(callerId: string, id: string, dto: UpdateNewsPostDto) {
    await this.findOwned(callerId, id);
    return this.prisma.newsPost.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body,
        mediaId: dto.mediaId,
        visibility: dto.visibility,
      },
    });
  }

  async publish(callerId: string, id: string) {
    await this.findOwned(callerId, id);
    return this.prisma.newsPost.update({
      where: { id },
      data: { status: PublishStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async remove(callerId: string, id: string) {
    await this.findOwned(callerId, id);
    await this.prisma.newsPost.delete({ where: { id } });
  }
}
