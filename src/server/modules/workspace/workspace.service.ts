import { BaseService } from '@core/base.service';
import { Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, ForbiddenError } from '@core/errors';
import { logger } from '@infra/logger';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspace.schema';
import { prisma } from '@infra/db';

// ─────────────────────────────────────────────
// Workspace Service
// ─────────────────────────────────────────────

const log = logger.child('WorkspaceService');

export class WorkspaceService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Create a new workspace with default roles and owner membership
   */
  async createWorkspace(data: CreateWorkspaceInput, ownerId: string) {
    try {
      // Check slug uniqueness
      const existing = await prisma.workspace.findUnique({ where: { slug: data.slug } });
      if (existing) {
        throw new ConflictError(`Workspace slug '${data.slug}' is already taken`);
      }

      const workspace = await prisma.$transaction(async (tx) => {
        // 1. Create workspace
        const ws = await tx.workspace.create({
          data: {
            name: data.name,
            slug: data.slug,
            type: data.type,
            logoUrl: data.logoUrl,
            settings: (data.settings ?? Prisma.DbNull) as Prisma.InputJsonValue,
            ownerId,
          },
        });

        // 2. Create default roles
        const ownerRole = await tx.role.create({
          data: {
            name: 'Owner',
            description: 'Full workspace access',
            isSystem: true,
            workspaceId: ws.id,
            permissions: ['*'], // Wildcard — full access
          },
        });

        await tx.role.create({
          data: {
            name: 'Admin',
            description: 'Administrative access',
            isSystem: true,
            workspaceId: ws.id,
            permissions: [
              'workspace:update',
              'member:manage',
              'role:manage',
              'invite:manage',
              'doc:create',
              'doc:read',
              'doc:update',
              'doc:delete',
              'comment:create',
              'comment:read',
              'comment:update',
              'comment:delete',
              'comment:resolve',
              'webhook:manage',
              'apikey:manage',
              'audit:read',
              'billing:read',
            ],
          },
        });

        await tx.role.create({
          data: {
            name: 'Member',
            description: 'Standard member access',
            isSystem: true,
            workspaceId: ws.id,
            permissions: [
              'doc:create',
              'doc:read',
              'doc:update',
              'comment:create',
              'comment:read',
              'comment:update',
              'member:read',
            ],
          },
        });

        await tx.role.create({
          data: {
            name: 'Guest',
            description: 'Read-only access',
            isSystem: true,
            workspaceId: ws.id,
            permissions: ['doc:read', 'comment:read', 'member:read'],
          },
        });

        // 3. Add owner as member with Owner role
        await tx.member.create({
          data: {
            userId: ownerId,
            workspaceId: ws.id,
            roleId: ownerRole.id,
          },
        });

        return ws;
      });

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
      const workspace = await prisma.workspace.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, name: true, email: true, image: true },
          },
          _count: {
            select: { members: true, documents: true },
          },
        },
      });
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
      const workspace = await prisma.workspace.findUnique({ where: { slug } });
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
      const members = await prisma.member.findMany({
        where: { userId, isActive: true },
        include: {
          workspace: true,
        },
        orderBy: { joinedAt: 'desc' },
      });
      return members.map((m) => m.workspace);
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
        const existing = await prisma.workspace.findUnique({ where: { slug: data.slug } });
        if (existing && existing.id !== id) {
          throw new ConflictError(`Workspace slug '${data.slug}' is already taken`);
        }
      }

      // settings is a nullable Json column: Prisma wants Prisma.DbNull for an
      // explicit null, and the key omitted entirely when it is not being changed.
      const { settings, ...rest } = data;

      const workspace = await prisma.workspace.update({
        where: { id },
        data: {
          ...rest,
          ...(settings === undefined
            ? {}
            : { settings: settings === null ? Prisma.DbNull : (settings as Prisma.InputJsonValue) }),
        },
      });

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
      const workspace = await prisma.workspace.findUnique({ where: { id } });
      if (!workspace) {
        throw new NotFoundError('Workspace', id);
      }

      if (workspace.ownerId !== actorId) {
        throw new ForbiddenError('Only the workspace owner can delete it');
      }

      await prisma.workspace.delete({ where: { id } });

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
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (!workspace || !workspace.seatLimit) {
        return true; // No limit set
      }

      const memberCount = await prisma.member.count({
        where: { workspaceId, isActive: true },
      });
      return memberCount < workspace.seatLimit;
    } catch (error) {
      this.handleError(error, 'Failed to check seat limit');
    }
  }
}

