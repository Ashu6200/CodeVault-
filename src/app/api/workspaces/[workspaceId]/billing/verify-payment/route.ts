import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { BillingService, verifyPaymentSchema } from '@modules/billing';

const billingService = new BillingService();

/** POST /api/workspaces/:workspaceId/billing/verify-payment */
export const POST = createHandler(
  { workspace: true, permissions: ['billing:write'] },
  async ({ req, workspaceId }) => {
    const input = verifyPaymentSchema.parse(await jsonBody(req));
    return ok(await billingService.verifyPayment(workspaceId, input));
  },
);
