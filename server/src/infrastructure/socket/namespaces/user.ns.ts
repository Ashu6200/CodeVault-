import { Namespace, Socket } from 'socket.io';
import { AuthenticatedSocketData } from '../socket.auth';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// /user Namespace
// Personal notifications, presence, status
// Auto-joins user:{userId} room on connect.
// ─────────────────────────────────────────────

const log = logger.child('Socket:/user');

export const registerUserNamespace = (ns: Namespace) => {
  ns.on('connection', (socket: Socket) => {
    const { userId, name } = socket.data as AuthenticatedSocketData;

    // Auto-join personal room
    socket.join(`user:${userId}`);
    log.info(`${name || userId} connected (${socket.id})`);

    // Presence status broadcast
    socket.on('status:update', (status: 'online' | 'away' | 'busy') => {
      socket.broadcast.emit('user:status', { userId, status });
    });

    socket.on('disconnect', (reason) => {
      log.debug(`${userId} disconnected (${reason})`);
    });
  });
};
