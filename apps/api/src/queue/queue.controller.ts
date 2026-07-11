import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiJobsQueueService } from './ai-jobs-queue.service';
import type { AccessTokenPayload } from '@workspace/types';

@ApiTags('Queue')
@ApiBearerAuth('access_token')
@Controller('queue')
export class QueueController {
  constructor(private readonly aiJobsQueue: AiJobsQueueService) {}

  @Post('sample')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Enqueue a demo job that succeeds, to exercise the queue pipeline' })
  @ApiResponse({ status: 201, description: 'Job enqueued' })
  enqueueSample(@CurrentUser() user: AccessTokenPayload) {
    return this.aiJobsQueue.enqueueDemoJob(user.sub, 'echo');
  }

  @Post('sample-failing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Enqueue a demo job that always fails, to exercise the retry policy and failure logging' })
  @ApiResponse({ status: 201, description: 'Job enqueued' })
  enqueueSampleFailing(@CurrentUser() user: AccessTokenPayload) {
    return this.aiJobsQueue.enqueueDemoJob(user.sub, 'always-fails');
  }
}
