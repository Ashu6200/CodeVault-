import { eventBus, EVENTS } from '@infra/events';
import { notificationQueue } from '@infra/queue';
import { logger } from '@infra/logger';

const log = logger.child('NotificationEvents');

export const registerNotificationEvents = () => {
  // Listen to various domain events and queue notifications

  eventBus.on(EVENTS.COMMENT_CREATED, async (event) => {
    const { commentId, documentId, authorId } = event.payload;
    // TODO: Determine who to notify (document author, mentioned users)
    log.debug(`Queueing notification for comment ${commentId}`);
  });

  eventBus.on(EVENTS.INVITE_SENT, async (event) => {
    log.debug(`Invite notification for ${event.payload.email}`);
  });

  eventBus.on(EVENTS.MEMBER_JOINED, async (event) => {
    log.debug(`Member joined notification for workspace ${event.workspaceId}`);
  });

  log.debug('Notification event handlers registered');
};
