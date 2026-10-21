import { apiClient, buildQuery } from './client.js';

export const incidentApi = {
  list: (params = {}) => {
    return apiClient(`/incidents${buildQuery(params)}`);
  },
  create: (data) => apiClient('/incidents', { method: 'POST', body: data }),
  get: (id) => apiClient(`/incidents/${id}`),
  addTimelineUpdate: (id, data) => apiClient(`/incidents/${id}/timeline`, { method: 'POST', body: data }),
  delete: (id) => apiClient(`/incidents/${id}`, { method: 'DELETE' }),
};
