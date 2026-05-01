import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';
import { rateLimiter } from '@middleware/rateLimiter.middleware';

// ─────────────────────────────────────────────
// Workspace Routes
// ─────────────────────────────────────────────

const router = Router();
const controller = new WorkspaceController();

// All workspace routes require authentication
router.use(requireAuth);

// Create workspace
router.post('/', rateLimiter({ limit: 10, windowSeconds: 60 }), controller.create);

// List user's workspaces
router.get('/', controller.listMine);

// Get workspace by slug
router.get('/slug/:slug', controller.getBySlug);

// Get workspace by ID
router.get('/:workspaceId', resolveWorkspace, controller.getById);

// Update workspace (requires workspace:update permission)
router.put(
  '/:workspaceId',
  resolveWorkspace,
  requirePermission('workspace:update'),
  controller.update,
);

// Delete workspace (owner-only check is in service layer)
router.delete('/:workspaceId', resolveWorkspace, requirePermission('*'), controller.remove);

export default router;
