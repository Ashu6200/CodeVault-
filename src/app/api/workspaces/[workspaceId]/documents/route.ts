import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok, paginated } from '@/server/http/responses';
import {
  DocumentService,
  createDocumentSchema,
  listDocumentsQuerySchema,
} from '@modules/document';

const documentService = new DocumentService();

/** GET /api/workspaces/:workspaceId/documents */
export const GET = createHandler(
  { workspace: true, permissions: ['doc:read'] },
  async ({ workspaceId, query }) => {
    const parsed = listDocumentsQuerySchema.parse(query);
    const result = await documentService.listDocuments(workspaceId, parsed);
    return paginated(result!);
  },
);

/** POST /api/workspaces/:workspaceId/documents (30 per minute) */
export const POST = createHandler(
  {
    workspace: true,
    permissions: ['doc:create'],
    rateLimit: { limit: 30, windowSeconds: 60 },
  },
  async ({ req, workspaceId, user }) => {
    // The workspace comes from the route segment, not the body — matching the
    // Express controller, which merged the route param in before parsing.
    const data = createDocumentSchema.parse({
      ...(await jsonBody(req) as object),
      workspaceId,
    });
    const document = await documentService.createDocument(data, user.id);
    return ok(document, 201);
  },
);
