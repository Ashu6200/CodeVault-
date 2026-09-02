import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { DocumentService } from '@modules/document';

const documentService = new DocumentService();

/** GET /api/workspaces/:workspaceId/documents/tree */
export const GET = createHandler(
  { workspace: true, permissions: ['doc:read'] },
  async ({ workspaceId }) => ok(await documentService.getDocumentTree(workspaceId)),
);
