import { BaseService } from '@core/base.service';
import { NotificationRepository } from './notification.repository';
import { ListNotificationsQuery } from './notification.schema';

export class NotificationService extends BaseService {
  private notifRepo: NotificationRepository;

  constructor() {
    super();
    this.notifRepo = new NotificationRepository();
  }

  async listNotifications(userId: string, query: ListNotificationsQuery) {
    try {
      return await this.notifRepo.findByUser(
        userId,
        { page: query.page, limit: query.limit },
        {
          isRead: query.isRead === 'true' ? true : query.isRead === 'false' ? false : undefined,
          workspaceId: query.workspaceId,
        },
      );
    } catch (error) {
      this.handleError(error, 'Failed to list notifications');
    }
  }

  async markAsRead(ids: string[], userId: string) {
    try {
      return await this.notifRepo.markAsRead(ids, userId);
    } catch (error) {
      this.handleError(error, 'Failed to mark notifications as read');
    }
  }

  async markAllAsRead(userId: string, workspaceId?: string) {
    try {
      return await this.notifRepo.markAllAsRead(userId, workspaceId);
    } catch (error) {
      this.handleError(error, 'Failed to mark all as read');
    }
  }

  async getUnreadCount(userId: string) {
    try {
      return await this.notifRepo.getUnreadCount(userId);
    } catch (error) {
      this.handleError(error, 'Failed to get unread count');
    }
  }
}
