import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { AccessTokenPayload } from '@workspace/types';
import { MessagingService } from '../messaging/messaging.service';

function extractAccessTokenCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  for (const pair of cookieHeader.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (key === 'access_token') return rest.join('=');
  }
  return null;
}

/** Generic realtime gateway — chat is the only thing wired up today, but the
 * connection/auth plumbing is reusable for other realtime needs later (e.g. presence). */
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly messaging: MessagingService,
  ) {}

  handleConnection(client: Socket) {
    const token = extractAccessTokenCookie(client.handshake.headers.cookie);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwt.verify<AccessTokenPayload>(token);
      client.data.user = payload;
    } catch {
      this.logger.warn(`Rejected socket connection: invalid token`);
      client.disconnect();
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    const user = client.data.user as AccessTokenPayload | undefined;
    if (!user) return;

    const isParticipant = await this.messaging.isParticipant(data.chatRoomId, user.sub);
    if (!isParticipant) {
      client.emit('error', { message: 'Not a participant in this chat room' });
      return;
    }

    await client.join(data.chatRoomId);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string; content: string },
  ) {
    const user = client.data.user as AccessTokenPayload | undefined;
    if (!user) return;

    try {
      const message = await this.messaging.sendMessage(user.sub, data.chatRoomId, data.content);
      this.server.to(data.chatRoomId).emit('message:new', message);
    } catch {
      client.emit('error', { message: 'Could not send message' });
    }
  }
}
