import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdmissionsService } from './admissions.service';

@ApiTags('Admissions')
@ApiBearerAuth('access_token')
@Controller('admissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get('cycles')
  @ApiOperation({ summary: 'List admission cycles' })
  @ApiResponse({ status: 200, description: 'Admission cycles returned' })
  listCycles() {
    return this.admissionsService.listCycles();
  }

  @Get('applications')
  @ApiOperation({ summary: 'List admission applications, optionally filtered by cycle' })
  @ApiQuery({ name: 'cycleId', required: false })
  @ApiResponse({ status: 200, description: 'Admission applications returned' })
  listApplications(@Query('cycleId') cycleId?: string) {
    return this.admissionsService.listApplications(cycleId);
  }
}
