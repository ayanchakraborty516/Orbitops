import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, activeWorkspace } = useAuth();
  const { info, success } = useToast();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env?.VITE_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (activeWorkspace?._id) {
        newSocket.emit('join_workspace', { workspaceId: activeWorkspace._id });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('issue_created', (issue) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      info(`New issue created: ${issue.key} - ${issue.title}`, 'Real-Time Update');
    });

    newSocket.on('issue_updated', (issue) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    newSocket.on('incident_created', (incident) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      info(`Incident reported: ${incident.title} [${incident.severity.toUpperCase()}]`, 'Incident Alert');
    });

    newSocket.on('incident_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    newSocket.on('service_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    newSocket.on('notification', (notif) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      info(notif.message, notif.title);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, activeWorkspace?._id, queryClient, info]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext) || { socket: null, isConnected: false };
}
