import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { Invite } from '@prisma/client';

export class InviteRepository extends BaseRepository<Invite> {
  constructor() {
    super(prisma.invite);
  }

  async findByToken(token: string) {
    return prisma.invite.findUnique({ where: { token } });
  }

  async findPendingByWorkspace(workspaceId: string) {
    return prisma.invite.findMany({
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
  }

  async findByEmailAndWorkspace(email: string, workspaceId: string) {
    return prisma.invite.findFirst({
      where: {
        email,
        workspaceId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }
}
