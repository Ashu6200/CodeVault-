import { BaseService } from '@core/base.service';
import { auditService } from '@modules/audit';
import { NotFoundError, ForbiddenError } from '@core/errors';
import { AddMemberInput, UpdateMemberInput } from './member.schema';
import { prisma } from '@infra/db';

export class MemberService extends BaseService {
  constructor() {
    super();
  }

  async listMembers(workspaceId: string) {
    try {
      return await prisma.member.findMany({
        where: { workspaceId },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          role: { select: { id: true, name: true } },
        },
        orderBy: { joinedAt: 'asc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to list members');
    }
  }

  async addMember(workspaceId: string, data: AddMemberInput, actorId: string) {
    try {
      // Check seat limit
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (workspace?.seatLimit) {
        const count = await prisma.member.count({
          where: { workspaceId, isActive: true },
        });
        if (count >= workspace.seatLimit) {
          throw new ForbiddenError('Workspace seat limit reached');
        }
      }

      const member = await prisma.member.create({
        data: {
          userId: data.userId,
          workspaceId,
          roleId: data.roleId,
        },
      });

      void auditService.logAction({
        action: 'CREATE',
        resourceType: 'Member',
        resourceId: member.id,
        actorId,
        workspaceId,
      });
      return member;
    } catch (error) {
      this.handleError(error, 'Failed to add member');
    }
  }

  async updateMember(id: string, data: UpdateMemberInput, actorId: string) {
    try {
      const member = await prisma.member.findUnique({ where: { id } });
      if (!member) throw new NotFoundError('Member', id);
      return await prisma.member.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error, 'Failed to update member');
    }
  }

  async removeMember(id: string, actorId: string) {
    try {
      const member = await prisma.member.findUnique({ where: { id } });
      if (!member) throw new NotFoundError('Member', id);

      await prisma.member.delete({ where: { id } });
      void auditService.logAction({
        action: 'DELETE',
        resourceType: 'Member',
        resourceId: id,
        actorId,
        workspaceId: member.workspaceId,
      });
      return { id, removed: true };
    } catch (error) {
      this.handleError(error, 'Failed to remove member');
    }
  }
}

