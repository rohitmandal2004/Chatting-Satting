import axios from 'axios';

/**
 * API Configuration
 * In production: Uses VITE_API_URL environment variable
 * In development: Uses proxy from vite.config.js (/api)
 */

// Get API base URL from environment or use proxy
const getApiUrl = () => {
  // In production, VITE_API_URL must be set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // Fallback: throw error if in production without API URL
  console.error('VITE_API_URL is not set! Please configure it in Vercel environment variables.');
  return '/api'; // Will fail, but prevents build errors
};

const API_URL = getApiUrl();

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

