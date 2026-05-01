import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { ApiKeyService } from './apiKey.service';
import { param } from '@core/utils/param';
import { createApiKeySchema } from './apiKey.schema';

export class ApiKeyController extends BaseController {
  private apiKeyService: ApiKeyService;

  constructor() {
    super();
    this.apiKeyService = new ApiKeyService();
  }

  public list = this.catchAsync(async (req: Request, res: Response) => {
    const keys = await this.apiKeyService.listKeys(req.user!.id);
    this.sendSuccess(res, keys);
  });

  public create = this.catchAsync(async (req: Request, res: Response) => {
    const data = createApiKeySchema.parse(req.body);
    const key = await this.apiKeyService.createKey(req.user!.id, data);
    this.sendSuccess(res, key, 201);
  });

  public revoke = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.apiKeyService.revokeKey(param(req, 'id'), req.user!.id);
    this.sendSuccess(res, result);
  });
}
