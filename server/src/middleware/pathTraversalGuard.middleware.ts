import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';

/**
 * Middleware to prevent Path Traversal attacks.
 * Blocks requests containing '../', '..\\', etc.
 */
export const pathTraversalGuard = (req: Request, _res: Response, next: NextFunction) => {
  let decodedUrl = req.url;
  let previousUrl: string;

  // Decode iteratively until stable to prevent double-encoding bypasses
  do {
    previousUrl = decodedUrl;
    try {
      decodedUrl = decodeURIComponent(decodedUrl);
    } catch {
      break;
    }
  } while (decodedUrl !== previousUrl);

  const pathTraversalPattern = /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i;

  const isMalicious =
    pathTraversalPattern.test(req.url) ||
    pathTraversalPattern.test(decodedUrl) ||
    pathTraversalPattern.test(JSON.stringify(req.body));

  if (isMalicious) {
    return next(new AppError('Malicious path detected', 400, 'SECURITY_BLOCK'));
  }


  next();
};
