import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { Member } from '@prisma/client';

export class MemberRepository extends BaseRepository<Member> {
  constructor() {
    super(prisma.member);
  }

  async findByUserAndWorkspace(userId: string, workspaceId: string) {
    return prisma.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      include: { role: true, user: { select: { id: true, name: true, email: true, image: true } } },
    });
  }

  async findByWorkspace(workspaceId: string) {
    return prisma.member.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        role: { select: { id: true, name: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
