import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';

/**
 * Middleware to set a timeout for requests.
 * Default is 30 seconds.
 */
export const requestTimeout = (seconds: number = 30) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        next(new AppError(`Request timeout after ${seconds}s`, 504, 'REQUEST_TIMEOUT'));
      }
    }, seconds * 1000);

    res.on('finish', () => clearTimeout(timeoutId));
    res.on('close', () => clearTimeout(timeoutId));

    next();
  };
};
