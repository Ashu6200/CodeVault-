import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';

/**
 * Middleware to prevent Path Traversal attacks.
 * Blocks requests containing '../', '..\\', etc.
 */
export const pathTraversalGuard = (req: Request, _res: Response, next: NextFunction) => {
  const url = decodeURIComponent(req.url);
  const pathTraversalPattern = /(\.\.\/|\.\.\\)/;

  if (pathTraversalPattern.test(url) || pathTraversalPattern.test(JSON.stringify(req.body))) {
    return next(new AppError('Malicious path detected', 400, 'SECURITY_BLOCK'));
  }

  next();
};
