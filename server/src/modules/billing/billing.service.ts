import { BaseService } from '@core/base.service';
import { BillingRepository } from './billing.repository';
import { eventBus, EVENTS } from '@infra/events';
import { prisma } from '@infra/db';
import { ListBillingHistoryQuery } from './billing.schema';
import { logger } from '@infra/logger';

const log = logger.child('BillingService');

export class BillingService extends BaseService {
  private billingRepo: BillingRepository;

  constructor() {
    super();
    this.billingRepo = new BillingRepository();
  }

  async getSubscriptionStatus(workspaceId: string) {
    try {
      return await this.billingRepo.getSubscriptionStatus(workspaceId);
    } catch (error) {
      this.handleError(error, 'Failed to get subscription status');
    }
  }

  async listHistory(workspaceId: string, query: ListBillingHistoryQuery) {
    try {
      return await this.billingRepo.findByWorkspace(workspaceId, {
        page: query.page,
        limit: query.limit,
      });
    } catch (error) {
      this.handleError(error, 'Failed to list billing history');
    }
  }

  /**
   * Handle Stripe webhook events.
   * In production, verify the webhook signature with Stripe SDK.
   */
  async handleStripeWebhook(event: any) {
    try {
      log.info(`Processing Stripe event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed': {
          // Handle new subscription
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object;
          const workspace = await prisma.workspace.findFirst({
            where: { stripeCustomerId: invoice.customer },
          });
          if (workspace) {
            await prisma.billingTransaction.create({
              data: {
                workspaceId: workspace.id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                description: `Invoice ${invoice.number}`,
                status: 'paid',
                stripeChargeId: invoice.charge,
                planSnapshot: workspace.subscriptionPlan,
              },
            });
          }
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const workspace = await prisma.workspace.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (workspace) {
            await prisma.workspace.update({
              where: { id: workspace.id },
              data: {
                subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
                subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            });
            eventBus.emit(
              EVENTS.SUBSCRIPTION_CHANGED,
              {
                workspaceId: workspace.id,
                plan: workspace.subscriptionPlan,
                status: subscription.status,
              },
              undefined,
              workspace.id,
            );
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object;
          const ws = await prisma.workspace.findFirst({
            where: { stripeSubscriptionId: sub.id },
          });
          if (ws) {
            await prisma.workspace.update({
              where: { id: ws.id },
              data: {
                subscriptionStatus: 'CANCELED',
                subscriptionPlan: 'FREE',
              },
            });
          }
          break;
        }
      }
    } catch (error) {
      log.error('Stripe webhook processing error:', error);
      throw error;
    }
  }
}
