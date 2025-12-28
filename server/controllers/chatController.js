import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * Get or create a chat between current user and another user
 * GET /api/chat/:userId
 */
export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Can't create chat with yourself
    if (userId === currentUserId) {
      return res.status(400).json({
        message: 'Cannot create chat with yourself',
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Find existing chat (check both orders of participants)
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 },
    })
      .populate('participants', 'name email avatar isOnline')
      .populate('lastMessage');

    // Create new chat if doesn't exist
    if (!chat) {
      // Check again to avoid race condition
      chat = await Chat.findOne({
        participants: { $all: [currentUserId, userId], $size: 2 },
      })
        .populate('participants', 'name email avatar isOnline')
        .populate('lastMessage');

      if (!chat) {
        chat = await Chat.create({
          participants: [currentUserId, userId],
        });

        chat = await Chat.findById(chat._id)
          .populate('participants', 'name email avatar isOnline');
      }
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({
      message: 'Error getting chat',
      error: error.message,
    });
  }
};

/**
 * Get all chats for current user
 * GET /api/chat
 */
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chats = await Chat.find({
      participants: userId,
    })
      .populate('participants', 'name email avatar isOnline')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    // Format chats to include other user's info
    const formattedChats = chats.map((chat) => {
      const otherUser = chat.participants.find(
        (p) => p._id.toString() !== userId
      );

      return {
        _id: chat._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          avatar: otherUser.avatar,
          isOnline: otherUser.isOnline,
        },
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      };
    });

    res.status(200).json({ chats: formattedChats });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      message: 'Error fetching chats',
      error: error.message,
    });
  }
};

/**
 * Get messages for a specific chat
 * GET /api/chat/:chatId/messages
 */
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        message: 'Chat not found',
      });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    // Get messages
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

/**
 * Get all users (for starting new chats)
 * GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const users = await User.find({
      _id: { $ne: currentUserId },
    }).select('name email avatar isOnline lastSeen');

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

