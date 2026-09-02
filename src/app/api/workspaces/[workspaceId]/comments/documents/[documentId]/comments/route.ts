import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { CommentService, createCommentSchema } from '@modules/comment';

const commentService = new CommentService();

// NOTE on the doubled path segments: Express mounted commentRoutes at
// /api/workspaces/:workspaceId/comments while the router itself declared
// /documents/:documentId/comments, producing this URL. The client encodes it
// verbatim (src/features/comment/api.ts), so it is preserved exactly.

/** GET /api/workspaces/:workspaceId/comments/documents/:documentId/comments */
export const GET = createHandler<{ documentId: string }>(
  { workspace: true, permissions: ['comment:read'] },
  async ({ params }) => ok(await commentService.getDocumentComments(params.documentId)),
);

/** POST /api/workspaces/:workspaceId/comments/documents/:documentId/comments */
export const POST = createHandler<{ documentId: string }>(
  { workspace: true, permissions: ['comment:create'] },
  async ({ req, params, user }) => {
    const data = createCommentSchema.parse(await jsonBody(req));
    const comment = await commentService.createComment(params.documentId, data, user.id);
    return ok(comment, 201);
  },
);
