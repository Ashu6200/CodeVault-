import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { RoleService, updateRoleSchema } from '@modules/role';

const roleService = new RoleService();

/** PUT /api/workspaces/:workspaceId/roles/:id */
export const PUT = createHandler<{ id: string }>(
  { workspace: true, permissions: ['role:manage'] },
  async ({ req, params, user }) => {
    const data = updateRoleSchema.parse(await jsonBody(req));
    return ok(await roleService.updateRole(params.id, data, user.id));
  },
);

/** DELETE /api/workspaces/:workspaceId/roles/:id */
export const DELETE = createHandler<{ id: string }>(
  { workspace: true, permissions: ['role:manage'] },
  async ({ params, user }) => ok(await roleService.deleteRole(params.id, user.id)),
);
