import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemestersService {
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

  private assertValidRange(startDate: Date, endDate: Date) {
    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
  }

  async create(callerId: string, dto: CreateSemesterDto) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.assertValidRange(startDate, endDate);

    return this.prisma.academicSession.create({
      data: { schoolId, name: dto.name, semester: dto.semester, startDate, endDate },
    });
  }

  async listForCaller(callerId: string) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    return this.prisma.academicSession.findMany({
      where: { schoolId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getActiveForCaller(callerId: string) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    const now = new Date();
    const active = await this.prisma.academicSession.findFirst({
      where: { schoolId, startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { startDate: 'desc' },
    });
    if (!active) {
      throw new NotFoundException('No active semester for the current date');
    }
    return active;
  }

  async update(callerId: string, id: string, dto: UpdateSemesterDto) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    const existing = await this.prisma.academicSession.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      throw new NotFoundException('Semester not found');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    this.assertValidRange(startDate, endDate);

    return this.prisma.academicSession.update({
      where: { id },
      data: {
        name: dto.name,
        semester: dto.semester,
        startDate,
        endDate,
      },
    });
  }
}
