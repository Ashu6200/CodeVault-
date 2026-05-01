'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/store/hooks';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // In a real app, you would select the workspaceId from Redux to join namespaces
  // const currentWorkspaceId = useAppSelector((state) => state.workspace.currentId);
  const currentWorkspaceId = 'dummy-workspace-id';

  useEffect(() => {
    // Only connect if we have a valid environment and context
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (currentWorkspaceId) {
        socketInstance.emit('joinWorkspace', currentWorkspaceId);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [currentWorkspaceId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
