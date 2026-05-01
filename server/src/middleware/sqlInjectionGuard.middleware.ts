import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';

/**
 * Middleware to detect and block common SQL injection patterns.
 */
export const sqlInjectionGuard = (req: Request, _res: Response, next: NextFunction) => {
  const sqlPattern =
    /UNION\s+SELECT|INSERT\s+INTO|UPDATE\s+.*SET|DELETE\s+FROM|DROP\s+TABLE|OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i;

  const dataToCheck = [
    req.url,
    JSON.stringify(req.body),
    JSON.stringify(req.query),
    JSON.stringify(req.params),
  ].join(' ');

  if (sqlPattern.test(dataToCheck)) {
    return next(new AppError('Potential SQL injection detected', 400, 'SECURITY_BLOCK'));
  }

  next();
};
