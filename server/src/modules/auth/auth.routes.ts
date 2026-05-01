import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { AuthController } from './auth.controller';
import { auth } from '@infra/auth';
import { requireAuth } from '@middleware/auth.middleware';
import { rateLimiter } from '@middleware/rateLimiter.middleware';

// ─────────────────────────────────────────────
// Auth Routes
// ─────────────────────────────────────────────

const router = Router();
const controller = new AuthController();

// Better Auth handles: /api/auth/sign-up, /api/auth/sign-in, /api/auth/sign-out, etc.
// Apply strict rate limiting to auth endpoints
router.all('/*', rateLimiter({ limit: 10, windowSeconds: 60 }), (req, res) => {
  return toNodeHandler(auth)(req, res);
});

// Custom auth endpoints
router.get('/me', requireAuth, controller.getSession);
router.post(
  '/deactivate',
  requireAuth,
  rateLimiter({ limit: 3, windowSeconds: 3600 }),
  controller.deactivateAccount,
);

export default router;
