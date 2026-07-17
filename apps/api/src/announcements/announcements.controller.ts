import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@ApiTags('Announcements')
@ApiBearerAuth('access_token')
@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Publish an academic announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      "List announcements for the caller's school. Non-admin callers only see published, audience-matched announcements.",
  })
  @ApiResponse({ status: 200, description: 'Announcements returned' })
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.announcementsService.listForCaller(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an announcement by id' })
  @ApiResponse({ status: 200, description: 'Announcement returned' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  get(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.announcementsService.getForCaller(user.sub, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiResponse({ status: 200, description: 'Announcement updated' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiResponse({ status: 200, description: 'Announcement deleted' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  remove(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.announcementsService.remove(user.sub, id);
  }
}
