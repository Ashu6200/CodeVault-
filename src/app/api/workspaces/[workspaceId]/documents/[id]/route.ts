import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { DocumentService, updateDocumentSchema } from '@modules/document';

const documentService = new DocumentService();

/** GET /api/workspaces/:workspaceId/documents/:id — RBAC, then DocumentGrant ABAC */
export const GET = createHandler<{ id: string }>(
  { documentPermission: ['doc:read'] },
  async ({ params }) => ok(await documentService.getDocumentById(params.id)),
);

/** PUT /api/workspaces/:workspaceId/documents/:id */
export const PUT = createHandler<{ id: string }>(
  { documentPermission: ['doc:update'] },
  async ({ req, params, user }) => {
    const data = updateDocumentSchema.parse(await jsonBody(req));
    return ok(await documentService.updateDocument(params.id, data, user.id));
  },
);

/** DELETE /api/workspaces/:workspaceId/documents/:id — soft delete */
export const DELETE = createHandler<{ id: string }>(
  { documentPermission: ['doc:delete'] },
  async ({ params, user }) => ok(await documentService.deleteDocument(params.id, user.id)),
);
