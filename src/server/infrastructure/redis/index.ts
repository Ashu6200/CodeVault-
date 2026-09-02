import 'server-only';
import Redis from 'ioredis';
import { config } from '@infra/config';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Redis singleton
//
// Used for Better Auth session storage (ba:*), API rate limiting (rl:*)
// and the document cache (doc:*).
//
// The connection is created LAZILY. The Express version connected at import
// time, which under Next.js would open a socket from every build worker during
// "Collecting page data" and keep the event loop alive when Redis is
// unreachable. A Proxy keeps every call site (`redis.get(...)`) unchanged.
// ─────────────────────────────────────────────

const log = logger.child('Redis');
const REDIS_KEY = Symbol.for('app.redis.client');

function buildRedis(): Redis {
  const client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 4,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  client.on('error', (err) => {
    log.error('Connection error:', err);
  });

  client.on('connect', () => {
    log.info('Connected to Redis');
  });

  client.on('close', () => {
    log.warn('Connection closed');
  });

  return client;
}

function getRedis(): Redis {
  const g = globalThis as unknown as Record<symbol, Redis | undefined>;
  if (!g[REDIS_KEY]) {
    g[REDIS_KEY] = buildRedis();
  }
  return g[REDIS_KEY]!;
}

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedis();
    const value = client[prop as keyof Redis];
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
