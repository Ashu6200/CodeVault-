import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();
const controller = new UserController();

router.use(requireAuth);

router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

export default router;
