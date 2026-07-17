import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { ScoringService } from './scoring.service';
import { CreateScoringSchemaDto } from './dto/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from './dto/update-scoring-schema.dto';

@ApiTags('Scoring Schemas')
@ApiBearerAuth('access_token')
@Controller('scoring-schemas')
@UseGuards(JwtAuthGuard)
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Create a scoring schema (component weights must sum to 100)' })
  @ApiResponse({ status: 201, description: 'Scoring schema created' })
  @ApiResponse({ status: 400, description: 'Component weights do not sum to 100' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateScoringSchemaDto) {
    return this.scoringService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: "List scoring schemas for the caller's school" })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Scoring schemas returned' })
  list(@CurrentUser() user: AccessTokenPayload, @Query('active') active?: string) {
    return this.scoringService.listForCaller(user.sub, active === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scoring schema by id' })
  @ApiResponse({ status: 200, description: 'Scoring schema returned' })
  @ApiResponse({ status: 404, description: 'Scoring schema not found' })
  get(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.scoringService.getForCaller(user.sub, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Update a scoring schema (name, components, or active state)' })
  @ApiResponse({ status: 200, description: 'Scoring schema updated' })
  @ApiResponse({ status: 400, description: 'Component weights do not sum to 100' })
  @ApiResponse({ status: 404, description: 'Scoring schema not found' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateScoringSchemaDto,
  ) {
    return this.scoringService.update(user.sub, id, dto);
  }
}
