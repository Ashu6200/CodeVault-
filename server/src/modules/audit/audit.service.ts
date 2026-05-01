import { BaseService } from '@core/base.service';
import { AuditRepository } from './audit.repository';
import { eventBus, EVENTS } from '@infra/events';
import { AuditAction } from '@prisma/client';
import { ListAuditLogsQuery } from './audit.schema';
import { logger } from '@infra/logger';

const log = logger.child('AuditService');

export class AuditService extends BaseService {
  private auditRepo: AuditRepository;

  constructor() {
    super();
    this.auditRepo = new AuditRepository();
  }

  async listLogs(workspaceId: string, query: ListAuditLogsQuery) {
    try {
      return await this.auditRepo.findByWorkspace(
        workspaceId,
        { page: query.page, limit: query.limit },
        {
          action: query.action,
          actorId: query.actorId,
          resourceType: query.resourceType,
          resourceId: query.resourceId,
        },
      );
    } catch (error) {
      this.handleError(error, 'Failed to list audit logs');
    }
  }

  async logAction(data: {
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    details?: any;
    actorId: string;
    workspaceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      return await this.auditRepo.logAction(data);
    } catch (error) {
      log.error('Failed to log audit action:', error);
      // Don't throw — audit logging should not break the main flow
    }
  }

  /**
   * Register event listeners for automatic audit logging
   */
  registerEventListeners() {
    eventBus.on(EVENTS.DOCUMENT_CREATED, (event) => {
      this.logAction({
        action: 'CREATE',
        resourceType: 'Document',
        resourceId: event.payload.documentId,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.DOCUMENT_UPDATED, (event) => {
      this.logAction({
        action: 'UPDATE',
        resourceType: 'Document',
        resourceId: event.payload.documentId,
        details: { changes: event.payload.changes },
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.DOCUMENT_DELETED, (event) => {
      this.logAction({
        action: 'DELETE',
        resourceType: 'Document',
        resourceId: event.payload.documentId,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.MEMBER_JOINED, (event) => {
      this.logAction({
        action: 'CREATE',
        resourceType: 'Member',
        resourceId: event.payload.memberId,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.MEMBER_REMOVED, (event) => {
      this.logAction({
        action: 'DELETE',
        resourceType: 'Member',
        resourceId: event.payload.memberId,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.INVITE_SENT, (event) => {
      this.logAction({
        action: 'INVITE_SENT',
        resourceType: 'Invite',
        resourceId: event.payload.inviteId,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.INVITE_ACCEPTED, (event) => {
      this.logAction({
        action: 'INVITE_ACCEPTED',
        resourceType: 'Invite',
        resourceId: event.payload.inviteId,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.INVITE_REVOKED, (event) => {
      this.logAction({
        action: 'INVITE_REVOKED',
        resourceType: 'Invite',
        resourceId: event.payload.inviteId,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.ROLE_CREATED, (event) => {
      this.logAction({
        action: 'ROLE_CREATED',
        resourceType: 'Role',
        resourceId: event.payload.id,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.ROLE_UPDATED, (event) => {
      this.logAction({
        action: 'ROLE_UPDATED',
        resourceType: 'Role',
        resourceId: event.payload.id,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.ROLE_DELETED, (event) => {
      this.logAction({
        action: 'ROLE_DELETED',
        resourceType: 'Role',
        resourceId: event.payload.id,
        actorId: event.actorId!,
        workspaceId: event.workspaceId,
      });
    });

    eventBus.on(EVENTS.API_KEY_CREATED, (event) => {
      this.logAction({
        action: 'API_KEY_CREATED',
        resourceType: 'ApiKey',
        resourceId: event.payload.keyId,
        actorId: event.actorId!,
      });
    });

    eventBus.on(EVENTS.API_KEY_REVOKED, (event) => {
      this.logAction({
        action: 'API_KEY_REVOKED',
        resourceType: 'ApiKey',
        resourceId: event.payload.keyId,
        actorId: event.actorId!,
      });
    });

    eventBus.on(EVENTS.ACCOUNT_DEACTIVATED, (event) => {
      this.logAction({
        action: 'DELETE',
        resourceType: 'User',
        resourceId: event.payload.userId,
        actorId: event.actorId!,
      });
    });

    log.info('Audit event listeners registered');
  }
}
