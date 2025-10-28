// src/config/queue.ts
import { Queue, Worker } from 'bullmq';
import { redis } from './redis';
import { MCQGenerationProcessor } from '../workers/mcqGenerationWorker';

export const MCQ_QUEUE_NAME = 'mcq-generation';

export const mcqQueue = new Queue(MCQ_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export const initializeWorkers = (): void => {
  new Worker(MCQ_QUEUE_NAME, MCQGenerationProcessor, {
    connection: redis,
    concurrency: 5,
  });
  
  console.log('Workers initialized');
};