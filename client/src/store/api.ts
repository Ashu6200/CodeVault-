import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    // In a real app, this might include credentials: 'include' or auth headers
  }),
  tagTypes: [
    'User',
    'Workspace',
    'Document',
    'Notification',
    'Comment',
    'ApiKey',
    'Webhook',
    'Audit',
    'Billing',
  ],
  endpoints: () => ({}),
});
