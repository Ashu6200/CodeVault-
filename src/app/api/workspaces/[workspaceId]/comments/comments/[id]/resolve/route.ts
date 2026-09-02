import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { CommentService } from '@modules/comment';

const commentService = new CommentService();

/** POST /api/workspaces/:workspaceId/comments/comments/:id/resolve */
export const POST = createHandler<{ id: string }>(
  { workspace: true, permissions: ['comment:resolve'] },
  async ({ params, user }) => ok(await commentService.resolveComment(params.id, user.id)),
);
