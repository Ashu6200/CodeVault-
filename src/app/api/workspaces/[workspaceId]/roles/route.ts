import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { RoleService, createRoleSchema } from '@modules/role';

const roleService = new RoleService();

/** GET /api/workspaces/:workspaceId/roles */
export const GET = createHandler(
  { workspace: true, permissions: ['role:manage'] },
  async ({ workspaceId }) => ok(await roleService.listRoles(workspaceId)),
);

/** POST /api/workspaces/:workspaceId/roles */
export const POST = createHandler(
  { workspace: true, permissions: ['role:manage'] },
  async ({ req, workspaceId, user }) => {
    const data = createRoleSchema.parse(await jsonBody(req));
    const role = await roleService.createRole(workspaceId, data, user.id);
    return ok(role, 201);
  },
);
