import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

// Configure TanStack Query with resilient defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <BrowserRouter>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </BrowserRouter>
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
