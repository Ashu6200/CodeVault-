import { Router } from 'express';
import { CommentController } from './comment.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new CommentController();

router.use(requireAuth, resolveWorkspace);

// Document comments
router.get('/documents/:documentId/comments', requirePermission('comment:read'), controller.list);
router.post(
  '/documents/:documentId/comments',
  requirePermission('comment:create'),
  controller.create,
);

// Comment operations
router.put('/comments/:id', requirePermission('comment:update'), controller.update);
router.post('/comments/:id/resolve', requirePermission('comment:resolve'), controller.resolve);
router.delete('/comments/:id', requirePermission('comment:delete'), controller.remove);

export default router;
