import { io, Socket } from 'socket.io-client';
import { env } from '../config/env';

class SocketClient {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Cannot connect to socket: Token missing');
      return;
    }

    if (this.socket?.connected || this.isConnecting) return;
    
    this.isConnecting = true;
    
    this.socket = io(env.VITE_SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
