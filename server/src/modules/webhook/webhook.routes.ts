import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new WebhookController();

router.use(requireAuth, resolveWorkspace, requirePermission('webhook:manage'));

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/:id/deliveries', controller.deliveries);

export default router;
