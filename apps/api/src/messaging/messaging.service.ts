import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  listRoomMessages(chatRoomId: string) {
    return this.prisma.chatMessage.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });
  }

  listAnnouncements(schoolId: string) {
    return this.prisma.announcement.findMany({
      where: { schoolId },
      orderBy: { publishedAt: 'desc' },
    });
  }
}
