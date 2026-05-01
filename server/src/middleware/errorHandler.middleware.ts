import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';
import { ZodError } from 'zod';
import { logger } from '@infra/logger';

const log = logger.child('ErrorHandler');

// ─────────────────────────────────────────────
// Global Error Handler
// Handles: AppError, BetterAuth errors, Zod,
// Prisma, and unknown errors with consistent
// JSON responses and production-safe messages.
// ─────────────────────────────────────────────

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  const isAppError = err instanceof AppError;
  const isBetterAuthError = err?.name === 'BetterAuthError' || err?.name === 'APIError';
  const isZodError = err instanceof ZodError;
  const isPrismaError = err.code && typeof err.code === 'string' && err.code.startsWith('P');

  // ── Determine status code ──
  let statusCode = 500;
  if (isAppError) statusCode = err.statusCode;
  else if (isBetterAuthError) statusCode = err.status || err.statusCode || 400;
  else if (isZodError) statusCode = 400;
  else if (isPrismaError) statusCode = mapPrismaStatus(err.code);
  else if (err.statusCode) statusCode = err.statusCode;

  // ── Log the error ──
  log.error('Error caught', {
    message: err?.message,
    name: err?.name,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: err?.stack,
    ...(isAppError && err.code ? { errorCode: err.code } : {}),
    ...(isBetterAuthError && err.code ? { authCode: err.code } : {}),
  });

  // ── Build response ──
  const isProd = process.env.NODE_ENV === 'production';
  const mainMessage =
    statusCode >= 500
      ? 'We are having a temporary issue. Please try again in a moment.'
      : err.message;

  const response: Record<string, any> = {
    success: false,
    statusCode,
    message: mainMessage,
    data: null,
    details: {} as Record<string, any>,
  };

  // ── Attach context (dev only) ──
  if (!isProd) {
    response.request = {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      params: req.params,
    };
  }

  // ── Error-specific details ──

  // AppError with detailed context
  if (isAppError) {
    if (err.errors) {
      response.details.errors = err.errors;
    } else if ('details' in err && (err as any).details) {
      // Compatibility for older parts of the system
      response.details.errors = (err as any).details;
    }
  }

  // Better Auth error code
  if (isBetterAuthError) {
    response.details.code = err.code || null;
  }

  // Zod validation errors
  if (isZodError) {
    response.message = 'Validation failed';
    response.details.errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Prisma errors
  if (isPrismaError) {
    response.message = mapPrismaMessage(err);
  }

  // Dev-only stack trace
  if (!isProd) {
    response.details = {
      ...response.details,
      errorName: err.name,
      originalMessage: err.message,
      stack: err.stack,
    };
  } else {
    // Strip details in production if empty
    if (Object.keys(response.details).length === 0) {
      delete response.details;
    }
  }

  res.status(statusCode).json(response);
};

// ── Prisma status code mapping ──
function mapPrismaStatus(code: string): number {
  switch (code) {
    case 'P2002':
      return 409;
    case 'P2025':
      return 404;
    case 'P2003':
      return 400;
    default:
      return 400;
  }
}

// ── Prisma error message mapping ──
function mapPrismaMessage(err: any): string {
  switch (err.code) {
    case 'P2002':
      return `A record with that ${err.meta?.target?.join(', ') || 'value'} already exists`;
    case 'P2025':
      return 'Record not found';
    case 'P2003':
      return 'Related record not found';
    default:
      return 'Database error';
  }
}
