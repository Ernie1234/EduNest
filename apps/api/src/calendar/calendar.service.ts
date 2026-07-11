import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
