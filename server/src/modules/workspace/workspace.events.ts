import { eventBus, EVENTS } from '@infra/events';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Workspace Event Handlers
// Listens for domain events from other modules.
// ─────────────────────────────────────────────

const log = logger.child('WorkspaceEvents');

export const registerWorkspaceEvents = () => {
  // Log workspace creation for audit
  eventBus.on(EVENTS.WORKSPACE_CREATED, (event) => {
    log.info(`Workspace created: ${event.payload.name} by user ${event.actorId}`);
  });

  // Check seat limit when a member joins
  eventBus.on(EVENTS.MEMBER_JOINED, (event) => {
    log.info(`New member joined workspace: ${event.workspaceId}`);
    // Could trigger notifications to workspace admins, etc.
  });

  log.debug('Workspace event handlers registered');
};
