import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { WebhookService } from './webhook.service';
import { param } from '@core/utils/param';
import { createWebhookSchema, updateWebhookSchema } from './webhook.schema';

export class WebhookController extends BaseController {
  private webhookService: WebhookService;

  constructor() {
    super();
    this.webhookService = new WebhookService();
  }

  public list = this.catchAsync(async (req: Request, res: Response) => {
    const endpoints = await this.webhookService.listEndpoints(param(req, 'workspaceId'));
    this.sendSuccess(res, endpoints);
  });

  public create = this.catchAsync(async (req: Request, res: Response) => {
    const data = createWebhookSchema.parse(req.body);
    const endpoint = await this.webhookService.createEndpoint(param(req, 'workspaceId'), data);
    this.sendSuccess(res, endpoint, 201);
  });

  public update = this.catchAsync(async (req: Request, res: Response) => {
    const data = updateWebhookSchema.parse(req.body);
    const endpoint = await this.webhookService.updateEndpoint(param(req, 'id'), data);
    this.sendSuccess(res, endpoint);
  });

  public remove = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.webhookService.deleteEndpoint(param(req, 'id'));
    this.sendSuccess(res, result);
  });

  public deliveries = this.catchAsync(async (req: Request, res: Response) => {
    const logs = await this.webhookService.getDeliveries(param(req, 'id'));
    this.sendSuccess(res, logs);
  });
}
