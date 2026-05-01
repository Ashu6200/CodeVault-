import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { Workspace } from '@prisma/client';

// ─────────────────────────────────────────────
// Workspace Repository
// ─────────────────────────────────────────────

export class WorkspaceRepository extends BaseRepository<Workspace> {
  constructor() {
    super(prisma.workspace);
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({ where: { slug } });
  }

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    return prisma.workspace.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find all workspaces a user is a member of
   */
  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    const members = await prisma.member.findMany({
      where: { userId, isActive: true },
      include: {
        workspace: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
    return members.map((m) => m.workspace);
  }

  /**
   * Count active members in a workspace
   */
  async countMembers(workspaceId: string): Promise<number> {
    return prisma.member.count({
      where: { workspaceId, isActive: true },
    });
  }

  /**
   * Get workspace with owner and member count
   */
  async findByIdWithDetails(id: string): Promise<any> {
    return prisma.workspace.findUnique({
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
  }

  /**
   * Create workspace with a transaction (workspace + owner member + default roles)
   */
  async createWithDefaults(data: {
    name: string;
    slug: string;
    type: string;
    logoUrl?: string | null;
    settings?: any;
    ownerId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug: data.slug,
          type: data.type as any,
          logoUrl: data.logoUrl,
          settings: data.settings,
          ownerId: data.ownerId,
        },
      });

      // 2. Create default roles
      const ownerRole = await tx.role.create({
        data: {
          name: 'Owner',
          description: 'Full workspace access',
          isSystem: true,
          workspaceId: workspace.id,
          permissions: ['*'], // Wildcard — full access
        },
      });

      await tx.role.create({
        data: {
          name: 'Admin',
          description: 'Administrative access',
          isSystem: true,
          workspaceId: workspace.id,
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
          workspaceId: workspace.id,
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
          workspaceId: workspace.id,
          permissions: ['doc:read', 'comment:read', 'member:read'],
        },
      });

      // 3. Add owner as member with Owner role
      await tx.member.create({
        data: {
          userId: data.ownerId,
          workspaceId: workspace.id,
          roleId: ownerRole.id,
        },
      });

      return workspace;
    });
  }
}
