import crypto from 'crypto';
import { BaseService } from '@core/base.service';
import { prisma } from '@infra/db';
import { razorpay } from '@infra/razorpay';
import { config } from '@infra/config';
import { logger } from '@infra/logger';
import {
  ListBillingHistoryQuery,
  CreateSubscriptionInput,
  VerifyPaymentInput,
  CancelSubscriptionInput,
  getRazorpayPlanIds,
} from './billing.schema';
import { AppError } from '@core/errors';

const log = logger.child('BillingService');

// Razorpay webhook payload types (not shipped in the SDK)
interface RazorpaySubscriptionEntity {
  id: string;
  plan_id: string;
  status: string;
  current_end?: number;
  current_start?: number;
}

interface RazorpayPaymentEntity {
  id: string;
  amount: number;
  currency: string;
  subscription_id?: string;
}

export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    subscription?: { entity: RazorpaySubscriptionEntity };
    payment?: { entity: RazorpayPaymentEntity };
  };
}

export class BillingService extends BaseService {
  constructor() {
    super();
  }

  async getSubscriptionStatus(workspaceId: string) {
    try {
      return await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionPeriodEnd: true,
          razorpayCustomerId: true,
          razorpaySubscriptionId: true,
          seatLimit: true,
        },
      });
    } catch (error) {
      this.handleError(error, 'Failed to get subscription status');
    }
  }

  async listHistory(workspaceId: string, query: ListBillingHistoryQuery) {
    try {
      return await this.paginate(prisma.billingTransaction, {
        page: query.page,
        limit: query.limit,
      }, {
        where: { workspaceId },
      });
    } catch (error) {
      this.handleError(error, 'Failed to list billing history');
    }
  }

  /**
   * Creates a Razorpay subscription for the given plan.
   * Returns subscription_id and key_id for the frontend to open the checkout modal.
   */
  async createSubscription(workspaceId: string, input: CreateSubscriptionInput) {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true },
      });

      if (!workspace) {
        throw new AppError('Workspace not found', 404);
      }

      const planId = getRazorpayPlanIds()[input.plan];
      if (!planId) {
        throw new AppError(
          `Razorpay plan ID not configured for plan: ${input.plan}`,
          500,
        );
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12,
        quantity: 1,
      });

      // Persist subscription ID so webhooks can resolve the workspace
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          razorpaySubscriptionId: subscription.id,
          subscriptionStatus: 'INCOMPLETE',
        },
      });

      log.info(`Razorpay subscription created for workspace ${workspaceId}: ${subscription.id}`);

      return {
        subscriptionId: subscription.id,
        keyId: config.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      this.handleError(error, 'Failed to create subscription');
    }
  }

  /**
   * Verifies the HMAC SHA256 signature sent by Razorpay after checkout.
   * Signature = HMAC_SHA256(payment_id + "|" + subscription_id, key_secret)
   */
  async verifyPayment(workspaceId: string, input: VerifyPaymentInput) {
    try {
      const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = input;

      const expectedSignature = crypto
        .createHmac('sha256', config.RAZORPAY_KEY_SECRET || '')
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new AppError('Invalid payment signature', 400);
      }

      const rzpSubscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
      const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);

      const plan = (
        Object.entries(getRazorpayPlanIds()).find(([, id]) => id === rzpSubscription.plan_id)?.[0]
      ) as 'TEAM' | 'ENTERPRISE' | undefined;

      await prisma.$transaction([
        prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            subscriptionPlan: plan ?? 'FREE',
            subscriptionStatus: 'ACTIVE',
            subscriptionPeriodEnd: rzpSubscription.current_end
              ? new Date((rzpSubscription.current_end as number) * 1000)
              : null,
          },
        }),
        prisma.billingTransaction.create({
          data: {
            workspaceId,
            amount: rzpPayment.amount as number,
            currency: rzpPayment.currency as string,
            description: `Subscription payment - ${plan ?? 'UNKNOWN'}`,
            status: 'paid',
            razorpayPaymentId: razorpay_payment_id,
            planSnapshot: plan,
          },
        }),
      ]);

      log.info(`Payment verified for workspace ${workspaceId}: ${razorpay_payment_id}`);
      return { verified: true };
    } catch (error) {
      this.handleError(error, 'Failed to verify payment');
    }
  }

  /**
   * Cancels the active Razorpay subscription.
   * cancelAtPeriodEnd=true keeps access until the billing period ends.
   */
  async cancelSubscription(workspaceId: string, input: CancelSubscriptionInput) {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { razorpaySubscriptionId: true },
      });

      if (!workspace?.razorpaySubscriptionId) {
        throw new AppError('No active subscription found', 404);
      }

      await razorpay.subscriptions.cancel(workspace.razorpaySubscriptionId, input.cancelAtPeriodEnd);

      if (!input.cancelAtPeriodEnd) {
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            subscriptionStatus: 'CANCELED',
            subscriptionPlan: 'FREE',
            razorpaySubscriptionId: null,
          },
        });
      }
      // If cancelAtPeriodEnd, the webhook subscription.completed will finalise it

      log.info(`Subscription cancellation requested for workspace ${workspaceId}`);
      return { cancelled: true, cancelAtPeriodEnd: input.cancelAtPeriodEnd };
    } catch (error) {
      this.handleError(error, 'Failed to cancel subscription');
    }
  }

  /**
   * Processes inbound Razorpay webhook events.
   * Signature verification is done in the controller before this is called.
   */
  async handleRazorpayWebhook(event: RazorpayWebhookEvent) {
    try {
      log.info(`Processing Razorpay event: ${event.event}`);

      switch (event.event) {
        case 'subscription.activated': {
          const sub = event.payload.subscription?.entity;
          if (!sub) break;
          const ws = await prisma.workspace.findFirst({
            where: { razorpaySubscriptionId: sub.id },
          });
          if (!ws) break;
          await prisma.workspace.update({
            where: { id: ws.id },
            data: {
              subscriptionStatus: 'ACTIVE',
              subscriptionPeriodEnd: sub.current_end
                ? new Date(sub.current_end * 1000)
                : null,
            },
          });
          break;
        }

        case 'subscription.charged': {
          const payment = event.payload.payment?.entity;
          const sub = event.payload.subscription?.entity;
          if (!payment || !sub) break;
          const ws = await prisma.workspace.findFirst({
            where: { razorpaySubscriptionId: sub.id },
          });
          if (!ws) break;
          await prisma.$transaction([
            prisma.billingTransaction.create({
              data: {
                workspaceId: ws.id,
                amount: payment.amount,
                currency: payment.currency,
                description: 'Recurring subscription payment',
                status: 'paid',
                razorpayPaymentId: payment.id,
                planSnapshot: ws.subscriptionPlan,
              },
            }),
            prisma.workspace.update({
              where: { id: ws.id },
              data: {
                subscriptionStatus: 'ACTIVE',
                subscriptionPeriodEnd: sub.current_end
                  ? new Date(sub.current_end * 1000)
                  : null,
              },
            }),
          ]);
          break;
        }

        case 'subscription.updated': {
          const sub = event.payload.subscription?.entity;
          if (!sub) break;
          const ws = await prisma.workspace.findFirst({
            where: { razorpaySubscriptionId: sub.id },
          });
          if (!ws) break;
          const status = sub.status === 'active' ? 'ACTIVE' : 'PAST_DUE';
          await prisma.workspace.update({
            where: { id: ws.id },
            data: {
              subscriptionStatus: status,
              subscriptionPeriodEnd: sub.current_end
                ? new Date(sub.current_end * 1000)
                : null,
            },
          });
          break;
        }

        case 'subscription.completed':
        case 'subscription.cancelled': {
          const sub = event.payload.subscription?.entity;
          if (!sub) break;
          const ws = await prisma.workspace.findFirst({
            where: { razorpaySubscriptionId: sub.id },
          });
          if (!ws) break;
          await prisma.workspace.update({
            where: { id: ws.id },
            data: {
              subscriptionStatus: 'CANCELED',
              subscriptionPlan: 'FREE',
              razorpaySubscriptionId: null,
            },
          });
          break;
        }

        case 'payment.failed': {
          const payment = event.payload.payment?.entity;
          if (!payment?.subscription_id) break;
          const ws = await prisma.workspace.findFirst({
            where: { razorpaySubscriptionId: payment.subscription_id },
          });
          if (!ws) break;
          await prisma.workspace.update({
            where: { id: ws.id },
            data: { subscriptionStatus: 'PAST_DUE' },
          });
          break;
        }

        default:
          log.debug(`Unhandled Razorpay event: ${event.event}`);
      }
    } catch (error) {
      log.error('Razorpay webhook processing error:', error);
      throw error;
    }
  }
}
