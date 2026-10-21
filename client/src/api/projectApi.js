import { apiClient, buildQuery } from './client.js';

export const projectApi = {
  list: (params = {}) => {
    return apiClient(`/projects${buildQuery(params)}`);
  },
  create: (data) => apiClient('/projects', { method: 'POST', body: data }),
  get: (id) => apiClient(`/projects/${id}`),
  update: (id, data) => apiClient(`/projects/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiClient(`/projects/${id}`, { method: 'DELETE' }),
};
