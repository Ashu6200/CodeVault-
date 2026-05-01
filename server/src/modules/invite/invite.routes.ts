import { Router } from 'express';
import { InviteController } from './invite.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new InviteController();

router.use(requireAuth);

// Accept invite (no workspace context needed — token carries the context)
router.post('/accept', controller.accept);

// Workspace-scoped invite management
router.get('/', resolveWorkspace, requirePermission('invite:manage'), controller.listPending);
router.post('/', resolveWorkspace, requirePermission('invite:manage'), controller.send);
router.delete('/:id', resolveWorkspace, requirePermission('invite:manage'), controller.revoke);

export default router;
