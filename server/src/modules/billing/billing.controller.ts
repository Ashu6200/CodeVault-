import crypto from 'crypto';
import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { BillingService } from './billing.service';
import { param } from '@core/utils/param';
import { config } from '@infra/config';
import { AppError } from '@core/errors';
import {
  listBillingHistorySchema,
  createSubscriptionSchema,
  verifyPaymentSchema,
  cancelSubscriptionSchema,
} from './billing.schema';

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
   * POST /api/workspaces/:workspaceId/billing/create-subscription
   * Creates a Razorpay subscription and returns subscription_id to the frontend.
   */
  public createSubscription = this.catchAsync(async (req: Request, res: Response) => {
    const input = createSubscriptionSchema.parse(req.body);
    const result = await this.billingService.createSubscription(
      param(req, 'workspaceId'),
      input,
    );
    this.sendSuccess(res, result, 201);
  });

  /**
   * POST /api/workspaces/:workspaceId/billing/verify-payment
   * Verifies the Razorpay payment signature after the user completes checkout.
   */
  public verifyPayment = this.catchAsync(async (req: Request, res: Response) => {
    const input = verifyPaymentSchema.parse(req.body);
    const result = await this.billingService.verifyPayment(
      param(req, 'workspaceId'),
      input,
    );
    this.sendSuccess(res, result);
  });

  /**
   * POST /api/workspaces/:workspaceId/billing/cancel-subscription
   */
  public cancelSubscription = this.catchAsync(async (req: Request, res: Response) => {
    const input = cancelSubscriptionSchema.parse(req.body);
    const result = await this.billingService.cancelSubscription(
      param(req, 'workspaceId'),
      input,
    );
    this.sendSuccess(res, result);
  });

  /**
   * POST /api/billing/razorpay-webhook
   * Receives Razorpay webhook events. Registered in app.ts BEFORE express.json()
   * so req.body is the raw Buffer needed for HMAC verification.
   *
   * Signature: HMAC_SHA256(raw_body, webhook_secret) === x-razorpay-signature header
   */
  public razorpayWebhook = this.catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      throw new AppError('Missing x-razorpay-signature header', 400);
    }

    const rawBody = req.body as Buffer;

    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid webhook signature', 401);
    }

    const event = JSON.parse(rawBody.toString());
    await this.billingService.handleRazorpayWebhook(event);

    this.sendSuccess(res, { received: true });
  });
}
