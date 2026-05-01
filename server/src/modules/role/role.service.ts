import { BaseService } from '@core/base.service';
import { RoleRepository } from './role.repository';
import { eventBus, EVENTS } from '@infra/events';
import { NotFoundError, ForbiddenError, ConflictError } from '@core/errors';
import { CreateRoleInput, UpdateRoleInput } from './role.schema';

export class RoleService extends BaseService {
  private roleRepo: RoleRepository;

  constructor() {
    super();
    this.roleRepo = new RoleRepository();
  }

  async listRoles(workspaceId: string) {
    try {
      return await this.roleRepo.findByWorkspace(workspaceId);
    } catch (error) {
      this.handleError(error, 'Failed to list roles');
    }
  }

  async createRole(workspaceId: string, data: CreateRoleInput, actorId: string) {
    try {
      const existing = await this.roleRepo.findByNameAndWorkspace(data.name, workspaceId);
      if (existing) throw new ConflictError(`Role '${data.name}' already exists`);

      const role = await this.roleRepo.create({ ...data, workspaceId });
      eventBus.emit(EVENTS.ROLE_CREATED, role, actorId, workspaceId);
      return role;
    } catch (error) {
      this.handleError(error, 'Failed to create role');
    }
  }

  async updateRole(id: string, data: UpdateRoleInput, actorId: string) {
    try {
      const role = await this.roleRepo.findById(id);
      if (!role) throw new NotFoundError('Role', id);
      if (role.isSystem && data.name) throw new ForbiddenError('Cannot rename system roles');

      const updated = await this.roleRepo.update(id, data);
      eventBus.emit(EVENTS.ROLE_UPDATED, updated, actorId, role.workspaceId);
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to update role');
    }
  }

  async deleteRole(id: string, actorId: string) {
    try {
      const role = await this.roleRepo.findById(id);
      if (!role) throw new NotFoundError('Role', id);
      if (role.isSystem) throw new ForbiddenError('Cannot delete system roles');

      await this.roleRepo.delete(id);
      eventBus.emit(EVENTS.ROLE_DELETED, { id, name: role.name }, actorId, role.workspaceId);
      return { id, deleted: true };
    } catch (error) {
      this.handleError(error, 'Failed to delete role');
    }
  }
}
