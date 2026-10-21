import { apiClient } from './client.js';

export const workspaceApi = {
  list: () => apiClient('/workspaces'),
  create: (data) => apiClient('/workspaces', { method: 'POST', body: data }),
  get: (workspaceId) => apiClient(`/workspaces/${workspaceId}`),
  update: (workspaceId, data) => apiClient(`/workspaces/${workspaceId}`, { method: 'PATCH', body: data }),
  getMembers: (workspaceId) => apiClient(`/workspaces/${workspaceId}/members`),
  inviteMember: (workspaceId, data) => apiClient(`/workspaces/${workspaceId}/members/invite`, { method: 'POST', body: data }),
  updateMemberRole: (workspaceId, memberId, role) =>
    apiClient(`/workspaces/${workspaceId}/members/${memberId}`, { method: 'PATCH', body: { role } }),
  removeMember: (workspaceId, memberId) =>
    apiClient(`/workspaces/${workspaceId}/members/${memberId}`, { method: 'DELETE' }),
};
