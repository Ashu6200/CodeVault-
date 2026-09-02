import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { WorkspaceService, createWorkspaceSchema } from '@modules/workspace';

const workspaceService = new WorkspaceService();

/** GET /api/workspaces — workspaces the caller belongs to */
export const GET = createHandler({ auth: true }, async ({ user }) => {
  const workspaces = await workspaceService.getUserWorkspaces(user.id);
  return ok(workspaces);
});

/** POST /api/workspaces — create a workspace (10 per minute) */
export const POST = createHandler(
  { auth: true, rateLimit: { limit: 10, windowSeconds: 60 } },
  async ({ req, user }) => {
    const data = createWorkspaceSchema.parse(await jsonBody(req));
    const workspace = await workspaceService.createWorkspace(data, user.id);
    return ok(workspace, 201);
  },
);
