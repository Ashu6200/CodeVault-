import { Router } from 'express';
import { BillingController } from './billing.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new BillingController();

router.use(requireAuth, resolveWorkspace);

router.get('/subscription', requirePermission('billing:read'), controller.getSubscription);
router.get('/history', requirePermission('billing:read'), controller.listHistory);

router.post(
  '/create-subscription',
  requirePermission('billing:write'),
  controller.createSubscription,
);
router.post(
  '/verify-payment',
  requirePermission('billing:write'),
  controller.verifyPayment,
);
router.post(
  '/cancel-subscription',
  requirePermission('billing:write'),
  controller.cancelSubscription,
);

export default router;
