import { Request, Response, NextFunction } from 'express';
import { redis } from '@infra/redis';
import { config } from '@infra/config';
import { logger } from '@infra/logger';

const log = logger.child('RateLimiter');

// ─────────────────────────────────────────────
// Redis Sliding Window Rate Limiter
// Supports IP bypass, per-user, and per-route keys.
// ─────────────────────────────────────────────

const BYPASS_IPS = config.RATE_LIMIT_BYPASS_IPS
  ? config.RATE_LIMIT_BYPASS_IPS.split(',').map((s: string) => s.trim())
  : [];

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Optional key prefix for route-specific limiting */
  keyPrefix?: string;
  /** Use user ID instead of IP (requires auth) */
  byUser?: boolean;
}

export const rateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Build identifier
      const ip = req.ip || 'unknown';

      // Bypass configured IPs
      if (BYPASS_IPS.includes(ip)) return next();

      let identifier: string;
      if (options.byUser && req.user) {
        identifier = req.user.id;
      } else {
        identifier = ip;
      }

      const prefix = options.keyPrefix || req.baseUrl + req.path;
      const key = `rl:${prefix}:${identifier}`;

      const currentCount = await redis.incr(key);

      if (currentCount === 1) {
        await redis.expire(key, options.windowSeconds);
      }

      // Set standard rate limit headers
      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', options.limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - currentCount));
      res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + ttl);

      if (currentCount > options.limit) {
        res.setHeader('Retry-After', ttl);
        res.status(429).json({
          success: false,
          statusCode: 429,
          message: 'Too many requests. Please try again later.',
          data: null,
        });
        return;
      }

      next();
    } catch (error) {
      log.error('Rate limiter error (failing open):', error);
      // Fail open — don't block requests if Redis is down
      next();
    }
  };
};

// ─────────────────────────────────────────────
// Global Rate Limiter (100 req/min per IP)
// Can be used directly as app.use(globalRateLimiter)
// ─────────────────────────────────────────────

export const globalRateLimiter = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ip = req.ip || 'unknown';

    if (BYPASS_IPS.includes(ip)) return next();

    const key = `rl:global:${ip}`;
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, 60);
    }

    if (currentCount > 100) {
      _res.status(429).json({
        success: false,
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
        data: null,
      });
      return;
    }

    next();
  } catch (error) {
    log.error('Global rate limiter error (failing open):', error);
    next();
  }
};
