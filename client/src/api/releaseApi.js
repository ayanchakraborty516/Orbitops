import { apiClient, buildQuery } from './client.js';

export const releaseApi = {
  list: (params = {}) => {
    return apiClient(`/releases${buildQuery(params)}`);
  },
  create: (data) => apiClient('/releases', { method: 'POST', body: data }),
  get: (id) => apiClient(`/releases/${id}`),
  toggleChecklist: (releaseId, itemId) =>
    apiClient(`/releases/${releaseId}/checklists/${itemId}`, { method: 'PATCH' }),
  triggerDeploy: (releaseId, data) =>
    apiClient(`/releases/${releaseId}/deploy`, { method: 'POST', body: data }),
  listDeployments: (params = {}) => {
    return apiClient(`/releases/deployments${buildQuery(params)}`);
  },
};
