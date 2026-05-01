import { Queue } from 'bullmq';
import { redis } from '@infra/redis';

// ─────────────────────────────────────────────
// BullMQ Queue Definitions
// ─────────────────────────────────────────────

const defaultOpts = { connection: redis };

/** Queue for sending transactional emails */
export const emailQueue = new Queue('email', defaultOpts);

/** Queue for delivering webhook payloads with retry */
export const webhookQueue = new Queue('webhook', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s, then 10s, 20s, 40s, 80s
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
});

/** Queue for processing and storing notifications */
export const notificationQueue = new Queue('notification', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 50,
  },
});
