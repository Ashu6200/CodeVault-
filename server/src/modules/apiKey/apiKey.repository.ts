import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { ApiKey } from '@prisma/client';

export class ApiKeyRepository extends BaseRepository<ApiKey> {
  constructor() {
    super(prisma.apiKey);
  }

  async findByUser(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        expiresAt: true,
        lastUsed: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHash(keyHash: string) {
    return prisma.apiKey.findUnique({ where: { keyHash } });
  }
}
