import { api } from '@/store/api';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  responseStatus?: number | null;
  responseBody?: string | null;
  durationMs?: number | null;
  error?: string | null;
  createdAt: string;
}

export const webhookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWebhooks: builder.query<Webhook[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/webhooks`,
      providesTags: (result, error, workspaceId) => [{ type: 'Webhook', id: `LIST-${workspaceId}` }],
    }),
    createWebhook: builder.mutation<Webhook, { workspaceId: string; url: string; events: string[] }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/webhooks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Webhook', id: `LIST-${workspaceId}` }],
    }),
    updateWebhook: builder.mutation<Webhook, { workspaceId: string; id: string; url?: string; events?: string[]; isActive?: boolean }>({
      query: ({ workspaceId, id, ...body }) => ({
        url: `/workspaces/${workspaceId}/webhooks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Webhook', id: `LIST-${workspaceId}` }],
    }),
    deleteWebhook: builder.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/workspaces/${workspaceId}/webhooks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Webhook', id: `LIST-${workspaceId}` }],
    }),
    getWebhookDeliveries: builder.query<WebhookDelivery[], { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => `/workspaces/${workspaceId}/webhooks/${id}/deliveries`,
      providesTags: (result, error, { id }) => [{ type: 'Webhook', id: `DELIVERIES-${id}` }],
    }),
  }),
});

export const {
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useGetWebhookDeliveriesQuery,
} = webhookApi;
