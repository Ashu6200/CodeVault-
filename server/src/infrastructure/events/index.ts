import { EventEmitter } from 'events';
import { DomainEvent } from '@core/types/common';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Domain Event Bus
// In-memory EventEmitter for inter-module communication.
// Modules emit events; other modules subscribe to handle them.
// This avoids tight coupling between modules.
//
// When ready to split into microservices, replace this with
// Redis pub/sub or a message broker (RabbitMQ, Kafka).
// ─────────────────────────────────────────────

const log = logger.child('EventBus');

class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50); // Allow many subscribers
  }

  /**
   * Emit a domain event
   */
  emit<T = any>(eventType: string, payload: T, actorId?: string, workspaceId?: string): void {
    const event: DomainEvent<T> = {
      type: eventType,
      payload,
      timestamp: new Date(),
      actorId,
      workspaceId,
    };
    log.debug(`Emitting event: ${eventType}`, { actorId, workspaceId });
    this.emitter.emit(eventType, event);
  }

  /**
   * Subscribe to a domain event
   */
  on<T = any>(eventType: string, handler: (event: DomainEvent<T>) => void | Promise<void>): void {
    this.emitter.on(eventType, async (event: DomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        log.error(`Error handling event '${eventType}':`, error);
      }
    });
    log.debug(`Subscribed to event: ${eventType}`);
  }

  /**
   * Subscribe to a domain event once
   */
  once<T = any>(eventType: string, handler: (event: DomainEvent<T>) => void | Promise<void>): void {
    this.emitter.once(eventType, async (event: DomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        log.error(`Error handling one-time event '${eventType}':`, error);
      }
    });
  }

  /**
   * Remove all listeners for a specific event
   */
  removeAll(eventType?: string): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

// ─────────────────────────────────────────────
// Domain Event Type Constants
// ─────────────────────────────────────────────

export const EVENTS = {
  // Document events
  DOCUMENT_CREATED: 'document.created',
  DOCUMENT_UPDATED: 'document.updated',
  DOCUMENT_DELETED: 'document.deleted',

  // Comment events
  COMMENT_CREATED: 'comment.created',
  COMMENT_RESOLVED: 'comment.resolved',

  // Member events
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',

  // Invite events
  INVITE_SENT: 'invite.sent',
  INVITE_ACCEPTED: 'invite.accepted',
  INVITE_REVOKED: 'invite.revoked',

  // Workspace events
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_DELETED: 'workspace.deleted',

  // Auth events
  USER_LOGGED_IN: 'user.loggedIn',
  USER_LOGGED_OUT: 'user.loggedOut',
  ACCOUNT_DEACTIVATED: 'account.deactivated',

  // Billing events
  SUBSCRIPTION_CHANGED: 'subscription.changed',

  // API key events
  API_KEY_CREATED: 'apiKey.created',
  API_KEY_REVOKED: 'apiKey.revoked',

  // Role events
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',
  PERMISSION_CHANGED: 'permission.changed',
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

/** Singleton event bus instance */
export const eventBus = new EventBus();
