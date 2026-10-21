import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';
import { workspaceApi } from '../api/workspaceApi.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('orbitops_token'));
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('orbitops_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (data && data.user) {
          setUser(data.user);
          setWorkspaces(data.workspaces || []);

          // Restore or select active workspace
          const savedWsId = localStorage.getItem('orbitops_active_workspace_id');
          const matched = data.workspaces?.find((w) => w._id === savedWsId);

          if (matched) {
            setActiveWorkspace(matched);
          } else if (data.workspaces?.length > 0) {
            setActiveWorkspace(data.workspaces[0]);
            localStorage.setItem('orbitops_active_workspace_id', data.workspaces[0]._id);
          }
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    setToken(data.token);
    setWorkspaces(data.workspaces || []);
    localStorage.setItem('orbitops_token', data.token);

    if (data.workspaces && data.workspaces.length > 0) {
      setActiveWorkspace(data.workspaces[0]);
      localStorage.setItem('orbitops_active_workspace_id', data.workspaces[0]._id);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('orbitops_token', data.token);

    if (data.defaultWorkspace) {
      const ws = { ...data.defaultWorkspace, role: 'Owner' };
      setWorkspaces([ws]);
      setActiveWorkspace(ws);
      localStorage.setItem('orbitops_active_workspace_id', ws._id);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    localStorage.removeItem('orbitops_token');
    localStorage.removeItem('orbitops_active_workspace_id');
  };

  const switchWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('orbitops_active_workspace_id', workspace._id);
    window.location.reload(); // Refresh Query caches for the new workspace context
  };

  const refreshWorkspaces = async () => {
    try {
      const data = await workspaceApi.list();
      setWorkspaces(data || []);
      if (!activeWorkspace && data?.length > 0) {
        setActiveWorkspace(data[0]);
        localStorage.setItem('orbitops_active_workspace_id', data[0]._id);
      }
    } catch (e) {
      console.error('Failed to refresh workspaces:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        workspaces,
        activeWorkspace,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchWorkspace,
        refreshWorkspaces,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
