import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ServerHealth {
  status: string;
  uptime: number;
  timestamp: string;
  services: {
    mongodb: string;
    redis: string;
  };
  resources: {
    memoryUsed: number;
    memoryHeap: number;
    cpuLoad: string;
  };
  metrics: {
    avgLatency: number;
    activeConnections: number;
  };
}

export const useAdminMonitoring = () => {
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    // Connect to socket with admin token
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('admin:join', token);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('admin:server-health', (data: ServerHealth) => {
      setHealth(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { health, isConnected };
};
