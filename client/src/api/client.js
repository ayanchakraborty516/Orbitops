const API_BASE = import.meta.env?.VITE_API_BASE_URL || '/api/v1';

export function buildQuery(params = {}) {
  const clean = Object.entries(params).filter(
    ([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all' && v !== 'undefined'
  );
  if (clean.length === 0) return '';
  return `?${new URLSearchParams(clean).toString()}`;
}

export class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('orbitops_token');
  const activeWorkspaceId = localStorage.getItem('orbitops_active_workspace_id');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeWorkspaceId && !headers['x-workspace-id']) {
    headers['x-workspace-id'] = activeWorkspaceId;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // sends cookies
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || (data?.errors && Array.isArray(data.errors) ? data.errors.join(', ') : 'Network request failed');
      throw new ApiError(errorMessage, response.status, data?.errors);
    }

    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Connection failure. Please check your network.', 500);
  }
}

export default apiClient;
