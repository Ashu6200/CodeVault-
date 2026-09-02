import { createHandler } from '@/server/http/createHandler';
import { paginated } from '@/server/http/responses';
import { AuditService, listAuditLogsSchema } from '@modules/audit';

const auditService = new AuditService();

/** GET /api/workspaces/:workspaceId/audit */
export const GET = createHandler(
  { workspace: true, permissions: ['audit:read'] },
  async ({ workspaceId, query }) => {
    const parsed = listAuditLogsSchema.parse(query);
    const result = await auditService.listLogs(workspaceId, parsed);
    return paginated(result!);
  },
);
