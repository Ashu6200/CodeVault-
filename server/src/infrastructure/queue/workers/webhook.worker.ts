import { Worker, Job } from 'bullmq';
import { redis } from '@infra/redis';
import { prisma } from '@infra/db';
import { logger } from '@infra/logger';
import { WebhookDeliveryStatus } from '@prisma/client';
import crypto from 'crypto';

// ─────────────────────────────────────────────
// Webhook Worker
// Delivers webhook payloads to registered endpoints.
// Features:
//   - HMAC signature verification
//   - Exponential backoff retries (configured in queue)
//   - Delivery logging with response capture
// ─────────────────────────────────────────────

const log = logger.child('WebhookWorker');

interface WebhookJobData {
  deliveryId: string;
  endpointUrl: string;
  secret: string;
  event: string;
  payload: Record<string, any>;
}

const webhookWorker = new Worker(
  'webhook',
  async (job: Job<WebhookJobData>) => {
    const { deliveryId, endpointUrl, secret, event, payload } = job.data;

    log.info(`Processing webhook delivery ${deliveryId} to ${endpointUrl}`);

    // Update attempt count
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: { attemptCount: { increment: 1 } },
    });

    // Generate HMAC signature
    const body = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Delivery': deliveryId,
        },
        body,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      const responseBody = await response.text().catch(() => '');
      const status: WebhookDeliveryStatus = response.ok ? 'SUCCESS' : 'FAILED';

      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status,
          responseCode: response.status,
          responseBody: responseBody.substring(0, 1000), // Cap stored response
          deliveredAt: response.ok ? new Date() : undefined,
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${responseBody.substring(0, 200)}`);
      }

      log.info(`Webhook delivered successfully: ${deliveryId}`);
    } catch (error: any) {
      log.error(`Webhook delivery failed for ${deliveryId}: ${error.message}`);

      // Update delivery status on final failure
      if (job.attemptsMade >= (job.opts.attempts || 5) - 1) {
        await prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: { status: 'FAILED' },
        });
      }

      throw error; // Re-throw so BullMQ handles retry
    }
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

webhookWorker.on('completed', (job) => {
  log.debug(`Webhook job ${job.id} completed`);
});

webhookWorker.on('failed', (job, err) => {
  log.error(`Webhook job ${job?.id} failed: ${err.message}`);
});

export { webhookWorker };
