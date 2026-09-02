import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { InviteService } from '@modules/invite';

const inviteService = new InviteService();

/** DELETE /api/workspaces/:workspaceId/invites/:id */
export const DELETE = createHandler<{ id: string }>(
  { workspace: true, permissions: ['invite:manage'] },
  async ({ params, user }) => ok(await inviteService.revokeInvite(params.id, user.id)),
);
