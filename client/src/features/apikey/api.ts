import { api } from '@/store/api';

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only returned on creation
  scopes: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export const apiKeyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listApiKeys: builder.query<ApiKey[], void>({
      query: () => '/api-keys',
      providesTags: ['ApiKey'],
    }),
    createApiKey: builder.mutation<ApiKey, { name: string; scopes: string[]; expiresInDays?: number }>({
      query: (body) => ({
        url: '/api-keys',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ApiKey'],
    }),
    revokeApiKey: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api-keys/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApiKey'],
    }),
  }),
});

export const {
  useListApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} = apiKeyApi;
