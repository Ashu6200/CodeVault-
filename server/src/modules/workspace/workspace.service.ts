import { BaseService } from '@core/base.service';
import { WorkspaceRepository } from './workspace.repository';
import { eventBus, EVENTS } from '@infra/events';
import { NotFoundError, ConflictError, ForbiddenError } from '@core/errors';
import { logger } from '@infra/logger';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspace.schema';

// ─────────────────────────────────────────────
// Workspace Service
// ─────────────────────────────────────────────

const log = logger.child('WorkspaceService');

export class WorkspaceService extends BaseService {
  private workspaceRepo: WorkspaceRepository;

  constructor() {
    super();
    this.workspaceRepo = new WorkspaceRepository();
  }

  /**
   * Create a new workspace with default roles and owner membership
   */
  async createWorkspace(data: CreateWorkspaceInput, ownerId: string) {
    try {
      // Check slug uniqueness
      const existing = await this.workspaceRepo.findBySlug(data.slug);
      if (existing) {
        throw new ConflictError(`Workspace slug '${data.slug}' is already taken`);
      }

      const workspace = await this.workspaceRepo.createWithDefaults({
        ...data,
        ownerId,
      });

      // Emit domain event
      eventBus.emit(EVENTS.WORKSPACE_CREATED, workspace, ownerId, workspace.id);

      log.info(`Workspace created: ${workspace.id} (${workspace.slug})`);
      return workspace;
    } catch (error) {
      this.handleError(error, 'Failed to create workspace');
    }
  }

  /**
   * Get workspace by ID with details
   */
  async getWorkspaceById(id: string) {
    try {
      const workspace = await this.workspaceRepo.findByIdWithDetails(id);
      if (!workspace) {
        throw new NotFoundError('Workspace', id);
      }
      return workspace;
    } catch (error) {
      this.handleError(error, 'Failed to fetch workspace');
    }
  }

  /**
   * Get workspace by slug
   */
  async getWorkspaceBySlug(slug: string) {
    try {
      const workspace = await this.workspaceRepo.findBySlug(slug);
      if (!workspace) {
        throw new NotFoundError('Workspace');
      }
      return workspace;
    } catch (error) {
      this.handleError(error, 'Failed to fetch workspace');
    }
  }

  /**
   * Get all workspaces the user is a member of
   */
  async getUserWorkspaces(userId: string) {
    try {
      return await this.workspaceRepo.findUserWorkspaces(userId);
    } catch (error) {
      this.handleError(error, 'Failed to fetch user workspaces');
    }
  }

  /**
   * Update workspace settings
   */
  async updateWorkspace(id: string, data: UpdateWorkspaceInput, actorId: string) {
    try {
      // If updating slug, check uniqueness
      if (data.slug) {
        const existing = await this.workspaceRepo.findBySlug(data.slug);
        if (existing && existing.id !== id) {
          throw new ConflictError(`Workspace slug '${data.slug}' is already taken`);
        }
      }

      const workspace = await this.workspaceRepo.update(id, data);

      eventBus.emit(EVENTS.WORKSPACE_UPDATED, workspace, actorId, workspace.id);
      log.info(`Workspace updated: ${workspace.id}`);

      return workspace;
    } catch (error) {
      this.handleError(error, 'Failed to update workspace');
    }
  }

  /**
   * Delete workspace (owner only)
   */
  async deleteWorkspace(id: string, actorId: string) {
    try {
      const workspace = await this.workspaceRepo.findById(id);
      if (!workspace) {
        throw new NotFoundError('Workspace', id);
      }

      if (workspace.ownerId !== actorId) {
        throw new ForbiddenError('Only the workspace owner can delete it');
      }

      await this.workspaceRepo.delete(id);

      eventBus.emit(EVENTS.WORKSPACE_DELETED, { id, name: workspace.name }, actorId);
      log.info(`Workspace deleted: ${id}`);

      return { id, deleted: true };
    } catch (error) {
      this.handleError(error, 'Failed to delete workspace');
    }
  }

  /**
   * Check if workspace has remaining seats
   */
  async checkSeatLimit(workspaceId: string): Promise<boolean> {
    try {
      const workspace = await this.workspaceRepo.findById(workspaceId);
      if (!workspace || !workspace.seatLimit) {
        return true; // No limit set
      }

      const memberCount = await this.workspaceRepo.countMembers(workspaceId);
      return memberCount < workspace.seatLimit;
    } catch (error) {
      this.handleError(error, 'Failed to check seat limit');
    }
  }
}
