import { Router } from 'express';
import { MemberController } from './member.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new MemberController();

router.use(requireAuth, resolveWorkspace);

router.get('/', requirePermission('member:read'), controller.list);
router.post('/', requirePermission('member:manage'), controller.add);
router.put('/:id', requirePermission('member:manage'), controller.update);
router.delete('/:id', requirePermission('member:manage'), controller.remove);

export default router;
