import { eventBus, EVENTS } from '@infra/events';
import { WebhookService } from './webhook.service';
import { WebhookEvent } from '@prisma/client';
import { logger } from '@infra/logger';

const log = logger.child('WebhookEvents');

export const registerWebhookEvents = () => {
  const webhookService = new WebhookService();

  // Map domain events to webhook events
  const eventMap: Array<{ domainEvent: string; webhookEvent: WebhookEvent }> = [
    { domainEvent: EVENTS.DOCUMENT_CREATED, webhookEvent: 'DOCUMENT_CREATED' },
    { domainEvent: EVENTS.DOCUMENT_UPDATED, webhookEvent: 'DOCUMENT_UPDATED' },
    { domainEvent: EVENTS.DOCUMENT_DELETED, webhookEvent: 'DOCUMENT_DELETED' },
    { domainEvent: EVENTS.MEMBER_JOINED, webhookEvent: 'MEMBER_JOINED' },
    { domainEvent: EVENTS.MEMBER_REMOVED, webhookEvent: 'MEMBER_REMOVED' },
    { domainEvent: EVENTS.SUBSCRIPTION_CHANGED, webhookEvent: 'SUBSCRIPTION_CHANGED' },
  ];

  for (const { domainEvent, webhookEvent } of eventMap) {
    eventBus.on(domainEvent, async (event) => {
      if (event.workspaceId) {
        await webhookService.triggerEvent(event.workspaceId, webhookEvent, event.payload);
      }
    });
  }

  log.debug('Webhook event handlers registered');
};
