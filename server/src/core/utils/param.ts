// ─────────────────────────────────────────────
// Express 5 Param Helper
// Express 5 types params as string | string[].
// Our API always uses single string params. This
// helper provides a type-safe extraction.
// ─────────────────────────────────────────────

import { Request } from 'express';

/**
 * Safely extract a route param as a string.
 * Handles Express 5's `string | string[]` typing.
 */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value as string;
}
