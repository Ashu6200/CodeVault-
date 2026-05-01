import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { User } from '@prisma/client';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByIdWithProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { ownedWorkspaces: true, memberships: true },
        },
      },
    });
  }
}
