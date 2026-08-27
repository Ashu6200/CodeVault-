import Redis from 'ioredis';
import { config } from '@infra/config';
import { logger } from '@infra/logger';

const log = logger.child('Redis');

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 4,
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
