import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { WorkspaceService, updateWorkspaceSchema } from '@modules/workspace';

const workspaceService = new WorkspaceService();

/** GET /api/workspaces/:workspaceId */
export const GET = createHandler({ workspace: true }, async ({ workspaceId }) => {
  const workspace = await workspaceService.getWorkspaceById(workspaceId);
  return ok(workspace);
});

/** PUT /api/workspaces/:workspaceId */
export const PUT = createHandler(
  { workspace: true, permissions: ['workspace:update'] },
  async ({ req, workspaceId, user }) => {
    const data = updateWorkspaceSchema.parse(await jsonBody(req));
    const workspace = await workspaceService.updateWorkspace(workspaceId, data, user.id);
    return ok(workspace);
  },
);

/** DELETE /api/workspaces/:workspaceId — owner only (enforced in the service) */
export const DELETE = createHandler(
  { workspace: true, permissions: ['*'] },
  async ({ workspaceId, user }) => {
    const result = await workspaceService.deleteWorkspace(workspaceId, user.id);
    return ok(result);
  },
);
