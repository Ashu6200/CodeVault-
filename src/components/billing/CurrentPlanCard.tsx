'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Subscription } from '@/features/billing/api';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';

interface Props {
  subscription?: Subscription | null;
  isLoading: boolean;
  workspaceId: string;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PAST_DUE: 'Past Due',
  CANCELED: 'Canceled',
  INCOMPLETE: 'Incomplete',
};

export function CurrentPlanCard({ subscription, isLoading, workspaceId }: Props) {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  const plan = subscription?.subscriptionPlan ?? 'FREE';
  const status = subscription?.subscriptionStatus;
  const periodEnd = subscription?.subscriptionPeriodEnd
    ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-2xl font-bold">{plan}</p>
        {status && (
          <p className="text-sm text-muted-foreground">
            Status: {STATUS_LABELS[status] ?? status}
          </p>
        )}
        {periodEnd && (
          <p className="text-sm text-muted-foreground">Next billing date: {periodEnd}</p>
        )}
        {subscription?.seatLimit != null && (
          <p className="text-sm text-muted-foreground">
            Seat limit: {subscription.seatLimit}
          </p>
        )}
      </CardContent>
      {plan !== 'FREE' && status === 'ACTIVE' && (
        <CardFooter>
          <CancelSubscriptionDialog workspaceId={workspaceId} />
        </CardFooter>
      )}
    </Card>
  );
}
