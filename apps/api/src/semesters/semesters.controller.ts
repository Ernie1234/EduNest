import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { SemestersService } from './semesters.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@ApiTags('Semesters')
@ApiBearerAuth('access_token')
@Controller('semesters')
@UseGuards(JwtAuthGuard)
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Create a semester (academic session) for the caller\'s school' })
  @ApiResponse({ status: 201, description: 'Semester created' })
  @ApiResponse({ status: 400, description: 'endDate must be after startDate' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateSemesterDto) {
    return this.semestersService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: "List semesters for the caller's school" })
  @ApiResponse({ status: 200, description: 'Semesters returned' })
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.semestersService.listForCaller(user.sub);
  }

  @Get('active')
  @ApiOperation({ summary: "Resolve the semester active for today's date" })
  @ApiResponse({ status: 200, description: 'Active semester returned' })
  @ApiResponse({ status: 404, description: 'No active semester for the current date' })
  getActive(@CurrentUser() user: AccessTokenPayload) {
    return this.semestersService.getActiveForCaller(user.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Update a semester' })
  @ApiResponse({ status: 200, description: 'Semester updated' })
  @ApiResponse({ status: 400, description: 'endDate must be after startDate' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSemesterDto,
  ) {
    return this.semestersService.update(user.sub, id, dto);
  }
}
