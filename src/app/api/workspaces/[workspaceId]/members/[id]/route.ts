import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { MemberService, updateMemberSchema } from '@modules/member';

const memberService = new MemberService();

/** PUT /api/workspaces/:workspaceId/members/:id */
export const PUT = createHandler<{ id: string }>(
  { workspace: true, permissions: ['member:manage'] },
  async ({ req, params, user }) => {
    const data = updateMemberSchema.parse(await jsonBody(req));
    return ok(await memberService.updateMember(params.id, data, user.id));
  },
);

/** DELETE /api/workspaces/:workspaceId/members/:id */
export const DELETE = createHandler<{ id: string }>(
  { workspace: true, permissions: ['member:manage'] },
  async ({ params, user }) => ok(await memberService.removeMember(params.id, user.id)),
);
