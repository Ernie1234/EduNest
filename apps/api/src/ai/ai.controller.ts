import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI')
@ApiBearerAuth('access_token')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('jobs')
  @ApiOperation({ summary: "List the current user's AI job history (summaries, transcriptions, etc.)" })
  @ApiResponse({ status: 200, description: 'AI jobs returned' })
  listMyJobs(@CurrentUser() user: AccessTokenPayload) {
    return this.aiService.listJobsForUser(user.sub);
  }
}
