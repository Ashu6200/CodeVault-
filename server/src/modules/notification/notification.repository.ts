import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { Notification } from '@prisma/client';
import { PaginationParams, PaginatedResult } from '@core/types/common';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(prisma.notification);
  }

  async findByUser(
    userId: string,
    pagination: PaginationParams,
    filters: { isRead?: boolean; workspaceId?: string } = {},
  ): Promise<PaginatedResult<Notification>> {
    const where: any = { userId };
    if (filters.isRead !== undefined) where.isRead = filters.isRead;
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;

    return this.findPaginated(pagination, where);
  }

  async markAsRead(ids: string[], userId: string) {
    return prisma.notification.updateMany({
      where: { id: { in: ids }, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string, workspaceId?: string) {
    const where: any = { userId, isRead: false };
    if (workspaceId) where.workspaceId = workspaceId;

    return prisma.notification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}
