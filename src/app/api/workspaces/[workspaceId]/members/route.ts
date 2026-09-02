import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { MemberService, addMemberSchema } from '@modules/member';

const memberService = new MemberService();

/** GET /api/workspaces/:workspaceId/members */
export const GET = createHandler(
  { workspace: true, permissions: ['member:read'] },
  async ({ workspaceId }) => ok(await memberService.listMembers(workspaceId)),
);

/** POST /api/workspaces/:workspaceId/members */
export const POST = createHandler(
  { workspace: true, permissions: ['member:manage'] },
  async ({ req, workspaceId, user }) => {
    const data = addMemberSchema.parse(await jsonBody(req));
    const member = await memberService.addMember(workspaceId, data, user.id);
    return ok(member, 201);
  },
);
