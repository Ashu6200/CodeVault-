import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { AuditLog, AuditAction } from '@prisma/client';
import { PaginationParams, PaginatedResult } from '@core/types/common';

export class AuditRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(prisma.auditLog);
  }

  async findByWorkspace(
    workspaceId: string,
    pagination: PaginationParams,
    filters: { action?: string; actorId?: string; resourceType?: string; resourceId?: string } = {},
  ): Promise<PaginatedResult<AuditLog>> {
    const where: any = { workspaceId };
    if (filters.action) where.action = filters.action;
    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.resourceType) where.resourceType = filters.resourceType;
    if (filters.resourceId) where.resourceId = filters.resourceId;

    return this.findPaginated(pagination, where, {
      actor: { select: { id: true, name: true, email: true } },
    });
  }

  async logAction(data: {
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    details?: any;
    actorId: string;
    workspaceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({ data });
  }
}
