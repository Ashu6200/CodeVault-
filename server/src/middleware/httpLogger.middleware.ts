import { Request, Response, NextFunction } from 'express';
import { logger } from '@infra/logger';

const log = logger.child('HTTP');

/**
 * Middleware to log incoming HTTP requests with method, URL, and response time.
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      log.error(message);
    } else if (statusCode >= 400) {
      log.warn(message);
    } else {
      log.info(message);
    }
  });

  next();
};
