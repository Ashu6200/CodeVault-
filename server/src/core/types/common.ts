// ─────────────────────────────────────────────
// Shared Types & Interfaces
// ─────────────────────────────────────────────

/** Standard API response envelope */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: ResponseMeta;
}

/** Pagination metadata for list responses */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
}

/** Pagination query params */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Paginated result from repository */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/** Domain event structure */
export interface DomainEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  actorId?: string;
  workspaceId?: string;
}
