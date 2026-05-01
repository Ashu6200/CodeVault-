import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { BillingService } from './billing.service';
import { param } from '@core/utils/param';
import { listBillingHistorySchema } from './billing.schema';

export class BillingController extends BaseController {
  private billingService: BillingService;

  constructor() {
    super();
    this.billingService = new BillingService();
  }

  public getSubscription = this.catchAsync(async (req: Request, res: Response) => {
    const status = await this.billingService.getSubscriptionStatus(param(req, 'workspaceId'));
    this.sendSuccess(res, status);
  });

  public listHistory = this.catchAsync(async (req: Request, res: Response) => {
    const query = listBillingHistorySchema.parse(req.query);
    const result = await this.billingService.listHistory(param(req, 'workspaceId'), query);
    this.sendPaginated(res, result!);
  });

  /**
   * POST /api/billing/stripe-webhook — Handle Stripe webhook events
   * Note: This uses raw body parsing for signature verification
   */
  public stripeWebhook = this.catchAsync(async (req: Request, res: Response) => {
    // TODO: Verify Stripe signature with stripe.webhooks.constructEvent()
    await this.billingService.handleStripeWebhook(req.body);
    this.sendSuccess(res, { received: true });
  });
}
