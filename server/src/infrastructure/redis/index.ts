import Redis from 'ioredis';
import { config } from '@infra/config';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Redis Client
// ─────────────────────────────────────────────

const log = logger.child('Redis');

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
});

redis.on('error', (err) => {
  log.error('Connection error:', err);
});

redis.on('connect', () => {
  log.info('Connected to Redis');
});

redis.on('close', () => {
  log.warn('Connection closed');
});
