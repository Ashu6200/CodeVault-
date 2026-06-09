import { api } from '@/store/api';

export interface Subscription {
  subscriptionPlan: 'FREE' | 'TEAM' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | null;
  subscriptionPeriodEnd: string | null;
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string | null;
  seatLimit: number | null;
}

export interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  razorpayPaymentId: string | null;
  planSnapshot: string | null;
  createdAt: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

export const billingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query<Subscription, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/billing/subscription`,
      providesTags: (_result, _error, workspaceId) => [
        { type: 'Billing', id: `SUB-${workspaceId}` },
      ],
    }),
    getBillingHistory: builder.query<{ data: BillingHistory[]; meta: unknown }, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/billing/history`,
      providesTags: (_result, _error, workspaceId) => [
        { type: 'Billing', id: `HISTORY-${workspaceId}` },
      ],
    }),
    createSubscription: builder.mutation<
      CreateSubscriptionResponse,
      { workspaceId: string; plan: 'TEAM' | 'ENTERPRISE' }
    >({
      query: ({ workspaceId, plan }) => ({
        url: `/workspaces/${workspaceId}/billing/create-subscription`,
        method: 'POST',
        body: { plan },
      }),
    }),
    verifyPayment: builder.mutation<
      { verified: boolean },
      { workspaceId: string } & VerifyPaymentPayload
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/billing/verify-payment`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'Billing', id: `SUB-${workspaceId}` },
        { type: 'Billing', id: `HISTORY-${workspaceId}` },
      ],
    }),
    cancelSubscription: builder.mutation<
      { cancelled: boolean; cancelAtPeriodEnd: boolean },
      { workspaceId: string; cancelAtPeriodEnd?: boolean }
    >({
      query: ({ workspaceId, cancelAtPeriodEnd = true }) => ({
        url: `/workspaces/${workspaceId}/billing/cancel-subscription`,
        method: 'POST',
        body: { cancelAtPeriodEnd },
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'Billing', id: `SUB-${workspaceId}` },
      ],
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useGetBillingHistoryQuery,
  useCreateSubscriptionMutation,
  useVerifyPaymentMutation,
  useCancelSubscriptionMutation,
} = billingApi;
