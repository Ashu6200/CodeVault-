/**
 * Base Application Error
 * Enhanced with production-grade context: success flag,
 * error details, and stack trace management.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly success: boolean;
  public readonly errors: unknown;

  constructor(
    message: string = 'Unexpected error occurred',
    statusCode: number = 500,
    code: string = 'APP_ERROR',
    errors: unknown = null,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.success = false;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    // Maintain prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace, excluding the constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/** 404 Not Found */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

/** 403 Forbidden */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 401 Unauthorized */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 400 Validation Error */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors: unknown = null) {
    super(message, 400, 'VALIDATION_ERROR', errors);
  }
}

/** 409 Conflict */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}
