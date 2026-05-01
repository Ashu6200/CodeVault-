import { Namespace, Socket } from 'socket.io';
import { AuthenticatedSocketData } from '../socket.auth';
import { verifyWorkspaceMembership } from '../socket.guards';
import { logger } from '@infra/logger';

// ─────────────────────────────────────────────
// /document Namespace
// Document collaboration: editing rooms, cursor
// positions, typing indicators, comments.
// Verifies workspace membership before room join.
// ─────────────────────────────────────────────

const log = logger.child('Socket:/document');

export const registerDocumentNamespace = (ns: Namespace) => {
  ns.on('connection', (socket: Socket) => {
    const { userId, name } = socket.data as AuthenticatedSocketData;
    log.info(`${name || userId} connected (${socket.id})`);

    // Join document editing room
    socket.on('document:join', async (data: { documentId: string; workspaceId: string }) => {
      const { documentId, workspaceId } = data;

      const isMember = await verifyWorkspaceMembership(userId, workspaceId);
      if (!isMember) {
        socket.emit('error', { message: 'Not authorized to access this document' });
        return;
      }

      socket.join(`document:${documentId}`);
      log.debug(`${userId} joined document:${documentId}`);

      // Notify collaborators
      socket.to(`document:${documentId}`).emit('collaborator:joined', {
        userId,
        name,
        documentId,
        joinedAt: new Date().toISOString(),
      });
    });

    socket.on('document:leave', (documentId: string) => {
      socket.leave(`document:${documentId}`);
      socket.to(`document:${documentId}`).emit('collaborator:left', {
        userId,
        name,
        documentId,
      });
      log.debug(`${userId} left document:${documentId}`);
    });

    // ── Collaborative Editing ──

    // Cursor position broadcast
    socket.on('cursor:move', (data: { documentId: string; position: any }) => {
      socket.to(`document:${data.documentId}`).emit('cursor:update', {
        userId,
        name,
        position: data.position,
      });
    });

    // Selection broadcast
    socket.on('selection:change', (data: { documentId: string; selection: any }) => {
      socket.to(`document:${data.documentId}`).emit('selection:update', {
        userId,
        name,
        selection: data.selection,
      });
    });

    // Typing indicator
    socket.on('typing:start', (documentId: string) => {
      socket.to(`document:${documentId}`).emit('typing:update', {
        userId,
        name,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (documentId: string) => {
      socket.to(`document:${documentId}`).emit('typing:update', {
        userId,
        name,
        isTyping: false,
      });
    });

    // Comment activity (real-time comment updates)
    socket.on('comment:new', (data: { documentId: string; comment: any }) => {
      socket.to(`document:${data.documentId}`).emit('comment:created', {
        userId,
        name,
        comment: data.comment,
      });
    });

    socket.on('disconnect', () => {
      log.debug(`${userId} disconnected`);
    });
  });
};
