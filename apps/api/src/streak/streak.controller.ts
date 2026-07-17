import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StreakService } from './streak.service';
import { UseStreakFreezeDto } from './dto/use-streak-freeze.dto';

@ApiTags('Streak')
@ApiBearerAuth('access_token')
@Controller('streak')
@UseGuards(JwtAuthGuard)
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get the current student's study streak: current/longest streak, total study days, " +
      'freezes left this month, this week, and milestones. Computed from daily StudyActivity ' +
      'records (lesson engagement + live class attendance), not just login.',
  })
  @ApiResponse({ status: 200, description: 'Streak summary returned' })
  getStreak(@CurrentUser() user: AccessTokenPayload) {
    return this.streakService.getStreakSummary(user.sub);
  }

  @Post('use-freeze')
  @ApiOperation({
    summary:
      'Manually cover a missed day with a streak freeze (defaults to yesterday), subject to ' +
      'the monthly allowance',
  })
  @ApiResponse({ status: 201, description: 'Freeze applied' })
  @ApiResponse({ status: 400, description: 'Day already counts, already frozen, or no freezes left' })
  useFreeze(@CurrentUser() user: AccessTokenPayload, @Body() dto: UseStreakFreezeDto) {
    return this.streakService.useFreeze(user.sub, dto);
  }
}
