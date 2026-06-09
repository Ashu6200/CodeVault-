'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useCreateSubscriptionMutation,
  useVerifyPaymentMutation,
} from '@/features/billing/api';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useSession } from '@/lib/auth-client';

const PLANS = [
  {
    id: 'FREE' as const,
    name: 'Free',
    price: '₹0 / mo',
    features: ['5 documents', '1 workspace', 'Community support'],
  },
  {
    id: 'TEAM' as const,
    name: 'Team',
    price: '₹999 / mo',
    features: ['Unlimited documents', '5 workspaces', 'Priority support', '10 seats'],
  },
  {
    id: 'ENTERPRISE' as const,
    name: 'Enterprise',
    price: '₹4,999 / mo',
    features: ['Everything in Team', 'Unlimited seats', 'SSO', 'Dedicated SLA'],
  },
];

interface Props {
  currentPlan: 'FREE' | 'TEAM' | 'ENTERPRISE';
  workspaceId: string;
}

export function PlanSelector({ currentPlan, workspaceId }: Props) {
  const { data: session } = useSession();
  const { openCheckout } = useRazorpay();
  const [createSubscription] = useCreateSubscriptionMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [loadingPlan, setLoadingPlan] = useState<'TEAM' | 'ENTERPRISE' | null>(null);

  const handleUpgrade = async (plan: 'TEAM' | 'ENTERPRISE') => {
    setLoadingPlan(plan);
    try {
      // Step 1: Create subscription on backend
      const { subscriptionId, keyId } = await createSubscription({
        workspaceId,
        plan,
      }).unwrap();

      // Step 2: Open Razorpay checkout modal
      await openCheckout({
        key: keyId,
        subscription_id: subscriptionId,
        name: 'CodeVault',
        description: `${plan} Plan`,
        prefill: {
          name: session?.user?.name ?? '',
          email: session?.user?.email ?? '',
        },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          // Step 3: Verify payment on backend — cache is invalidated automatically
          await verifyPayment({
            workspaceId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          }).unwrap();
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      });
    } catch {
      // error handled by RTK Query / Razorpay SDK
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {PLANS.map((plan) => {
        const isCurrent = plan.id === currentPlan;
        const isUpgradeable =
          plan.id !== 'FREE' &&
          plan.id !== currentPlan &&
          (currentPlan === 'FREE' || plan.id === 'ENTERPRISE');

        return (
          <Card key={plan.id} className={isCurrent ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-xl font-bold">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f}>&#10003; {f}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrent ? (
                <Button disabled className="w-full" variant="outline">
                  Current Plan
                </Button>
              ) : isUpgradeable ? (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.id as 'TEAM' | 'ENTERPRISE')}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
