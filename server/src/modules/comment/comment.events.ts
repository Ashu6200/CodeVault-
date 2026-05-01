import { eventBus, EVENTS } from '@infra/events';
import { notificationQueue } from '@infra/queue';
import { logger } from '@infra/logger';

const log = logger.child('CommentEvents');

export const registerCommentEvents = () => {
  eventBus.on(EVENTS.COMMENT_CREATED, async (event) => {
    const { commentId, documentId, authorId } = event.payload;
    // TODO: Notify document author and mentioned users
    log.debug(`Comment created: ${commentId} on document ${documentId}`);
  });

  eventBus.on(EVENTS.COMMENT_RESOLVED, async (event) => {
    const { commentId, documentId } = event.payload;
    log.debug(`Comment resolved: ${commentId}`);
  });

  log.debug('Comment event handlers registered');
};
