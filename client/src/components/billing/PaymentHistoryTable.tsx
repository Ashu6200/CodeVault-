'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BillingHistory } from '@/features/billing/api';

interface Props {
  transactions: BillingHistory[];
  isLoading: boolean;
}

function formatAmount(amount: number, currency: string): string {
  // Razorpay amounts are in subunits (paise for INR)
  const value = (amount / 100).toFixed(2);
  if (currency.toUpperCase() === 'INR') return `₹${value}`;
  return `${currency.toUpperCase()} ${value}`;
}

export function PaymentHistoryTable({ transactions, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Description</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 pr-4">{tx.description ?? 'Payment'}</td>
                    <td className="py-3 pr-4 font-medium">
                      {formatAmount(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 capitalize">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
