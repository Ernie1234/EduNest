import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(uploaderId: string) {
    return this.prisma.media.findMany({
      where: { uploaderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
