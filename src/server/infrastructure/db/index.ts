import 'server-only';
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
const SHUTDOWN_KEY = Symbol.for('app.prisma.shutdownHooksRegistered');

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


  // Prisma's $on overloads are keyed off the `log` generic, which is widened
  // away by our runtime-conditional array — hence the narrow local casts.
  type LogEvent = { message: string };
  type QueryEvent = { duration: number; query: string };
  const on = client.$on.bind(client) as unknown as (
    event: string,
    cb: (e: LogEvent & Partial<QueryEvent>) => void,
  ) => void;

  on('error', (e) => {
    log.error('Prisma error:', e.message);
  });

  on('warn', (e) => {
    log.warn('Prisma warning:', e.message);
  });

  // Log slow queries in development
  if (process.env.NODE_ENV === 'development') {
    on('query', (e) => {
      if ((e.duration ?? 0) > 100) {
        log.warn(`Slow query (${e.duration}ms): ${e.query}`);
      }
    });
  }

  return client;
}

// ── Singleton ──
//
// Built lazily. Config validation is lazy now, so constructing at import time
// would throw inside a module-evaluation context (including `next build`).
// Swallowing that failure into `prisma = null` would turn a missing
// DATABASE_URL into "Cannot read properties of null (reading 'user')" on every
// route, so the error is allowed to propagate with its original message.
function getPrisma(): PrismaClient {
  const g = globalThis as unknown as Record<symbol, unknown>;
  if (!g[PRISMA_KEY]) {
    g[PRISMA_KEY] = buildPrismaClient();
    g[CONNECT_KEY] = false;
    g[CONNECT_PROMISE_KEY] = null;
  }
  return g[PRISMA_KEY] as PrismaClient;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

/**
 * Connect to the database with retry logic.
 * Safe to call multiple times — only connects once.
 *
 * Prisma connects lazily on first query, so this is optional; it exists so a
 * server can fail fast at startup with a clear message instead of surfacing
 * connection errors on the first user request. Called from instrumentation.ts.
 */
export async function connectWithRetry(): Promise<void> {
  const g = globalThis as unknown as Record<symbol, unknown>;

  if (g[CONNECT_KEY]) return;
  if (g[CONNECT_PROMISE_KEY]) {
    return g[CONNECT_PROMISE_KEY] as Promise<void>;
  }

  g[CONNECT_PROMISE_KEY] = (async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        log.info(`Connecting to DB (attempt ${attempt}/${MAX_RETRIES})...`);
        await prisma.$connect();
        g[CONNECT_KEY] = true;
        g[CONNECT_PROMISE_KEY] = null;
        log.info(`✅ Prisma connected (attempt ${attempt}/${MAX_RETRIES})`);
        return;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error(`DB connection attempt ${attempt}/${MAX_RETRIES} failed:`, message);
        if (attempt === MAX_RETRIES) {
          g[CONNECT_PROMISE_KEY] = null;
          throw err;
        }
        log.info(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  })();

  return g[CONNECT_PROMISE_KEY] as Promise<void>;
}

/**
 * Graceful disconnect. Reads the singleton directly rather than through the
 * `prisma` proxy, so shutting down a process that never touched the database
 * does not construct a client just to disconnect it.
 */
async function disconnectPrisma(): Promise<void> {
  const g = globalThis as unknown as Record<symbol, unknown>;
  const client = g[PRISMA_KEY] as PrismaClient | undefined;
  if (!client) return;

  try {
    await client.$disconnect();
    g[CONNECT_KEY] = false;
    log.info('Prisma disconnected');
  } catch (err) {
    log.error('Prisma disconnect error:', err instanceof Error ? err.message : String(err));
  }
}

// Register shutdown hooks exactly once. Under Next.js this module is
// re-evaluated on HMR, and an unguarded process.on() would stack a new listener
// on every reload until Node emits MaxListenersExceededWarning.
const shutdownScope = globalThis as unknown as Record<symbol, unknown>;
if (!shutdownScope[SHUTDOWN_KEY]) {
  shutdownScope[SHUTDOWN_KEY] = true;
  process.on('SIGINT', disconnectPrisma);
  process.on('SIGTERM', disconnectPrisma);
}
