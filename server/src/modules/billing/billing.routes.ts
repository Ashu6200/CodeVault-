import { Router } from 'express';
import { BillingController } from './billing.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new BillingController();

// Stripe webhook (no auth — verified via signature)
router.post('/stripe-webhook', controller.stripeWebhook);

// Workspace-scoped billing routes
router.use(requireAuth, resolveWorkspace);

router.get('/subscription', requirePermission('billing:read'), controller.getSubscription);
router.get('/history', requirePermission('billing:read'), controller.listHistory);

export default router;
