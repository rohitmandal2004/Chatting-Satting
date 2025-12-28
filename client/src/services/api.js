import axios from 'axios';

// Use environment variable for production, fallback to proxy for development
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configure axios base URL if provided
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

/**
 * API service
 * Centralized API calls for the application
 */

// Auth APIs
export const authAPI = {
  register: (name, email, password) =>
    axios.post(`${API_URL}/auth/register`, { name, email, password }),
  
  login: (email, password) =>
    axios.post(`${API_URL}/auth/login`, { email, password }),
  
  getMe: () =>
    axios.get(`${API_URL}/auth/me`),
};

// Chat APIs
export const chatAPI = {
  getUsers: () =>
    axios.get(`${API_URL}/chat/users`),
  
  getUserChats: () =>
    axios.get(`${API_URL}/chat`),
  
  getOrCreateChat: (userId) =>
    axios.get(`${API_URL}/chat/${userId}`),
  
  getChatMessages: (chatId, page = 1, limit = 50) =>
    axios.get(`${API_URL}/chat/${chatId}/messages`, {
      params: { page, limit },
    }),
};

// Profile APIs
export const profileAPI = {
  getProfile: () =>
    axios.get(`${API_URL}/profile`),
  
  updateProfile: (data) =>
    axios.put(`${API_URL}/profile`, data),
  
  updateProfilePicture: (formData) =>
    axios.put(`${API_URL}/profile/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  deleteProfilePicture: () =>
    axios.delete(`${API_URL}/profile/picture`),
};

