import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Authentication Routes
 * 
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login user
 * GET /api/auth/me - Get current user (protected)
 */

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route (requires authentication)
router.get('/me', authenticate, getMe);

export default router;

