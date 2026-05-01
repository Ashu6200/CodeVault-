import { BaseService } from '@core/base.service';
import { prisma } from '@infra/db';
import { eventBus, EVENTS } from '@infra/events';
import { UnauthorizedError, NotFoundError } from '@core/errors';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Auth Service
// Handles authentication-related business logic.
// Standard auth flow (sign-up, sign-in, sign-out)
// is delegated to Better Auth's built-in handler.
// ─────────────────────────────────────────────

const log = logger.child('AuthService');

export class AuthService extends BaseService {
  /**
   * Deactivate (soft-delete) a user account.
   * Revokes all active sessions.
   */
  async deactivateAccount(userId: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundError('User', userId);
      }

      if (user.deletedAt) {
        throw new UnauthorizedError('Account is already deactivated');
      }

      // Soft-delete user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });

      // Revoke all sessions
      await prisma.session.deleteMany({
        where: { userId },
      });

      // Emit domain event for audit logging
      eventBus.emit(
        EVENTS.ACCOUNT_DEACTIVATED,
        {
          userId,
          email: user.email,
        },
        userId,
      );

      log.info(`Account deactivated: ${userId}`);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        deactivatedAt: updatedUser.deletedAt,
      };
    } catch (error) {
      this.handleError(error, 'Failed to deactivate account');
    }
  }

  /**
   * Get current session info
   */
  async getSessionInfo(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User', userId);
      }

      const activeSessions = await prisma.session.count({
        where: { userId, expiresAt: { gt: new Date() } },
      });

      return { user, activeSessions };
    } catch (error) {
      this.handleError(error, 'Failed to get session info');
    }
  }
}
