import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AI_JOBS_QUEUE, AiJobsQueueData } from './queue.constants';

@Injectable()
export class AiJobsQueueService {
  constructor(
    @InjectQueue(AI_JOBS_QUEUE) private readonly queue: Queue<AiJobsQueueData>,
    private readonly prisma: PrismaService,
  ) {}

  /** Enqueues a demo job for exercising the queue pipeline end to end. */
  async enqueueDemoJob(requestedById: string, kind: AiJobsQueueData['kind']) {
    const aiJob = await this.prisma.aiJob.create({
      data: { type: 'TUTOR_CHAT', status: 'PENDING', requestedById },
    });

    const job = await this.queue.add('demo', { aiJobId: aiJob.id, kind });

    return { aiJobId: aiJob.id, bullJobId: job.id };
  }
}
