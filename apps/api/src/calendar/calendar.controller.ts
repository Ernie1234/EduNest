import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@ApiBearerAuth('access_token')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'List calendar events for a school, optionally within a date range' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date' })
  @ApiResponse({ status: 200, description: 'Calendar events returned' })
  listEvents(
    @Query('schoolId') schoolId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.calendarService.listEvents(
      schoolId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }
}
