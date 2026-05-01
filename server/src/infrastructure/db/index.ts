import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '@infra/logger';
import { config } from '@infra/config';




// ─────────────────────────────────────────────
// Prisma Client Singleton
// Production-grade with:
//   - Connection retry logic (3 attempts)
//   - Slow query logging in development
//   - Graceful shutdown hooks
// ─────────────────────────────────────────────

const log = logger.child('Prisma');
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const PRISMA_KEY = Symbol.for('app.prisma.client');
const CONNECT_KEY = Symbol.for('app.prisma.connected');
const CONNECT_PROMISE_KEY = Symbol.for('app.prisma.connectingPromise');

function buildPrismaClient(): PrismaClient {
  const connectionString = config.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'warn', emit: 'event' },
          ]
        : [
            { level: 'error', emit: 'event' },
            { level: 'warn', emit: 'event' },
          ],
  });


  (client.$on as any)('error', (e: any) => {
    log.error('Prisma error:', e.message);
  });

  (client.$on as any)('warn', (e: any) => {
    log.warn('Prisma warning:', e.message);
  });

  // Log slow queries in development
  if (process.env.NODE_ENV === 'development') {
    (client.$on as any)('query', (e: any) => {
      if (e.duration > 100) {
        log.warn(`Slow query (${e.duration}ms): ${e.query}`);
      }
    });
  }

  return client;
}

// ── Singleton ──
if (!(globalThis as any)[PRISMA_KEY]) {
  try {
    (globalThis as any)[PRISMA_KEY] = buildPrismaClient();
  } catch (err: any) {
    log.error(`Failed to build Prisma client: ${err.message}`);
    (globalThis as any)[PRISMA_KEY] = null;
  }
  (globalThis as any)[CONNECT_KEY] = false;
  (globalThis as any)[CONNECT_PROMISE_KEY] = null;
}

export const prisma: PrismaClient = (globalThis as any)[PRISMA_KEY];

/**
 * Connect to the database with retry logic.
 * Safe to call multiple times — only connects once.
 */
export async function connectWithRetry(): Promise<void> {
  if (!prisma) {
    throw new Error('Prisma client is not available — check DATABASE_URL');
  }

  if ((globalThis as any)[CONNECT_KEY]) return;

  if ((globalThis as any)[CONNECT_PROMISE_KEY]) {
    return (globalThis as any)[CONNECT_PROMISE_KEY];
  }

  (globalThis as any)[CONNECT_PROMISE_KEY] = (async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        log.info(`Connecting to DB (attempt ${attempt}/${MAX_RETRIES})...`);
        await prisma.$connect();
        (globalThis as any)[CONNECT_KEY] = true;
        (globalThis as any)[CONNECT_PROMISE_KEY] = null;
        log.info(`✅ Prisma connected (attempt ${attempt}/${MAX_RETRIES})`);
        return;
      } catch (err: any) {
        log.error(`DB connection attempt ${attempt}/${MAX_RETRIES} failed:`, err.message);
        if (attempt === MAX_RETRIES) {
          (globalThis as any)[CONNECT_PROMISE_KEY] = null;
          throw err;
        }
        log.info(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  })();

  return (globalThis as any)[CONNECT_PROMISE_KEY];
}

/**
 * Graceful disconnect
 */
async function disconnectPrisma(): Promise<void> {
  try {
    if (prisma) {
      await prisma.$disconnect();
      (globalThis as any)[CONNECT_KEY] = false;
      log.info('Prisma disconnected');
    }
  } catch (err: any) {
    log.error('Prisma disconnect error:', err.message);
  }
}

process.on('SIGINT', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);
