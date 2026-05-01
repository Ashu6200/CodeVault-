import { Request, Response, NextFunction } from 'express';
import { auth } from '@infra/auth';
import { prisma } from '@infra/db';
import { UnauthorizedError } from '@core/errors';
import { logger } from '@infra/logger';
import crypto from 'crypto';

const log = logger.child('AuthMiddleware');

// ─────────────────────────────────────────────
// Session-based Auth Middleware (Better Auth)
// ─────────────────────────────────────────────

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session || !session.user) {
      throw new UnauthorizedError('Please log in to continue');
    }

    // Check if user is soft-deleted
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deletedAt: true },
    });

    if (user?.deletedAt) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    req.user = session.user as any;
    req.session = session.session as any;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    log.error('Auth middleware error:', error);
    next(new UnauthorizedError('Authentication failed'));
  }
};

// ─────────────────────────────────────────────
// API Key Auth Middleware
// Validates Bearer token from Authorization header.
// Checks hash, expiry, revocation, and scopes.
// ─────────────────────────────────────────────

export const requireApiKey = (requiredScopes?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('API key required');
      }

      const apiKey = authHeader.substring(7); // Remove "Bearer "
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

      const storedKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { user: true },
      });

      if (!storedKey) {
        throw new UnauthorizedError('Invalid API key');
      }

      // Check revocation
      if (storedKey.revokedAt) {
        throw new UnauthorizedError('API key has been revoked');
      }

      // Check expiry
      if (storedKey.expiresAt && storedKey.expiresAt < new Date()) {
        throw new UnauthorizedError('API key has expired');
      }

      // Check scopes
      if (requiredScopes && requiredScopes.length > 0) {
        const hasAllScopes = requiredScopes.every((scope) => storedKey.scopes.includes(scope));
        if (!hasAllScopes) {
          throw new UnauthorizedError(
            `API key missing required scopes: ${requiredScopes.join(', ')}`,
          );
        }
      }

      // Update last used timestamp (fire-and-forget)
      prisma.apiKey
        .update({
          where: { id: storedKey.id },
          data: { lastUsed: new Date() },
        })
        .catch(() => {}); // Non-blocking

      // Inject user from API key
      req.user = storedKey.user as any;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return next(error);
      }
      next(new UnauthorizedError('API key validation failed'));
    }
  };
};

// ─────────────────────────────────────────────
// Combined Auth — accepts session OR API key
// ─────────────────────────────────────────────

export const requireAuthOrApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // If Bearer token, try API key auth
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireApiKey()(req, res, next);
  }

  // Otherwise, try session auth
  return requireAuth(req, res, next);
};
