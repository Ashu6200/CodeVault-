import { BaseService } from '@core/base.service';
import { ApiKeyRepository } from './apiKey.repository';
import { eventBus, EVENTS } from '@infra/events';
import { NotFoundError } from '@core/errors';
import { CreateApiKeyInput } from './apiKey.schema';
import crypto from 'crypto';

export class ApiKeyService extends BaseService {
  private apiKeyRepo: ApiKeyRepository;

  constructor() {
    super();
    this.apiKeyRepo = new ApiKeyRepository();
  }

  async listKeys(userId: string) {
    try {
      return await this.apiKeyRepo.findByUser(userId);
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

      const apiKey = await this.apiKeyRepo.create({
        name: data.name,
        keyHash,
        keyPrefix,
        scopes: data.scopes,
        expiresAt,
        userId,
      });

      eventBus.emit(EVENTS.API_KEY_CREATED, { keyId: apiKey.id, name: data.name }, userId);

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
      const key = await this.apiKeyRepo.findById(id);
      if (!key || key.userId !== userId) throw new NotFoundError('API key', id);

      const updated = await this.apiKeyRepo.update(id, { revokedAt: new Date() });
      eventBus.emit(EVENTS.API_KEY_REVOKED, { keyId: id }, userId);
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to revoke API key');
    }
  }
}
