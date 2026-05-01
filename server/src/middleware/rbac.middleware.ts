import { Request, Response, NextFunction } from 'express';
import { prisma } from '@infra/db';
import { ForbiddenError, UnauthorizedError } from '@core/errors';
import { logger } from '@infra/logger';
import { param as getParam } from '@core/utils/param';

const log = logger.child('RBAC');

// ─────────────────────────────────────────────
// Workspace Context Middleware
// Resolves workspaceId from params/body/query and
// loads the member's permissions for that workspace.
// Must be used AFTER requireAuth.
// ─────────────────────────────────────────────

export const resolveWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const workspaceId =
      getParam(req, 'workspaceId') || req.body?.workspaceId || (req.query?.workspaceId as string);

    if (!workspaceId) {
      return next(new ForbiddenError('Workspace context is required'));
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Load member with role and permissions
    const member = await prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
      include: {
        role: {
          select: { permissions: true },
        },
      },
    });

    if (!member) {
      return next(new ForbiddenError('You are not a member of this workspace'));
    }

    if (!member.isActive) {
      return next(new ForbiddenError('Your membership in this workspace has been deactivated'));
    }

    req.workspaceId = workspaceId;
    req.member = {
      id: member.id,
      userId: member.userId,
      workspaceId: member.workspaceId,
      roleId: member.roleId,
      isActive: member.isActive,
    };
    req.permissions = member.role.permissions;

    next();
  } catch (error) {
    log.error('Failed to resolve workspace:', error);
    next(new ForbiddenError('Unable to verify workspace access'));
  }
};

// ─────────────────────────────────────────────
// RBAC Permission Check
// Checks if the user has the required permission
// in their workspace role. Must be used AFTER resolveWorkspace.
// ─────────────────────────────────────────────

export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.permissions) {
      return next(
        new ForbiddenError('Permissions not loaded. Use resolveWorkspace middleware first.'),
      );
    }

    // Check if user has a wildcard (admin) permission
    if (req.permissions.includes('*')) {
      return next();
    }

    const hasPermission = permissions.every((p) => req.permissions!.includes(p));

    if (!hasPermission) {
      log.warn(
        `Permission denied for user ${req.user?.id}: requires [${permissions.join(', ')}], has [${req.permissions.join(', ')}]`,
      );
      return next(new ForbiddenError(`Missing required permission: ${permissions.join(', ')}`));
    }

    next();
  };
};

// ─────────────────────────────────────────────
// ABAC Document Permission Check
// First checks RBAC (workspace role), then falls back
// to DocumentGrant (per-document ACL override).
// ─────────────────────────────────────────────

export const requireDocumentPermission = (...permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError());
      }

      // 1. Check RBAC first — if role has the permission, allow
      if (req.permissions) {
        if (req.permissions.includes('*')) {
          return next();
        }
        const hasRolePermission = permissions.every((p) => req.permissions!.includes(p));
        if (hasRolePermission) {
          return next();
        }
      }

      // 2. Fall back to ABAC — check DocumentGrant
      const documentId = (req.params.id || req.params.documentId) as string;
      if (!documentId) {
        return next(new ForbiddenError('Document context required'));
      }

      const grant = await prisma.documentGrant.findUnique({
        where: {
          documentId_userId: {
            documentId: documentId as string,
            userId: req.user.id,
          },
        },
      });

      if (!grant) {
        return next(new ForbiddenError('You do not have access to this document'));
      }

      // Check grant expiry
      if (grant.expiresAt && grant.expiresAt < new Date()) {
        return next(new ForbiddenError('Your document access has expired'));
      }

      // Check grant permissions
      const hasGrantPermission = permissions.every((p) => grant.permissions.includes(p));
      if (!hasGrantPermission) {
        return next(new ForbiddenError(`Missing document permission: ${permissions.join(', ')}`));
      }

      next();
    } catch (error) {
      log.error('Document permission check failed:', error);
      next(new ForbiddenError('Unable to verify document access'));
    }
  };
};
