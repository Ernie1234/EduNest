export const AI_JOBS_QUEUE = 'ai-jobs';

export interface AiJobsQueueData {
  aiJobId: string;
  kind: 'echo' | 'always-fails';
}
