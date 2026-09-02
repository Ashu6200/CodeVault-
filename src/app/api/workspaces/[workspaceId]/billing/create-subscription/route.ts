import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { BillingService, createSubscriptionSchema } from '@modules/billing';

const billingService = new BillingService();

/** POST /api/workspaces/:workspaceId/billing/create-subscription */
export const POST = createHandler(
  { workspace: true, permissions: ['billing:write'] },
  async ({ req, workspaceId }) => {
    const input = createSubscriptionSchema.parse(await jsonBody(req));
    return ok(await billingService.createSubscription(workspaceId, input));
  },
);
