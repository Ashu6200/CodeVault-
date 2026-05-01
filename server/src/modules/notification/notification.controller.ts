import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { NotificationService } from './notification.service';
import { listNotificationsSchema, markReadSchema } from './notification.schema';

export class NotificationController extends BaseController {
  private notifService: NotificationService;

  constructor() {
    super();
    this.notifService = new NotificationService();
  }

  public list = this.catchAsync(async (req: Request, res: Response) => {
    const query = listNotificationsSchema.parse(req.query);
    const result = await this.notifService.listNotifications(req.user!.id, query);
    this.sendPaginated(res, result!);
  });

  public markRead = this.catchAsync(async (req: Request, res: Response) => {
    const { ids } = markReadSchema.parse(req.body);
    const result = await this.notifService.markAsRead(ids, req.user!.id);
    this.sendSuccess(res, result);
  });

  public markAllRead = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.notifService.markAllAsRead(
      req.user!.id,
      req.query.workspaceId as string,
    );
    this.sendSuccess(res, result);
  });

  public unreadCount = this.catchAsync(async (req: Request, res: Response) => {
    const count = await this.notifService.getUnreadCount(req.user!.id);
    this.sendSuccess(res, { count });
  });
}
