import { Router } from 'express';
import { ApiKeyController } from './apiKey.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { rateLimiter } from '@middleware/rateLimiter.middleware';

const router = Router();
const controller = new ApiKeyController();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', rateLimiter({ limit: 5, windowSeconds: 3600 }), controller.create);
router.delete('/:id', controller.revoke);

export default router;
