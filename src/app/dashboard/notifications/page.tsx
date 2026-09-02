'use client';

import { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '@/features/notification/api';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery({});
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const notifications = data?.items || [];

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with workspace and document activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllRead()}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
              !n.isRead && "bg-primary/5 border-l-4 border-l-primary"
            )}
            onClick={() => !n.isRead && markRead([n.id])}
          >
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted",
              !n.isRead && "bg-primary/10 text-primary"
            )}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className={cn("text-sm leading-none", !n.isRead && "font-semibold")}>
                {n.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="py-20 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You&apos;re all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
