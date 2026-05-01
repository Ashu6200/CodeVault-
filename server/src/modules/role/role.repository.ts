import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { Role } from '@prisma/client';

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(prisma.role);
  }

  async findByWorkspace(workspaceId: string): Promise<Role[]> {
    return prisma.role.findMany({
      where: { workspaceId },
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findByNameAndWorkspace(name: string, workspaceId: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { workspaceId_name: { workspaceId, name } },
    });
  }
}
