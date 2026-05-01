import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket, getIO } from './index';

/**
 * SocketService class wrapper to match the production reference pattern.
 * Provides a structured way to access the Socket.io instance.
 */
export class SocketService {
  public io: SocketIOServer;

  constructor(server: HttpServer) {
    this.io = initializeSocket(server);
  }

  /**
   * Get the Socket.io instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketService;
