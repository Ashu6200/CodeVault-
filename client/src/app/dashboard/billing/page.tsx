'use client';

import { useGetSubscriptionQuery, useGetBillingHistoryQuery } from '@/features/billing/api';
import { CurrentPlanCard } from '@/components/billing/CurrentPlanCard';
import { PlanSelector } from '@/components/billing/PlanSelector';
import { PaymentHistoryTable } from '@/components/billing/PaymentHistoryTable';

// TODO: replace with workspace ID from router params or global store
const WORKSPACE_ID = 'default-workspace-id';

export default function BillingPage() {
  const { data: subscription, isLoading: subLoading } =
    useGetSubscriptionQuery(WORKSPACE_ID);

  const { data: historyData, isLoading: histLoading } =
    useGetBillingHistoryQuery(WORKSPACE_ID);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing &amp; Plans</h1>

      <CurrentPlanCard
        subscription={subscription}
        isLoading={subLoading}
        workspaceId={WORKSPACE_ID}
      />

      <PlanSelector
        currentPlan={subscription?.subscriptionPlan ?? 'FREE'}
        workspaceId={WORKSPACE_ID}
      />

      <PaymentHistoryTable
        transactions={historyData?.data ?? []}
        isLoading={histLoading}
      />
    </div>
  );
}
