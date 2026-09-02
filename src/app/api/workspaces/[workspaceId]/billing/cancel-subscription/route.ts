import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { BillingService, cancelSubscriptionSchema } from '@modules/billing';

const billingService = new BillingService();

/** POST /api/workspaces/:workspaceId/billing/cancel-subscription */
export const POST = createHandler(
  { workspace: true, permissions: ['billing:write'] },
  async ({ req, workspaceId }) => {
    const input = cancelSubscriptionSchema.parse(await jsonBody(req));
    return ok(await billingService.cancelSubscription(workspaceId, input));
  },
);
