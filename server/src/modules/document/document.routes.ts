import { Router } from 'express';
import { DocumentController } from './document.controller';
import { requireAuth } from '@middleware/auth.middleware';
import {
  resolveWorkspace,
  requirePermission,
  requireDocumentPermission,
} from '@middleware/rbac.middleware';
import { rateLimiter } from '@middleware/rateLimiter.middleware';

// ─────────────────────────────────────────────
// Document Routes
// Nested under /api/workspaces/:workspaceId/documents
// ─────────────────────────────────────────────

const router = Router({ mergeParams: true }); // Access :workspaceId from parent router
const controller = new DocumentController();

// All document routes require auth + workspace context
router.use(requireAuth, resolveWorkspace);

// List & tree
router.get('/', requirePermission('doc:read'), controller.list);
router.get('/tree', requirePermission('doc:read'), controller.getTree);

// CRUD
router.post(
  '/',
  requirePermission('doc:create'),
  rateLimiter({ limit: 30, windowSeconds: 60 }),
  controller.create,
);
router.get('/:id', requireDocumentPermission('doc:read'), controller.getById);
router.put('/:id', requireDocumentPermission('doc:update'), controller.update);
router.delete('/:id', requireDocumentPermission('doc:delete'), controller.remove);

// Versions
router.get('/:id/versions', requireDocumentPermission('doc:read'), controller.getVersions);

// ABAC Grants (admin-level operation)
router.get('/:id/grants', requirePermission('doc:read'), controller.getGrants);
router.post('/:id/grants', requirePermission('doc:update'), controller.grantAccess);
router.delete('/:id/grants/:userId', requirePermission('doc:update'), controller.revokeAccess);

export default router;
