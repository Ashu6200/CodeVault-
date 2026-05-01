import { Router } from 'express';
import { RoleController } from './role.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new RoleController();

router.use(requireAuth, resolveWorkspace);

router.get('/', requirePermission('role:manage'), controller.list);
router.post('/', requirePermission('role:manage'), controller.create);
router.put('/:id', requirePermission('role:manage'), controller.update);
router.delete('/:id', requirePermission('role:manage'), controller.remove);

export default router;
