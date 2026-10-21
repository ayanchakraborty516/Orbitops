import { apiClient } from './client.js';

export const serviceApi = {
  list: () => apiClient('/services'),
  create: (data) => apiClient('/services', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/services/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiClient(`/services/${id}`, { method: 'DELETE' }),
};
