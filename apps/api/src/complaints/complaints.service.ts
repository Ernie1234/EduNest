import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  create(raisedById: string, dto: CreateComplaintDto) {
    return this.prisma.complaint.create({ data: { raisedById, ...dto } });
  }

  listForUser(raisedById: string) {
    return this.prisma.complaint.findMany({
      where: { raisedById },
      orderBy: { createdAt: 'desc' },
      include: { comments: true },
    });
  }
}
