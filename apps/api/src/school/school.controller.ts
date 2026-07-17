import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { SchoolService } from './school.service';
import { UpdateSchoolDto } from './dto/update-school.dto';

@ApiTags('School')
@ApiBearerAuth('access_token')
@Controller('school')
@UseGuards(JwtAuthGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  @ApiOperation({ summary: "Get the caller's school profile" })
  @ApiResponse({ status: 200, description: 'School profile returned' })
  @ApiResponse({ status: 404, description: 'No school associated with this account' })
  get(@CurrentUser() user: AccessTokenPayload) {
    return this.schoolService.getForCaller(user.sub);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: "Update the caller's school profile and settings" })
  @ApiResponse({ status: 200, description: 'School profile updated' })
  update(@CurrentUser() user: AccessTokenPayload, @Body() dto: UpdateSchoolDto) {
    return this.schoolService.updateForCaller(user.sub, dto);
  }
}
