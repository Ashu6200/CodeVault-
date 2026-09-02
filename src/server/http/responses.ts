import 'server-only';
import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────
// API response helpers
//
// Replaces the Express `apiResponse()` + `BaseController.sendSuccess/
// sendPaginated`. The JSON envelope is preserved exactly so existing API
// consumers see no change:
//
//   { success, statusCode, message, data }
//
// One deliberate difference from the Express version: it echoed the entire
// request (method, url, query, params AND body) back in every non-production
// response, which leaked submitted passwords on auth routes. That is dropped.
// ─────────────────────────────────────────────

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/** Paginated shape produced by `BaseService.paginate`. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Success response.
 *
 * `ok(data)` → 200 "Success"
 * `ok(data, 201)` → 201 "Success"
 * `ok(data, 'Created', 201)` → 201 "Created"
 */
export function ok<T>(
  data: T,
  statusCodeOrMessage: number | string = 200,
  statusCode = 200,
): NextResponse<ApiEnvelope<T>> {
  const isNumber = typeof statusCodeOrMessage === 'number';
  const finalStatus = isNumber ? statusCodeOrMessage : statusCode;
  const finalMessage = isNumber ? 'Success' : statusCodeOrMessage;

  return NextResponse.json(
    { success: true, statusCode: finalStatus, message: finalMessage, data },
    { status: finalStatus },
  );
}

/**
 * Paginated success response.
 *
 * Preserves the nested shape the Express `sendPaginated` produced:
 *   data: { data: [...], meta: { total, page, limit, totalPages, hasMore } }
 */
export function paginated<T>(
  result: PaginatedResult<T>,
  message = 'Success',
  statusCode = 200,
): NextResponse<ApiEnvelope<{ data: T[]; meta: Omit<PaginatedResult<T>, 'data'> }>> {
  const { data, ...meta } = result;

  return NextResponse.json(
    { success: true, statusCode, message, data: { data, meta } },
    { status: statusCode },
  );
}
