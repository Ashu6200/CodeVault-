import { BaseService } from '@core/base.service';
import { prisma } from '@infra/db';
import { AuditAction, Prisma } from '@prisma/client';
import { ListAuditLogsQuery } from './audit.schema';
import { logger } from '@infra/logger';

const log = logger.child('AuditService');

export class AuditService extends BaseService {
  constructor() {
    super();
  }

  async listLogs(workspaceId: string, query: ListAuditLogsQuery) {
    try {
      const where: Prisma.AuditLogWhereInput = { workspaceId };
      if (query.action) where.action = query.action as AuditAction;
      if (query.actorId) where.actorId = query.actorId;
      if (query.resourceType) where.resourceType = query.resourceType;
      if (query.resourceId) where.resourceId = query.resourceId;

      return await this.paginate(
        prisma.auditLog,
        { page: query.page, limit: query.limit },
        {
          where,
          include: {
            actor: { select: { id: true, name: true, email: true } },
          },
        },
      );
    } catch (error) {
      this.handleError(error, 'Failed to list audit logs');
    }
  }

  async logAction(data: {
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    details?: Prisma.InputJsonValue;
    actorId: string;
    workspaceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      return await prisma.auditLog.create({ data });
    } catch (error) {
      log.error('Failed to log audit action:', error);
      // Don't throw — audit logging should not break the main flow
    }
  }
}

/**
 * Shared instance.
 *
 * Audit rows used to be written by event-bus listeners registered once at
 * server boot. With the event bus removed, services call logAction directly.
 * logAction swallows its own errors, so call sites use `void` to keep audit
 * writes fire-and-forget — matching the old listeners, which never awaited.
 */
export const auditService = new AuditService();
