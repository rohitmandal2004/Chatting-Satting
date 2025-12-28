import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Get user profile
 * GET /api/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

/**
 * Update user profile
 * PUT /api/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (name) {
      updateData.name = name.trim();
    }
    if (about !== undefined) {
      updateData.about = about.trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

/**
 * Update profile picture
 * PUT /api/profile/picture
 */
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided',
      });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePic) {
      try {
        const publicId = user.profilePic.split('/').pop().split('.')[0];
        const fullPublicId = `chating-buddy/profiles/${publicId}`;
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (deleteError) {
        console.error('Error deleting old profile picture:', deleteError);
        // Continue even if deletion fails
      }
    }

    // Update user with new profile picture URL
    user.profilePic = req.file.path;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        about: user.about,
      },
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      message: 'Error updating profile picture',
      error: error.message,
    });
  }
};

/**
 * Delete profile picture
 * DELETE /api/profile/picture
 */
export const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Delete from Cloudinary if exists
    if (user.profilePic) {
      try {
        const publicId = user.profilePic.split('/').pop().split('.')[0];
        const fullPublicId = `chating-buddy/profiles/${publicId}`;
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (deleteError) {
        console.error('Error deleting profile picture:', deleteError);
      }
    }

    // Remove profile picture URL from user
    user.profilePic = '';
    await user.save();

    res.status(200).json({
      message: 'Profile picture deleted successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        about: user.about,
      },
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      message: 'Error deleting profile picture',
      error: error.message,
    });
  }
};

