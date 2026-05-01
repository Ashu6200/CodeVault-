import { AppError } from './errors';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Base Service
// Contains business logic — no HTTP concerns
// ─────────────────────────────────────────────

export abstract class BaseService {
  /**
   * Catches unknown errors and re-throws as AppError.
   * Known AppErrors are re-thrown as-is.
   */
  protected handleError(error: unknown, defaultMessage: string = 'An error occurred'): never {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Unexpected error in service:', error);
    throw new AppError(defaultMessage, 500);
  }
}
