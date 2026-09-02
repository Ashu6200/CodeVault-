import { BaseService } from '@core/base.service';
import { prisma } from '@infra/db';
import { auditService } from '@modules/audit';
import { NotFoundError } from '@core/errors';
import { CreateApiKeyInput } from './apiKey.schema';
import crypto from 'crypto';

export class ApiKeyService extends BaseService {
  constructor() {
    super();
  }

  async listKeys(userId: string) {
    try {
      return await prisma.apiKey.findMany({
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
    } catch (error) {
      this.handleError(error, 'Failed to list API keys');
    }
  }

  /**
   * Generate a new API key. Returns the plaintext key ONCE.
   */
  async createKey(userId: string, data: CreateApiKeyInput) {
    try {
      // Generate key: sk_live_<random>
      const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      const keyPrefix = rawKey.substring(0, 12) + '••••••' + rawKey.substring(rawKey.length - 4);

      const expiresAt = data.expiresInDays
        ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      const apiKey = await prisma.apiKey.create({
        data: {
          name: data.name,
          keyHash,
          keyPrefix,
          scopes: data.scopes,
          expiresAt,
          userId,
        },
      });

      void auditService.logAction({
        action: 'API_KEY_CREATED',
        resourceType: 'ApiKey',
        resourceId: apiKey.id,
        actorId: userId,
      });

      return {
        id: apiKey.id,
        key: rawKey, // Only shown once!
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      };
    } catch (error) {
      this.handleError(error, 'Failed to create API key');
    }
  }

  async revokeKey(id: string, userId: string) {
    try {
      const key = await prisma.apiKey.findUnique({ where: { id } });
      if (!key || key.userId !== userId) throw new NotFoundError('API key', id);

      const updated = await prisma.apiKey.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
      void auditService.logAction({
        action: 'API_KEY_REVOKED',
        resourceType: 'ApiKey',
        resourceId: id,
        actorId: userId,
      });
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to revoke API key');
    }
  }
}

