import { PaginatedResult, PaginationParams } from './types/common';

// ─────────────────────────────────────────────
// Base Repository
// Handles DB access only — no business logic
// ─────────────────────────────────────────────

export abstract class BaseRepository<T> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  /**
   * Find by ID, excluding soft-deleted records.
   * Assumes the model has a `deletedAt` field.
   */
  async findByIdActive(id: string): Promise<T | null> {
    return this.model.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      where?: any;
      orderBy?: any;
      include?: any;
    } = {},
  ): Promise<T[]> {
    return this.model.findMany(params);
  }

  /**
   * Paginated query with total count
   */
  async findPaginated(
    pagination: PaginationParams,
    where: any = {},
    include?: any,
  ): Promise<PaginatedResult<T>> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const orderBy = sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        ...(include ? { include } : {}),
      }),
      this.model.count({ where }),
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

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Soft delete — sets deletedAt to now
   */
  async softDelete(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where: any = {}): Promise<number> {
    return this.model.count({ where });
  }
}
