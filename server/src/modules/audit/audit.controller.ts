import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { AuditService } from './audit.service';
import { param } from '@core/utils/param';
import { listAuditLogsSchema } from './audit.schema';

export class AuditController extends BaseController {
  private auditService: AuditService;

  constructor() {
    super();
    this.auditService = new AuditService();
  }

  public list = this.catchAsync(async (req: Request, res: Response) => {
    const query = listAuditLogsSchema.parse(req.query);
    const result = await this.auditService.listLogs(param(req, 'workspaceId'), query);
    this.sendPaginated(res, result!);
  });
}
