import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AI_JOBS_QUEUE, AiJobsQueueData } from './queue.constants';

@Processor(AI_JOBS_QUEUE)
export class AiJobsProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AiJobsQueueData>): Promise<{ echoedAt: string }> {
    await this.prisma.aiJob.update({
      where: { id: job.data.aiJobId },
      data: { status: 'PROCESSING', attempts: job.attemptsMade },
    });

    if (job.data.kind === 'always-fails') {
      throw new Error('Simulated failure for retry-policy demonstration');
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    return { echoedAt: new Date().toISOString() };
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<AiJobsQueueData>) {
    await this.prisma.aiJob.update({
      where: { id: job.data.aiJobId },
      data: { status: 'COMPLETED', resultText: 'Demo job completed successfully.' },
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<AiJobsQueueData> | undefined, error: Error) {
    if (!job) return;

    const maxAttempts = job.opts.attempts ?? 1;
    const exhausted = job.attemptsMade >= maxAttempts;

    await this.prisma.aiJob.update({
      where: { id: job.data.aiJobId },
      data: {
        attempts: job.attemptsMade,
        error: error.message,
        status: exhausted ? 'FAILED' : 'PENDING',
      },
    });
  }
}
