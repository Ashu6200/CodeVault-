import { Worker, Job } from 'bullmq';
import { redis } from '@infra/redis';
import { prisma } from '@infra/db';
import { logger } from '@infra/logger';
import { getUserNs } from '@infra/socket';

// ─────────────────────────────────────────────
// Notification Worker
// Processes notification jobs:
//   1. Persists notification to DB
//   2. Emits real-time event via /user namespace
// ─────────────────────────────────────────────

const log = logger.child('NotificationWorker');

interface NotificationJobData {
  userId: string;
  workspaceId: string;
  type: string;
  payload?: Record<string, any>;
}

const notificationWorker = new Worker(
  'notification',
  async (job: Job<NotificationJobData>) => {
    const { userId, workspaceId, type, payload } = job.data;

    log.info(`Processing notification job ${job.id} for user ${userId}`);

    // 1. Persist to database
    const notification = await prisma.notification.create({
      data: {
        userId,
        workspaceId,
        type,
        payload: payload || {},
      },
    });

    // 2. Emit via /user namespace to user's personal room
    try {
      const userNs = getUserNs();
      userNs.to(`user:${userId}`).emit('notification:new', {
        id: notification.id,
        type: notification.type,
        payload: notification.payload,
        workspaceId: notification.workspaceId,
        isRead: false,
        createdAt: notification.createdAt,
      });
    } catch (socketError) {
      log.warn(
        'Socket.io /user namespace not available, skipping real-time delivery:',
        socketError,
      );
    }

    return notification;
  },
  {
    connection: redis,
    concurrency: 10,
  },
);

notificationWorker.on('completed', (job) => {
  log.debug(`Notification job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  log.error(`Notification job ${job?.id} failed: ${err.message}`);
});

export { notificationWorker };
