import { AppError } from './errors';
import { logger } from '@infra/logger';
import { PaginatedResult, PaginationParams } from './types/common';

// ─────────────────────────────────────────────
// Base Service
// Contains business logic — no HTTP concerns
// ─────────────────────────────────────────────

/** Arguments paginate() passes through to a Prisma delegate. */
interface PaginateFindManyArgs {
  skip: number;
  take: number;
  orderBy: unknown;
  where?: unknown;
  include?: unknown;
  select?: unknown;
}


/**
 * The slice of a Prisma model delegate that paginate() actually uses.
 */
interface PaginableDelegate<TRecord> {
  findMany(args: PaginateFindManyArgs): Promise<TRecord[]>;
  count(args: { where?: unknown }): Promise<number>;
}

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
    model: unknown,
    pagination: PaginationParams,
    args: {
      where?: unknown;
      include?: unknown;
      select?: unknown;
      orderBy?: unknown;
    } = {},
  ): Promise<PaginatedResult<T>> {
    // Prisma delegates are generic enough that no structural interface matches
    // them all (their findMany args are model-specific), so the delegate is
    // accepted as `unknown` and narrowed here in one explicit place rather
    // than typing the parameter `any` and letting that leak to callers.
    const delegate = model as PaginableDelegate<T>;

    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const orderBy =
      args.orderBy || (sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' as const });

    const [data, total] = await Promise.all([
      delegate.findMany({
        skip,
        take: limit,
        orderBy,
        where: args.where,
        ...(args.include ? { include: args.include } : {}),
        ...(args.select ? { select: args.select } : {}),
      }),
      delegate.count({ where: args.where }),
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
