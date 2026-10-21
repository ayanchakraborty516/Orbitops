import { apiClient } from './client.js';

export const authApi = {
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiClient('/auth/register', { method: 'POST', body: userData }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  getMe: () => apiClient('/auth/me'),
  updateProfile: (profileData) => apiClient('/auth/profile', { method: 'PATCH', body: profileData }),
  forgotPassword: (email) => apiClient('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (payload) => apiClient('/auth/reset-password', { method: 'POST', body: payload }),
};
