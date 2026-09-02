import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { DocumentService } from '@modules/document';

const documentService = new DocumentService();

/** GET /api/workspaces/:workspaceId/documents/:id/versions */
export const GET = createHandler<{ id: string }>(
  { documentPermission: ['doc:read'] },
  async ({ params }) => ok(await documentService.getVersionHistory(params.id)),
);
