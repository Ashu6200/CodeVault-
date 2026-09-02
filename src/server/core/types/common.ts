// ─────────────────────────────────────────────
// Shared Types & Interfaces
// ─────────────────────────────────────────────

/** Pagination query params */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Paginated result produced by BaseService.paginate */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
