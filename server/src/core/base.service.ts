import { AppError } from './errors';
import { logger } from '@infra/logger';
import { PaginatedResult, PaginationParams } from './types/common';

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

  /**
   * Generic offset-based pagination helper for Prisma models.
   */
  protected async paginate<T>(
    model: any,
    pagination: PaginationParams,
    args: {
      where?: any;
      include?: any;
      select?: any;
      orderBy?: any;
    } = {},
  ): Promise<PaginatedResult<T>> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const orderBy = args.orderBy || (sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' as const });

    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        orderBy,
        where: args.where,
        ...(args.include ? { include: args.include } : {}),
        ...(args.select ? { select: args.select } : {}),
      }),
      model.count({ where: args.where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }
}

