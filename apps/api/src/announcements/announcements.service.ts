import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
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

  async create(callerId: string, dto: CreateAnnouncementDto) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    return this.prisma.announcement.create({
      data: {
        schoolId,
        authorId: callerId,
        title: dto.title,
        body: dto.body,
        audience: dto.audience ?? [],
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
    const now = new Date();

    return this.prisma.announcement.findMany({
      where: {
        schoolId: caller.schoolId,
        ...(isAdminTier
          ? {}
          : {
              publishedAt: { lte: now },
              OR: [{ audience: { isEmpty: true } }, { audience: { has: caller.role } }],
            }),
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  private async findOwned(callerId: string, id: string) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, schoolId },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }

  async getForCaller(callerId: string, id: string) {
    return this.findOwned(callerId, id);
  }

  async update(callerId: string, id: string, dto: UpdateAnnouncementDto) {
    await this.findOwned(callerId, id);
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body,
        audience: dto.audience,
        visibility: dto.visibility,
      },
    });
  }

  async remove(callerId: string, id: string) {
    await this.findOwned(callerId, id);
    await this.prisma.announcement.delete({ where: { id } });
  }
}
