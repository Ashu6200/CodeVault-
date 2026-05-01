import { BaseService } from '@core/base.service';
import { MemberRepository } from './member.repository';
import { eventBus, EVENTS } from '@infra/events';
import { NotFoundError, ConflictError, ForbiddenError } from '@core/errors';
import { AddMemberInput, UpdateMemberInput } from './member.schema';
import { prisma } from '@infra/db';

export class MemberService extends BaseService {
  private memberRepo: MemberRepository;

  constructor() {
    super();
    this.memberRepo = new MemberRepository();
  }

  async listMembers(workspaceId: string) {
    try {
      return await this.memberRepo.findByWorkspace(workspaceId);
    } catch (error) {
      this.handleError(error, 'Failed to list members');
    }
  }

  async addMember(workspaceId: string, data: AddMemberInput, actorId: string) {
    try {
      // Check seat limit
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (workspace?.seatLimit) {
        const count = await this.memberRepo.count({ workspaceId, isActive: true });
        if (count >= workspace.seatLimit) {
          throw new ForbiddenError('Workspace seat limit reached');
        }
      }

      const member = await this.memberRepo.create({
        userId: data.userId,
        workspaceId,
        roleId: data.roleId,
      });

      eventBus.emit(
        EVENTS.MEMBER_JOINED,
        { memberId: member.id, userId: data.userId },
        actorId,
        workspaceId,
      );
      return member;
    } catch (error) {
      this.handleError(error, 'Failed to add member');
    }
  }

  async updateMember(id: string, data: UpdateMemberInput, actorId: string) {
    try {
      const member = await this.memberRepo.findById(id);
      if (!member) throw new NotFoundError('Member', id);
      return await this.memberRepo.update(id, data);
    } catch (error) {
      this.handleError(error, 'Failed to update member');
    }
  }

  async removeMember(id: string, actorId: string) {
    try {
      const member = await this.memberRepo.findById(id);
      if (!member) throw new NotFoundError('Member', id);

      await this.memberRepo.delete(id);
      eventBus.emit(
        EVENTS.MEMBER_REMOVED,
        { memberId: id, userId: member.userId },
        actorId,
        member.workspaceId,
      );
      return { id, removed: true };
    } catch (error) {
      this.handleError(error, 'Failed to remove member');
    }
  }
}
