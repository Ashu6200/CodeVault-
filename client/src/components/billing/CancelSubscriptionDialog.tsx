'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCancelSubscriptionMutation } from '@/features/billing/api';

interface Props {
  workspaceId: string;
}

export function CancelSubscriptionDialog({ workspaceId }: Props) {
  const [open, setOpen] = useState(false);
  const [cancel, { isLoading }] = useCancelSubscriptionMutation();

  const handleConfirm = async () => {
    try {
      await cancel({ workspaceId, cancelAtPeriodEnd: true }).unwrap();
      setOpen(false);
    } catch {
      // error handled by RTK Query
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>
            Your subscription will remain active until the end of the current billing period.
            After that, your workspace will move to the Free plan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Keep Plan
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
