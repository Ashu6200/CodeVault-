import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { ApiKeyService } from '@modules/apiKey';

const apiKeyService = new ApiKeyService();

/** DELETE /api/api-keys/:id — revoke */
export const DELETE = createHandler<{ id: string }>({ auth: true }, async ({ params, user }) =>
  ok(await apiKeyService.revokeKey(params.id, user.id)),
);
