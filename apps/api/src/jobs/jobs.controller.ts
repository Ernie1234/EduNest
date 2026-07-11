import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@ApiBearerAuth('access_token')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List open staff job postings' })
  @ApiResponse({ status: 200, description: 'Job postings returned' })
  listOpenPostings() {
    return this.jobsService.listOpenPostings();
  }

  @Get(':id/applications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List applications for a job posting' })
  @ApiResponse({ status: 200, description: 'Job applications returned' })
  listApplications(@Param('id') id: string) {
    return this.jobsService.listApplicationsForPosting(id);
  }
}
