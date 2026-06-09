import { BaseService } from '@core/base.service';
import { webhookQueue } from '@infra/queue';
import { NotFoundError } from '@core/errors';
import { CreateWebhookInput, UpdateWebhookInput } from './webhook.schema';
import { WebhookEvent } from '@prisma/client';
import crypto from 'crypto';
import { logger } from '@infra/logger';
import { prisma } from '@infra/db';

const log = logger.child('WebhookService');

export class WebhookService extends BaseService {
  constructor() {
    super();
  }

  async listEndpoints(workspaceId: string) {
    try {
      return await prisma.webhookEndpoint.findMany({
        where: { workspaceId },
        include: { _count: { select: { deliveries: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to list webhooks');
    }
  }

  async createEndpoint(workspaceId: string, data: CreateWebhookInput) {
    try {
      const secret = crypto.randomBytes(32).toString('hex');
      return await prisma.webhookEndpoint.create({
        data: {
          ...data,
          workspaceId,
          secret,
        },
      });
    } catch (error) {
      this.handleError(error, 'Failed to create webhook');
    }
  }

  async updateEndpoint(id: string, data: UpdateWebhookInput) {
    try {
      const endpoint = await prisma.webhookEndpoint.findUnique({ where: { id } });
      if (!endpoint) throw new NotFoundError('Webhook endpoint', id);
      return await prisma.webhookEndpoint.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error, 'Failed to update webhook');
    }
  }

  async deleteEndpoint(id: string) {
    try {
      const endpoint = await prisma.webhookEndpoint.findUnique({ where: { id } });
      if (!endpoint) throw new NotFoundError('Webhook endpoint', id);
      await prisma.webhookEndpoint.delete({ where: { id } });
      return { id, deleted: true };
    } catch (error) {
      this.handleError(error, 'Failed to delete webhook');
    }
  }

  async getDeliveries(endpointId: string) {
    try {
      return await prisma.webhookDelivery.findMany({
        where: { webhookEndpointId: endpointId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      this.handleError(error, 'Failed to get deliveries');
    }
  }

  /**
   * Trigger webhooks for a workspace event.
   * Finds all active endpoints subscribed to the event and queues delivery.
   */
  async triggerEvent(workspaceId: string, event: WebhookEvent, payload: any) {
    try {
      const endpoints = await prisma.webhookEndpoint.findMany({
        where: {
          workspaceId,
          isActive: true,
          events: { has: event },
        },
      });

      for (const endpoint of endpoints) {
        // Create delivery record
        const delivery = await prisma.webhookDelivery.create({
          data: {
            event,
            payload,
            webhookEndpointId: endpoint.id,
          },
        });

        // Queue delivery job
        await webhookQueue.add(`webhook-${delivery.id}`, {
          deliveryId: delivery.id,
          endpointUrl: endpoint.url,
          secret: endpoint.secret,
          event,
          payload,
        });
      }

      log.debug(
        `Triggered ${event} webhook for ${endpoints.length} endpoints in workspace ${workspaceId}`,
      );
    } catch (error) {
      log.error('Failed to trigger webhooks:', error);
      // Don't throw — webhook failures should not block the main flow
    }
  }
}

