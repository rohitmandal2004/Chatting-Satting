import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteProfilePicture,
} from '../controllers/profileController.js';

const router = express.Router();

/**
 * Profile Routes
 * All routes require authentication
 */

// Get user profile
router.get('/', authenticate, getProfile);

// Update profile (name, about)
router.put('/', authenticate, updateProfile);

// Update profile picture
router.put('/picture', authenticate, upload.single('profilePic'), updateProfilePicture);

// Delete profile picture
router.delete('/picture', authenticate, deleteProfilePicture);

export default router;

