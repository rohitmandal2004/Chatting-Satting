import { io } from 'socket.io-client';

/**
 * Socket.IO service
 * Manages real-time connection to the server
 */

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io('http://localhost:5000', {
    transports: ['websocket'],
  });

  // Join as user
  socket.emit('user:join', userId);

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

