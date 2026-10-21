import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Layouts
import { AppLayout } from '../components/layout/AppLayout.jsx';

// Pages
import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.jsx';

import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { ProjectsListPage } from '../pages/projects/ProjectsListPage.jsx';
import { ProjectDetailsPage } from '../pages/projects/ProjectDetailsPage.jsx';
import { KanbanBoardPage } from '../pages/issues/KanbanBoardPage.jsx';
import { ServiceStatusPage } from '../pages/incidents/ServiceStatusPage.jsx';
import { IncidentsPage } from '../pages/incidents/IncidentsPage.jsx';
import { ReleasesPage } from '../pages/releases/ReleasesPage.jsx';
import { DeploymentsPage } from '../pages/releases/DeploymentsPage.jsx';
import { TeamDirectoryPage } from '../pages/team/TeamDirectoryPage.jsx';
import { NotificationsPage } from '../pages/notifications/NotificationsPage.jsx';
import { ProfilePage } from '../pages/settings/ProfilePage.jsx';
import { WorkspaceSettingsPage } from '../pages/settings/WorkspaceSettingsPage.jsx';

import { NotFoundPage } from '../pages/system/NotFoundPage.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3EFE7] dark:bg-[#161714]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-terracotta-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-mono text-charcoal-500 dark:text-stone-400 tracking-wider uppercase">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Operations Application */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="issues" element={<KanbanBoardPage />} />
        <Route path="services" element={<ServiceStatusPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="releases" element={<ReleasesPage />} />
        <Route path="deployments" element={<DeploymentsPage />} />
        <Route path="team" element={<TeamDirectoryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/workspace" element={<WorkspaceSettingsPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
