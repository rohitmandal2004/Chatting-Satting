import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAbout(user.about || '');
      setProfilePic(user.profilePic || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await profileAPI.updateProfile({ name, about });
      setSuccess('Profile updated successfully!');
      if (fetchUser) {
        await fetchUser();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await profileAPI.updateProfilePicture(formData);
      setProfilePic(response.data.user.profilePic);
      setSuccess('Profile picture updated successfully!');
      if (fetchUser) {
        await fetchUser();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await profileAPI.deleteProfilePicture();
      setProfilePic('');
      setSuccess('Profile picture deleted successfully!');
      if (fetchUser) {
        await fetchUser();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-whatsapp-gray">
      {/* Settings Sidebar */}
      <div className="w-full md:w-2/5 lg:w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Header */}
        <div className="bg-whatsapp-dark p-4 flex items-center space-x-3">
          <button
            onClick={() => navigate('/chat')}
            className="text-white hover:text-gray-200 p-2 rounded transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-lg">Settings</h1>
        </div>

        {/* Profile Preview */}
        <div className="p-6 bg-gradient-to-br from-whatsapp-dark to-whatsapp-darker">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-whatsapp-green flex items-center justify-center text-white text-3xl font-semibold overflow-hidden">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <h2 className="text-white text-xl font-semibold mt-4">{name}</h2>
            <p className="text-gray-200 text-sm mt-1">{about || 'Hey there! I am using Chating Buddy'}</p>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Profile Picture Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleImageSelect}
                  disabled={uploading}
                  className="px-4 py-2 bg-whatsapp-green hover:bg-whatsapp-dark text-white rounded-lg transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Change Picture'}
                </button>
                {profilePic && (
                  <button
                    type="button"
                    onClick={handleDeletePicture}
                    disabled={uploading}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent outline-none"
                placeholder="Enter your name"
              />
            </div>

            {/* About Field */}
            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                About
              </label>
              <textarea
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={100}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent outline-none resize-none"
                placeholder="Hey there! I am using Chating Buddy"
              />
              <p className="text-xs text-gray-500 mt-1">{about.length}/100</p>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-whatsapp-green hover:bg-whatsapp-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

          {/* Logout Button */}
          <div className="mt-8 pt-8 border-t border-gray-300">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

