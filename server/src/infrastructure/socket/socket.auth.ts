import { Socket } from 'socket.io';
import { auth } from '@infra/auth';
import { prisma } from '@infra/db';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// Socket Auth Middleware
// Validates Better Auth session from cookies or
// a handshake auth token. Attaches user + session
// to socket.data for downstream handlers.
// ─────────────────────────────────────────────

const log = logger.child('SocketAuth');

export interface AuthenticatedSocketData {
  userId: string;
  email: string;
  name?: string | null;
  sessionId: string;
}

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // 1. Try token from handshake auth (mobile / non-cookie clients)
    const token = socket.handshake.auth?.token as string | undefined;

    // 2. Try session cookie (browser clients)
    const cookieHeader = socket.handshake.headers.cookie;

    if (!token && !cookieHeader) {
      return next(new Error('Authentication required — no token or session cookie'));
    }

    // Build headers for Better Auth session lookup
    const headers = new Headers();
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      return next(new Error('Invalid or expired session'));
    }

    // Check soft-deleted users
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deletedAt: true },
    });

    if (user?.deletedAt) {
      return next(new Error('Account has been deactivated'));
    }

    // Attach auth data to socket
    socket.data = {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      sessionId: session.session.id,
    } satisfies AuthenticatedSocketData;

    log.debug(`Socket authenticated: ${socket.id} → user ${session.user.id}`);
    next();
  } catch (error: any) {
    log.warn(`Socket auth failed for ${socket.id}: ${error.message}`);
    next(new Error('Authentication failed'));
  }
};
