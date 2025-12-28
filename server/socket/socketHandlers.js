import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

/**
 * Socket.IO event handlers
 * Handles real-time messaging, typing indicators, and online status
 */

export const initializeSocket = (io) => {
  // Store online users: userId -> socketId
  const onlineUsers = new Map();
  // Store user rooms: socketId -> Set of chatIds
  const userRooms = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User joins - store their socket ID
    socket.on('user:join', async (userId) => {
      try {
        onlineUsers.set(userId, socket.id);
        userRooms.set(socket.id, new Set());
        
        // Update user's online status in database
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // Notify others that user is online
        socket.broadcast.emit('user:online', userId);

        console.log(`✅ User ${userId} is now online`);
      } catch (error) {
        console.error('Error in user:join:', error);
      }
    });

    // Join a chat room
    socket.on('join', (chatId) => {
      socket.join(chatId);
      const rooms = userRooms.get(socket.id) || new Set();
      rooms.add(chatId);
      userRooms.set(socket.id, rooms);
    });

    // Leave a chat room
    socket.on('leave', (chatId) => {
      socket.leave(chatId);
      const rooms = userRooms.get(socket.id);
      if (rooms) {
        rooms.delete(chatId);
      }
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { chatId, senderId, content } = data;

        // Create message in database
        const message = await Message.create({
          chat: chatId,
          sender: senderId,
          content,
        });

        // Populate sender info
        await message.populate('sender', 'name email avatar');

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          lastMessageAt: message.createdAt,
        });

        // Emit to all users in this chat room
        io.to(chatId).emit('message:receive', {
          message,
          chatId,
        });

        console.log(`📨 Message sent in chat ${chatId}`);
      } catch (error) {
        console.error('Error in message:send:', error);
        socket.emit('message:error', {
          message: 'Failed to send message',
          error: error.message,
        });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { chatId, userId } = data;
      // Emit to all others in the chat room
      socket.to(chatId).emit('typing:start', { chatId, userId });
    });

    socket.on('typing:stop', (data) => {
      const { chatId, userId } = data;
      // Emit to all others in the chat room
      socket.to(chatId).emit('typing:stop', { chatId, userId });
    });

    // Mark message as read
    socket.on('message:read', async (data) => {
      try {
        const { messageId, userId, chatId } = data;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              user: userId,
              readAt: new Date(),
            },
          },
          isRead: true,
        });

        // Notify sender that message was read
        const message = await Message.findById(messageId);
        const chat = await Chat.findById(chatId).populate('participants');

        chat.participants.forEach((participant) => {
          const participantSocketId = onlineUsers.get(participant._id.toString());
          if (participantSocketId) {
            io.to(participantSocketId).emit('message:read', {
              messageId,
              userId,
            });
          }
        });
      } catch (error) {
        console.error('Error in message:read:', error);
      }
    });

    // User disconnects
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.id}`);

      // Find and remove user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          userRooms.delete(socket.id);

          // Update user's online status
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Notify others that user is offline
          socket.broadcast.emit('user:offline', userId);

          console.log(`✅ User ${userId} is now offline`);
          break;
        }
      }
    });
  });
};

