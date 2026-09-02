import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { BillingService } from '@modules/billing';

const billingService = new BillingService();

/** GET /api/workspaces/:workspaceId/billing/subscription */
export const GET = createHandler(
  { workspace: true, permissions: ['billing:read'] },
  async ({ workspaceId }) => ok(await billingService.getSubscriptionStatus(workspaceId)),
);
