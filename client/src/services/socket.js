import { io } from 'socket.io-client';

/**
 * Socket.IO service
 * Manages real-time connection to the server
 * Production-ready with environment variable support
 */

let socket = null;

// Get socket server URL from environment or use default
const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // In development, use proxy or localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  // In production, try to infer from API URL
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace('/api', '');
  }
  return 'http://localhost:5000';
};

export const connectSocket = (userId) => {
  if (socket?.connected) {
    return socket;
  }

  const socketURL = getSocketURL();

  socket = io(socketURL, {
    transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    // Join as user after connection is established
    if (userId) {
      socket.emit('user:join', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  // Join as user immediately if socket is already connected
  if (socket.connected && userId) {
    socket.emit('user:join', userId);
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

