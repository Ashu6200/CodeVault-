import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { InviteService, createInviteSchema } from '@modules/invite';

const inviteService = new InviteService();

/** GET /api/workspaces/:workspaceId/invites — pending invites */
export const GET = createHandler(
  { workspace: true, permissions: ['invite:manage'] },
  async ({ workspaceId }) => ok(await inviteService.listPending(workspaceId)),
);

/** POST /api/workspaces/:workspaceId/invites */
export const POST = createHandler(
  { workspace: true, permissions: ['invite:manage'] },
  async ({ req, workspaceId, user }) => {
    const data = createInviteSchema.parse(await jsonBody(req));
    const invite = await inviteService.sendInvite(workspaceId, data, user.id);
    return ok(invite, 201);
  },
);
