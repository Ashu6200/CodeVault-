import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { AuthService } from '@modules/auth';

const authService = new AuthService();

/** POST /api/auth/deactivate — soft-delete the account (3 per hour) */
export const POST = createHandler(
  { auth: true, rateLimit: { limit: 3, windowSeconds: 3600 } },
  async ({ user }) => {
    const result = await authService.deactivateAccount(user.id);
    return ok(result);
  },
);
