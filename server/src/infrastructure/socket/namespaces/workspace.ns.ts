import { Namespace, Socket } from 'socket.io';
import { AuthenticatedSocketData } from '../socket.auth';
import { verifyWorkspaceMembership } from '../socket.guards';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// /workspace Namespace
// Workspace-wide events, member online/offline,
// role changes, invite activity.
// Verifies membership before allowing room join.
// ─────────────────────────────────────────────

const log = logger.child('Socket:/workspace');

export const registerWorkspaceNamespace = (ns: Namespace) => {
  ns.on('connection', (socket: Socket) => {
    const { userId, name } = socket.data as AuthenticatedSocketData;
    log.info(`${name || userId} connected (${socket.id})`);

    // Join workspace room (membership verified)
    socket.on('workspace:join', async (workspaceId: string) => {
      const isMember = await verifyWorkspaceMembership(userId, workspaceId);
      if (!isMember) {
        socket.emit('error', { message: 'Not a member of this workspace' });
        return;
      }

      socket.join(`workspace:${workspaceId}`);
      log.debug(`${userId} joined workspace:${workspaceId}`);

      // Notify others
      socket.to(`workspace:${workspaceId}`).emit('member:online', {
        userId,
        name,
        joinedAt: new Date().toISOString(),
      });
    });

    socket.on('workspace:leave', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
      socket.to(`workspace:${workspaceId}`).emit('member:offline', { userId });
      log.debug(`${userId} left workspace:${workspaceId}`);
    });

    socket.on('disconnect', () => {
      log.debug(`${userId} disconnected`);
    });
  });
};
