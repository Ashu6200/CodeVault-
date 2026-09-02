import { createHandler } from '@/server/http/createHandler';
import { ok } from '@/server/http/responses';
import { NotificationService } from '@modules/notification';

const notificationService = new NotificationService();

/**
 * POST /api/notifications/mark-all-read
 *
 * Takes an optional ?workspaceId= filter and no body — the client sends none,
 * so the body is deliberately never read.
 */
export const POST = createHandler({ auth: true }, async ({ user, query }) =>
  ok(await notificationService.markAllAsRead(user.id, query.workspaceId)),
);
