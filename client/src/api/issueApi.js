import { apiClient, buildQuery } from './client.js';

export const issueApi = {
  list: (params = {}) => {
    return apiClient(`/issues${buildQuery(params)}`);
  },
  create: (data) => apiClient('/issues', { method: 'POST', body: data }),
  get: (id) => apiClient(`/issues/${id}`),
  update: (id, data) => apiClient(`/issues/${id}`, { method: 'PATCH', body: data }),
  updateStatus: (id, status, order) =>
    apiClient(`/issues/${id}/status`, { method: 'PATCH', body: { status, order } }),
  delete: (id) => apiClient(`/issues/${id}`, { method: 'DELETE' }),
  addComment: (id, content) => apiClient(`/issues/${id}/comments`, { method: 'POST', body: { content } }),
};
