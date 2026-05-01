console.log('DEBUG: server.ts ENTRY'); process.exit(0);
import app from './app';
import { createServer } from 'http';
import { config } from '@infra/config';
console.log('DEBUG: config loaded');
import { prisma, connectWithRetry } from '@infra/db';
console.log('DEBUG: db loaded');
import { redis } from '@infra/redis';
console.log('DEBUG: redis loaded');

import SocketService from '@infra/socket/SocketService';

// import '@infra/queue/workers/notification.worker';
// import '@infra/queue/workers/webhook.worker';
// import '@infra/queue/workers/email.worker';

import { registerWorkspaceEvents } from '@modules/workspace';
import { registerDocumentEvents } from '@modules/document';
import { registerCommentEvents } from '@modules/comment';
import { registerNotificationEvents } from '@modules/notification';
import { registerWebhookEvents } from '@modules/webhook';
import { AuditService } from '@modules/audit';

// ─────────────────────────────────────────────
// Server Startup
// ─────────────────────────────────────────────

import { logger } from '@infra/logger';
const log = logger.child('Server');
log.info('ENTRY POINT: server.ts is starting...');
log.info('Creating HTTP server...');
const httpServer = createServer(app);

// Initialize Socket.io
log.info('Initializing SocketService...');
const socketService = new SocketService(httpServer);
log.info('SocketService initialized');
app.set('io', socketService.io);

const startServer = async () => {
  try {
    // 1. Connect to database (with retry)
    log.info('SKIPPING DB CONNECTION FOR DEBUG');
    // await connectWithRetry();
    // log.info('✅ Connected to PostgreSQL');

    // 2. Register domain event listeners
    registerWorkspaceEvents();
    registerDocumentEvents();
    registerCommentEvents();
    registerNotificationEvents();
    registerWebhookEvents();

    // 3. Register audit event listeners (auto-logs all domain events)
    const auditService = new AuditService();
    auditService.registerEventListeners();

    // 4. Start HTTP server
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

// ─────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────

const shutdown = async (signal: string) => {
  log.info(`Received ${signal}. Shutting down gracefully...`);

  httpServer.close(async () => {
    log.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      log.info('Database disconnected');

      redis.quit();
      log.info('Redis disconnected');

      process.exit(0);
    } catch (error) {
      log.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    log.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason);
  process.exit(1);
});
