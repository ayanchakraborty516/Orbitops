import { apiClient } from './client.js';

export const notificationApi = {
  list: () => apiClient('/notifications'),
  markAsRead: (id) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => apiClient('/notifications/mark-all-read', { method: 'POST' }),
};
