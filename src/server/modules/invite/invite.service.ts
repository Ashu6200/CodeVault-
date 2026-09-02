import { BaseService } from '@core/base.service';
import { auditService } from '@modules/audit';
import { NotFoundError, ConflictError, ForbiddenError } from '@core/errors';
import { CreateInviteInput } from './invite.schema';
import { prisma } from '@infra/db';
import crypto from 'crypto';

export class InviteService extends BaseService {
  constructor() {
    super();
  }

  async listPending(workspaceId: string) {
    try {
      return await prisma.invite.findMany({
        where: {
          workspaceId,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: {
          invitedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to list invites');
    }
  }

  async sendInvite(workspaceId: string, data: CreateInviteInput, invitedById: string) {
    try {
      // Check for existing pending invite
      const existing = await prisma.invite.findFirst({
        where: {
          email: data.email,
          workspaceId,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (existing) throw new ConflictError('An active invite already exists for this email');

      // Check if already a member
      const existingMember = await prisma.member.findFirst({
        where: {
          user: { email: data.email },
          workspaceId,
        },
      });
      if (existingMember) throw new ConflictError('User is already a member of this workspace');

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + data.expiresInHours * 60 * 60 * 1000);

      const invite = await prisma.invite.create({
        data: {
          email: data.email,
          token,
          roleId: data.roleId,
          expiresAt,
          workspaceId,
          invitedById,
        },
      });

      // NOTE: invite emails are NOT sent. This used to enqueue to a BullMQ
      // email worker that was a stub — it only logged, no mail provider was
      // ever configured. The invite token is returned in the API response.

      void auditService.logAction({
        action: 'INVITE_SENT',
        resourceType: 'Invite',
        resourceId: invite.id,
        actorId: invitedById,
        workspaceId,
      });
      return invite;
    } catch (error) {
      this.handleError(error, 'Failed to send invite');
    }
  }

  async acceptInvite(token: string, userId: string) {
    try {
      const invite = await prisma.invite.findUnique({ where: { token } });
      if (!invite) throw new NotFoundError('Invite');
      if (invite.acceptedAt) throw new ConflictError('Invite already accepted');
      if (invite.revokedAt) throw new ForbiddenError('Invite has been revoked');
      if (invite.expiresAt < new Date()) throw new ForbiddenError('Invite has expired');

      // Accept invite + create member in transaction
      const result = await prisma.$transaction(async (tx) => {
        await tx.invite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date(), acceptedById: userId },
        });

        return tx.member.create({
          data: {
            userId,
            workspaceId: invite.workspaceId,
            roleId: invite.roleId,
          },
        });
      });

      void auditService.logAction({
        action: 'INVITE_ACCEPTED',
        resourceType: 'Invite',
        resourceId: invite.id,
        actorId: userId,
        workspaceId: invite.workspaceId,
      });
      return result;
    } catch (error) {
      this.handleError(error, 'Failed to accept invite');
    }
  }

  async revokeInvite(id: string, actorId: string) {
    try {
      const invite = await prisma.invite.findUnique({ where: { id } });
      if (!invite) throw new NotFoundError('Invite', id);
      if (invite.acceptedAt) throw new ConflictError('Cannot revoke an accepted invite');

      const updated = await prisma.invite.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
      void auditService.logAction({
        action: 'INVITE_REVOKED',
        resourceType: 'Invite',
        resourceId: id,
        actorId,
        workspaceId: invite.workspaceId,
      });
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to revoke invite');
    }
  }
}

