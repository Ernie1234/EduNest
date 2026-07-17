import { Injectable, NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  listEvents(schoolId: string, from?: Date, to?: Date) {
    return this.prisma.calendarEvent.findMany({
      where: {
        schoolId,
        ...(from && to ? { startAt: { gte: from }, endAt: { lte: to } } : {}),
      },
      orderBy: { startAt: 'asc' },
    });
  }

  /** Same as listEvents, but non-admin callers only see published events
   * matching their role (or school-wide events with an empty audience). */
  async listForCaller(
    callerId: string,
    from?: Date,
    to?: Date,
    courseOfferingId?: string,
  ) {
    const caller = await this.prisma.user.findUniqueOrThrow({
      where: { id: callerId },
      select: { schoolId: true, role: true },
    });
    if (!caller.schoolId) return [];

    const isAdminTier = ADMIN_TIER_ROLES.includes(caller.role);

    return this.prisma.calendarEvent.findMany({
      where: {
        schoolId: caller.schoolId,
        ...(courseOfferingId ? { courseOfferingId } : {}),
        ...(from && to ? { startAt: { gte: from }, endAt: { lte: to } } : {}),
        ...(isAdminTier
          ? {}
          : {
              publishState: PublishStatus.PUBLISHED,
              OR: [{ audience: { isEmpty: true } }, { audience: { has: caller.role } }],
            }),
      },
      orderBy: { startAt: 'asc' },
    });
  }

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

  async create(callerId: string, dto: CreateCalendarEventDto) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    return this.prisma.calendarEvent.create({
      data: {
        schoolId,
        createdById: callerId,
        title: dto.title,
        type: dto.type,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        audience: dto.audience ?? [],
        courseOfferingId: dto.courseOfferingId,
      },
    });
  }

  private async findOwned(callerId: string, id: string) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    const event = await this.prisma.calendarEvent.findFirst({ where: { id, schoolId } });
    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }
    return event;
  }

  async update(callerId: string, id: string, dto: UpdateCalendarEventDto) {
    await this.findOwned(callerId, id);
    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        title: dto.title,
        type: dto.type,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        audience: dto.audience,
      },
    });
  }

  async publish(callerId: string, id: string) {
    await this.findOwned(callerId, id);
    return this.prisma.calendarEvent.update({
      where: { id },
      data: { publishState: PublishStatus.PUBLISHED },
    });
  }

  async remove(callerId: string, id: string) {
    await this.findOwned(callerId, id);
    await this.prisma.calendarEvent.delete({ where: { id } });
  }
}
