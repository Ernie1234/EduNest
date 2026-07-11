import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagingService } from './messaging.service';

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

  @Get('announcements')
  @ApiOperation({ summary: 'List announcements for a school' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({ status: 200, description: 'Announcements returned' })
  listAnnouncements(@Query('schoolId') schoolId: string) {
    return this.messagingService.listAnnouncements(schoolId);
  }
}
