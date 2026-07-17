import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatMessage, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function toChatRoomMessage(message: ChatMessage & { sender: User }) {
  return {
    id: message.id,
    chatRoomId: message.chatRoomId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderImage: message.sender.image,
    content: message.content,
    createdAt: message.createdAt,
  };
}

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async listRoomMessages(chatRoomId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });
    return messages.map(toChatRoomMessage);
  }

  async listRoomParticipants(chatRoomId: string) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { chatRoomId },
      include: { user: true },
    });
    return participants.map((p) => ({
      userId: p.userId,
      name: p.user.name ?? '',
      image: p.user.image ?? undefined,
    }));
  }

  async isParticipant(chatRoomId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { chatRoomId_userId: { chatRoomId, userId } },
    });
    return !!participant;
  }

  /** Single write path for chat messages — called from both the REST endpoint
   * and the WebSocket gateway so there's one source of truth. */
  async sendMessage(senderId: string, chatRoomId: string, content: string) {
    if (!(await this.isParticipant(chatRoomId, senderId))) {
      throw new ForbiddenException('Not a participant in this chat room');
    }

    const message = await this.prisma.chatMessage.create({
      data: { chatRoomId, senderId, content },
      include: { sender: true },
    });
    return toChatRoomMessage(message);
  }

  listAnnouncements(schoolId: string) {
    return this.prisma.announcement.findMany({
      where: { schoolId },
      orderBy: { publishedAt: 'desc' },
    });
  }
}
