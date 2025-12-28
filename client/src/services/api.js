import axios from 'axios';

const API_URL = '/api';

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
  
  getChatMessages: (chatId) =>
    axios.get(`${API_URL}/chat/${chatId}/messages`),
};

