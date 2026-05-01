import { api } from '@/store/api';

export interface Subscription {
  id: string;
  status: string;
  planId: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
}

export interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string | null;
  createdAt: string;
}

export const billingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query<Subscription, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/billing/subscription`,
      providesTags: (result, error, workspaceId) => [{ type: 'Billing', id: `SUB-${workspaceId}` }],
    }),
    getBillingHistory: builder.query<BillingHistory[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/billing/history`,
      providesTags: (result, error, workspaceId) => [{ type: 'Billing', id: `HISTORY-${workspaceId}` }],
    }),
  }),
});

export const { useGetSubscriptionQuery, useGetBillingHistoryQuery } = billingApi;
