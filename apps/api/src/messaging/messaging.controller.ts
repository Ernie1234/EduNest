import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Messaging')
@ApiBearerAuth('access_token')
@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'List messages in a chat room' })
  @ApiResponse({ status: 200, description: 'Chat messages returned' })
  listRoomMessages(@Param('id') id: string) {
    return this.messagingService.listRoomMessages(id);
  }

  @Post('rooms/:id/messages')
  @ApiOperation({
    summary:
      'Send a message to a chat room (REST fallback — the WebSocket gateway is the primary ' +
      'path for connected clients, both call the same service method)',
  })
  @ApiResponse({ status: 201, description: 'Message sent' })
  @ApiResponse({ status: 403, description: 'Not a participant in this chat room' })
  sendMessage(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(user.sub, id, dto.content);
  }

  @Get('rooms/:id/participants')
  @ApiOperation({ summary: 'List participants in a chat room' })
  @ApiResponse({ status: 200, description: 'Participants returned' })
  listRoomParticipants(@Param('id') id: string) {
    return this.messagingService.listRoomParticipants(id);
  }

  @Get('announcements')
  @ApiOperation({ summary: 'List announcements for a school' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({ status: 200, description: 'Announcements returned' })
  listAnnouncements(@Query('schoolId') schoolId: string) {
    return this.messagingService.listAnnouncements(schoolId);
  }
}
