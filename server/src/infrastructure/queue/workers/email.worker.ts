import { Worker, Job } from 'bullmq';
import { redis } from '@infra/redis';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Email Worker
// Placeholder for transactional email delivery.
// Integrate with Resend, SendGrid, or Nodemailer.
// ─────────────────────────────────────────────

const log = logger.child('EmailWorker');

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const emailWorker = new Worker(
  'email',
  async (job: Job<EmailJobData>) => {
    const { to, subject, html } = job.data;

    log.info(`Processing email job ${job.id}: "${subject}" → ${to}`);

    // TODO: Integrate email provider
    // Example with Resend:
    // const resend = new Resend(config.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: job.data.from || 'CodeVault <noreply@codevault.app>',
    //   to,
    //   subject,
    //   html,
    // });

    log.info(`Email sent successfully to ${to}`);
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

emailWorker.on('completed', (job) => {
  log.debug(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  log.error(`Email job ${job?.id} failed: ${err.message}`);
});

export { emailWorker };
