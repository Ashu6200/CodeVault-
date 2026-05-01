import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async express routes to catch errors and pass them to the next middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
