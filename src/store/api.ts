import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// The API lives in this same Next.js app now, so requests are same-origin and
// a relative base URL is all that is needed. `fetch` defaults to
// `credentials: 'same-origin'`, which is what actually carries the Better Auth
// session cookie — it never worked when the API was on a separate origin.
const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api' });

/**
 * Every Route Handler wraps its payload in the API envelope:
 *
 *   { success, statusCode, message, data }
 *
 * The endpoint definitions are all typed against the bare payload, so unwrap
 * `data` once here rather than adding `transformResponse` to 40+ endpoints.
 * Responses without the envelope (e.g. Better Auth) are passed through as-is.
 */
export const baseQueryWithEnvelope: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiCtx, extraOptions) => {
  const result = await rawBaseQuery(args, apiCtx, extraOptions);

  if (result.data && typeof result.data === 'object') {
    const body = result.data as Record<string, unknown>;
    if ('success' in body && 'statusCode' in body && 'data' in body) {
      return { ...result, data: body.data };
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithEnvelope,
  tagTypes: [
    'User',
    'Workspace',
    'Document',
    'Notification',
    'Comment',
    'ApiKey',
    'Audit',
    'Billing',
  ],
  endpoints: () => ({}),
});
