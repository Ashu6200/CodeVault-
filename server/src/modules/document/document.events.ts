import { eventBus, EVENTS } from '@infra/events';
import { notificationQueue, webhookQueue } from '@infra/queue';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Document Event Handlers
// Reacts to document domain events by dispatching
// notifications and webhooks asynchronously.
// ─────────────────────────────────────────────

const log = logger.child('DocumentEvents');

export const registerDocumentEvents = () => {
  // ── Document Created ──
  eventBus.on(EVENTS.DOCUMENT_CREATED, async (event) => {
    const { documentId, title, authorId, workspaceId } = event.payload;

    // Queue notification for workspace members
    await notificationQueue.add('doc-created', {
      userId: authorId, // In production, send to all workspace members
      workspaceId,
      type: 'document_created',
      payload: { documentId, title, actorId: authorId },
    });

    log.debug(`Document created event processed: ${documentId}`);
  });

  // ── Document Updated ──
  eventBus.on(EVENTS.DOCUMENT_UPDATED, async (event) => {
    const { documentId, title, updatedBy, workspaceId } = event.payload;

    log.debug(`Document updated event processed: ${documentId}`);
  });

  // ── Document Deleted ──
  eventBus.on(EVENTS.DOCUMENT_DELETED, async (event) => {
    const { documentId, title, deletedBy, workspaceId } = event.payload;

    log.debug(`Document deleted event processed: ${documentId}`);
  });

  log.debug('Document event handlers registered');
};
