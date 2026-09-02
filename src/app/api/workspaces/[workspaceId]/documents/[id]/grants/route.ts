import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { DocumentService, documentGrantSchema } from '@modules/document';

const documentService = new DocumentService();

/**
 * GET /api/workspaces/:workspaceId/documents/:id/grants
 *
 * Plain workspace RBAC here, not the per-document ABAC path — matching the
 * Express routes, which used requirePermission for the grant endpoints.
 */
export const GET = createHandler<{ id: string }>(
  { workspace: true, permissions: ['doc:read'] },
  async ({ params }) => ok(await documentService.getDocumentGrants(params.id)),
);

/** POST /api/workspaces/:workspaceId/documents/:id/grants */
export const POST = createHandler<{ id: string }>(
  { workspace: true, permissions: ['doc:update'] },
  async ({ req, params }) => {
    const data = documentGrantSchema.parse(await jsonBody(req));
    const grant = await documentService.grantAccess(
      params.id,
      data.userId,
      data.permissions,
      data.expiresAt,
    );
    return ok(grant, 201);
  },
);
