import { createHandler, jsonBody } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { ApiKeyService, createApiKeySchema } from '@modules/apiKey';

const apiKeyService = new ApiKeyService();

/** GET /api/api-keys — never returns keyHash */
export const GET = createHandler({ auth: true }, async ({ user }) =>
  ok(await apiKeyService.listKeys(user.id)),
);

/** POST /api/api-keys — returns the plaintext key once (5 per hour) */
export const POST = createHandler(
  { auth: true, rateLimit: { limit: 5, windowSeconds: 3600 } },
  async ({ req, user }) => {
    const data = createApiKeySchema.parse(await jsonBody(req));
    const key = await apiKeyService.createKey(user.id, data);
    return ok(key, 201);
  },
);
