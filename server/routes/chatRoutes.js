import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  getUsers,
} from '../controllers/chatController.js';

const router = express.Router();

/**
 * Chat Routes
 * All routes require authentication
 */

// Get all users (for starting new chats)
router.get('/users', authenticate, getUsers);

// Get all chats for current user
router.get('/', authenticate, getUserChats);

// Get or create chat with specific user
router.get('/:userId', authenticate, getOrCreateChat);

// Get messages for a chat
router.get('/:chatId/messages', authenticate, getChatMessages);

export default router;

