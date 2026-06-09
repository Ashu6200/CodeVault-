import app from './app';
import { createServer } from 'http';
import { config } from '@infra/config';
import { prisma, connectWithRetry } from '@infra/db';
import { redis } from '@infra/redis';

import SocketService from '@infra/socket/SocketService';

import '@infra/queue/workers/notification.worker';
import '@infra/queue/workers/webhook.worker';
import '@infra/queue/workers/email.worker';

import { registerWorkspaceEvents } from '@modules/workspace';
import { registerDocumentEvents } from '@modules/document';
import { registerCommentEvents } from '@modules/comment';
import { registerNotificationEvents } from '@modules/notification';
import { registerWebhookEvents } from '@modules/webhook';
import { AuditService } from '@modules/audit';


import { logger } from '@infra/logger';
const log = logger.child('Server');

const httpServer = createServer(app);

const socketService = new SocketService(httpServer);
app.set('io', socketService.io);

const startServer = async () => {
  try {
    await connectWithRetry();
    log.info('Connected to PostgreSQL');

    registerWorkspaceEvents();
    registerDocumentEvents();
    registerCommentEvents();
    registerNotificationEvents();
    registerWebhookEvents();

    const auditService = new AuditService();
    auditService.registerEventListeners();

    httpServer.listen(config.PORT, () => {
      log.info(`🚀 Server running on port ${config.PORT}`);
      log.info(`📡 Environment: ${config.NODE_ENV}`);
      log.info(`🔗 Health check: http://localhost:${config.PORT}/health`);
    });
  } catch (error) {
    log.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


const shutdown = async (signal: string) => {
  log.info(`Received ${signal}. Shutting down gracefully...`);

  httpServer.close(async () => {
    log.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      log.info('Database disconnected');

      await redis.quit();
      log.info('Redis disconnected');

      process.exit(0);
    } catch (error) {
      log.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    log.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason);
  process.exit(1);
});
