import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@ApiTags('Calendar')
@ApiBearerAuth('access_token')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({
    summary:
      "List calendar events for the caller's school, optionally within a date range. Non-admin callers only see published events matching their role.",
  })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date' })
  @ApiResponse({ status: 200, description: 'Calendar events returned' })
  listEvents(
    @CurrentUser() user: AccessTokenPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.calendarService.listForCaller(
      user.sub,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Post('events')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Create a calendar event (starts as DRAFT)' })
  @ApiResponse({ status: 201, description: 'Calendar event created' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateCalendarEventDto) {
    return this.calendarService.create(user.sub, dto);
  }

  @Patch('events/:id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Update a calendar event' })
  @ApiResponse({ status: 200, description: 'Calendar event updated' })
  @ApiResponse({ status: 404, description: 'Calendar event not found' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarService.update(user.sub, id, dto);
  }

  @Patch('events/:id/publish')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Publish a calendar event, making it visible to its audience' })
  @ApiResponse({ status: 200, description: 'Calendar event published' })
  @ApiResponse({ status: 404, description: 'Calendar event not found' })
  publish(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.calendarService.publish(user.sub, id);
  }

  @Delete('events/:id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Delete a calendar event' })
  @ApiResponse({ status: 200, description: 'Calendar event deleted' })
  @ApiResponse({ status: 404, description: 'Calendar event not found' })
  remove(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.calendarService.remove(user.sub, id);
  }
}
