import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  listJobsForUser(userId: string) {
    return this.prisma.aiJob.findMany({
      where: { requestedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
