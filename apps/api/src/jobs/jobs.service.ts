import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  listOpenPostings() {
    return this.prisma.jobPosting.findMany({
      where: { status: 'OPEN' },
      orderBy: { closesAt: 'asc' },
    });
  }

  listApplicationsForPosting(jobPostingId: string) {
    return this.prisma.jobApplication.findMany({
      where: { jobPostingId },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
