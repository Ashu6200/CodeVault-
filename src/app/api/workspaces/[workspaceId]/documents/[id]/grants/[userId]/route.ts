import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { DocumentService } from '@modules/document';

const documentService = new DocumentService();

/** DELETE /api/workspaces/:workspaceId/documents/:id/grants/:userId */
export const DELETE = createHandler<{ id: string; userId: string }>(
  { workspace: true, permissions: ['doc:update'] },
  async ({ params }) => ok(await documentService.revokeAccess(params.id, params.userId)),
);
