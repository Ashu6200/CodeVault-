import { BaseService } from '@core/base.service';
import { eventBus, EVENTS } from '@infra/events';
import { NotFoundError, ForbiddenError, ConflictError } from '@core/errors';
import { CreateRoleInput, UpdateRoleInput } from './role.schema';
import { prisma } from '@infra/db';

export class RoleService extends BaseService {
  constructor() {
    super();
  }

  async listRoles(workspaceId: string) {
    try {
      return await prisma.role.findMany({
        where: { workspaceId },
        include: { _count: { select: { members: true } } },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to list roles');
    }
  }

  async createRole(workspaceId: string, data: CreateRoleInput, actorId: string) {
    try {
      const existing = await prisma.role.findUnique({
        where: { workspaceId_name: { workspaceId, name: data.name } },
      });
      if (existing) throw new ConflictError(`Role '${data.name}' already exists`);

      const role = await prisma.role.create({
        data: { ...data, workspaceId },
      });
      eventBus.emit(EVENTS.ROLE_CREATED, role, actorId, workspaceId);
      return role;
    } catch (error) {
      this.handleError(error, 'Failed to create role');
    }
  }

  async updateRole(id: string, data: UpdateRoleInput, actorId: string) {
    try {
      const role = await prisma.role.findUnique({ where: { id } });
      if (!role) throw new NotFoundError('Role', id);
      if (role.isSystem && data.name) throw new ForbiddenError('Cannot rename system roles');

      const updated = await prisma.role.update({
        where: { id },
        data,
      });
      eventBus.emit(EVENTS.ROLE_UPDATED, updated, actorId, role.workspaceId);
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to update role');
    }
  }

  async deleteRole(id: string, actorId: string) {
    try {
      const role = await prisma.role.findUnique({ where: { id } });
      if (!role) throw new NotFoundError('Role', id);
      if (role.isSystem) throw new ForbiddenError('Cannot delete system roles');

      await prisma.role.delete({ where: { id } });
      eventBus.emit(EVENTS.ROLE_DELETED, { id, name: role.name }, actorId, role.workspaceId);
      return { id, deleted: true };
    } catch (error) {
      this.handleError(error, 'Failed to delete role');
    }
  }
}

