import { Router } from 'express';
import { AuditController } from './audit.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { resolveWorkspace, requirePermission } from '@middleware/rbac.middleware';

const router = Router({ mergeParams: true });
const controller = new AuditController();

router.use(requireAuth, resolveWorkspace);

router.get('/', requirePermission('audit:read'), controller.list);

export default router;
