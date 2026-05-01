import { BaseService } from '@core/base.service';
import { InviteRepository } from './invite.repository';
import { eventBus, EVENTS } from '@infra/events';
import { emailQueue } from '@infra/queue';
import { NotFoundError, ConflictError, ForbiddenError } from '@core/errors';
import { CreateInviteInput } from './invite.schema';
import { prisma } from '@infra/db';
import crypto from 'crypto';

export class InviteService extends BaseService {
  private inviteRepo: InviteRepository;

  constructor() {
    super();
    this.inviteRepo = new InviteRepository();
  }

  async listPending(workspaceId: string) {
    try {
      return await this.inviteRepo.findPendingByWorkspace(workspaceId);
    } catch (error) {
      this.handleError(error, 'Failed to list invites');
    }
  }

  async sendInvite(workspaceId: string, data: CreateInviteInput, invitedById: string) {
    try {
      // Check for existing pending invite
      const existing = await this.inviteRepo.findByEmailAndWorkspace(data.email, workspaceId);
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

      const invite = await this.inviteRepo.create({
        email: data.email,
        token,
        roleId: data.roleId,
        expiresAt,
        workspaceId,
        invitedById,
      });

      // Queue invite email
      await emailQueue.add('invite-email', {
        to: data.email,
        subject: 'You have been invited to a workspace',
        html: `<p>You've been invited! Use this token: ${token}</p>`,
      });

      eventBus.emit(
        EVENTS.INVITE_SENT,
        { inviteId: invite.id, email: data.email },
        invitedById,
        workspaceId,
      );
      return invite;
    } catch (error) {
      this.handleError(error, 'Failed to send invite');
    }
  }

  async acceptInvite(token: string, userId: string) {
    try {
      const invite = await this.inviteRepo.findByToken(token);
      if (!invite) throw new NotFoundError('Invite');
      if (invite.acceptedAt) throw new ConflictError('Invite already accepted');
      if (invite.revokedAt) throw new ForbiddenError('Invite has been revoked');
      if (invite.expiresAt < new Date()) throw new ForbiddenError('Invite has expired');

      // Accept invite + create member in transaction
      const result = await prisma.$transaction(async (tx: any) => {
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

      eventBus.emit(
        EVENTS.INVITE_ACCEPTED,
        { inviteId: invite.id, userId },
        userId,
        invite.workspaceId,
      );
      return result;
    } catch (error) {
      this.handleError(error, 'Failed to accept invite');
    }
  }

  async revokeInvite(id: string, actorId: string) {
    try {
      const invite = await this.inviteRepo.findById(id);
      if (!invite) throw new NotFoundError('Invite', id);
      if (invite.acceptedAt) throw new ConflictError('Cannot revoke an accepted invite');

      const updated = await this.inviteRepo.update(id, { revokedAt: new Date() });
      eventBus.emit(EVENTS.INVITE_REVOKED, { inviteId: id }, actorId, invite.workspaceId);
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to revoke invite');
    }
  }
}
