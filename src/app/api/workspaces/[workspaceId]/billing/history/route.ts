import { createHandler } from '@/server/http/createHandler';
import { paginated } from '@/server/http/responses';
import { BillingService, listBillingHistorySchema } from '@modules/billing';

const billingService = new BillingService();

/** GET /api/workspaces/:workspaceId/billing/history */
export const GET = createHandler(
  { workspace: true, permissions: ['billing:read'] },
  async ({ workspaceId, query }) => {
    const parsed = listBillingHistorySchema.parse(query);
    const result = await billingService.listHistory(workspaceId, parsed);
    return paginated(result!);
  },
);
