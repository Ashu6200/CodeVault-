import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware to add a unique Request ID to every request.
 * Sets X-Request-Id header and attaches it to the request object.
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  
  // Set for request and response
  req.id = id;
  res.setHeader('X-Request-Id', id);
  
  next();
};

