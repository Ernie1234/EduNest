import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AI_JOBS_QUEUE } from './queue.constants';
import { AiJobsQueueService } from './ai-jobs-queue.service';
import { AiJobsProcessor } from './ai-jobs.processor';
import { QueueController } from './queue.controller';

/**
 * Retry policy: 3 attempts total, exponential backoff starting at 2s (2s, 4s, 8s).
 * After attempts are exhausted, `AiJobsProcessor`'s `failed` handler marks the
 * corresponding `AiJob` row as FAILED with the error message — Postgres (not a
 * second Redis queue) is the dead-letter/log sink so failures stay queryable.
 */
@Module({
  imports: [
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.getOrThrow<string>('REDIS_URL') },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: AI_JOBS_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 60 * 60 * 24 },
        removeOnFail: { age: 60 * 60 * 24 * 7 },
      },
    }),
  ],
  controllers: [QueueController],
  providers: [AiJobsQueueService, AiJobsProcessor],
  exports: [AiJobsQueueService],
})
export class QueueModule {}
