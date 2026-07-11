import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  listCycles() {
    return this.prisma.admissionCycle.findMany({ orderBy: { opensAt: 'desc' } });
  }

  listApplications(cycleId?: string) {
    return this.prisma.admissionApplication.findMany({
      where: cycleId ? { admissionCycleId: cycleId } : undefined,
      include: { desiredDepartment: true },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
