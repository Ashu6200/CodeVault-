import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { InviteService, acceptInviteSchema } from '@modules/invite';

const inviteService = new InviteService();

/**
 * POST /api/workspaces/:workspaceId/invites/accept
 *
 * Authenticated but deliberately NOT workspace-scoped: the invite token
 * carries its own workspace, and the accepting user is by definition not yet a
 * member. The :workspaceId segment is ignored, exactly as in the Express route.
 */
export const POST = createHandler({ auth: true }, async ({ req, user }) => {
  const { token } = acceptInviteSchema.parse(await jsonBody(req));
  const result = await inviteService.acceptInvite(token, user.id);
  return ok(result);
});
