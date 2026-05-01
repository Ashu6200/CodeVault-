import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

router.use(requireAuth);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.post('/mark-read', controller.markRead);
router.post('/mark-all-read', controller.markAllRead);

export default router;
