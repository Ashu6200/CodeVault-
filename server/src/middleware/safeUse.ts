import { Express, Router, Request, Response, NextFunction } from 'express';

/**
 * A wrapper for app.use that ensures any errors in the route mounting
 * or initial middleware execution are caught.
 */
export const safeUse = (app: Express, path: string, ...handlers: any[]) => {
  try {
    app.use(path, ...handlers);
  } catch (error) {
    console.error(`Failed to mount route at ${path}:`, error);
  }
};
