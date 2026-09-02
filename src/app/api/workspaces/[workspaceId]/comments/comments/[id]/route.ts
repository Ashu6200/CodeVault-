import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { CommentService, updateCommentSchema } from '@modules/comment';

const commentService = new CommentService();

/** PUT /api/workspaces/:workspaceId/comments/comments/:id */
export const PUT = createHandler<{ id: string }>(
  { workspace: true, permissions: ['comment:update'] },
  async ({ req, params, user }) => {
    const data = updateCommentSchema.parse(await jsonBody(req));
    return ok(await commentService.updateComment(params.id, data, user.id));
  },
);

/** DELETE /api/workspaces/:workspaceId/comments/comments/:id */
export const DELETE = createHandler<{ id: string }>(
  { workspace: true, permissions: ['comment:delete'] },
  async ({ params, user }) => ok(await commentService.deleteComment(params.id, user.id)),
);
