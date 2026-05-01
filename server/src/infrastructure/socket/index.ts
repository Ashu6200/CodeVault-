import { Server as SocketIOServer, Namespace } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '@infra/config';
import { logger } from '@infra/logger';

import { socketAuthMiddleware } from './socket.auth';
import { registerUserNamespace } from './namespaces/user.ns';
import { registerWorkspaceNamespace } from './namespaces/workspace.ns';
import { registerDocumentNamespace } from './namespaces/document.ns';

// ─────────────────────────────────────────────
// Socket.io — Namespace-based Architecture
//
// /user       → personal notifications, presence
// /workspace  → workspace-wide events, member activity
// /document   → document collaboration, cursors, typing
//
// Auth middleware is applied to every namespace.
// ─────────────────────────────────────────────

const log = logger.child('Socket.io');

let io: SocketIOServer;
let userNs: Namespace;
let workspaceNs: Namespace;
let documentNs: Namespace;

export const initializeSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
  });

  // ── /user namespace ──
  userNs = io.of('/user');
  userNs.use(socketAuthMiddleware);
  registerUserNamespace(userNs);

  // ── /workspace namespace ──
  workspaceNs = io.of('/workspace');
  workspaceNs.use(socketAuthMiddleware);
  registerWorkspaceNamespace(workspaceNs);

  // ── /document namespace ──
  documentNs = io.of('/document');
  documentNs.use(socketAuthMiddleware);
  registerDocumentNamespace(documentNs);

  log.info('Socket.io initialized with namespaces: /user, /workspace, /document');
  return io;
};

// ─── Namespace Accessors ───

/** Raw Socket.io server */
export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io not initialized. Call initializeSocket() first.');
  return io;
};

/** /user namespace — notifications, presence */
export const getUserNs = (): Namespace => {
  if (!userNs) throw new Error('Socket.io /user namespace not initialized');
  return userNs;
};

/** /workspace namespace — workspace-wide events */
export const getWorkspaceNs = (): Namespace => {
  if (!workspaceNs) throw new Error('Socket.io /workspace namespace not initialized');
  return workspaceNs;
};

/** /document namespace — document collaboration */
export const getDocumentNs = (): Namespace => {
  if (!documentNs) throw new Error('Socket.io /document namespace not initialized');
  return documentNs;
};
