import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  Activity,
  AlertTriangle,
  Rocket,
  Server,
  Users,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo } from '../brand/Logo.jsx';

export function Sidebar({ isOpen, onClose }) {
  const { activeWorkspace } = useAuth();

  const navSections = [
    {
      title: 'Command Center',
      items: [
        { label: 'Operations Desk', icon: LayoutDashboard, path: '/app/dashboard' },
        { label: 'Kanban Stream', icon: KanbanSquare, path: '/app/issues' },
        { label: 'Projects & Epics', icon: FolderKanban, path: '/app/projects' },
      ],
    },
    {
      title: 'Reliability & Mesh',
      items: [
        { label: 'Service Health Grid', icon: Activity, path: '/app/services' },
        { label: 'Incident War Rooms', icon: AlertTriangle, path: '/app/incidents' },
      ],
    },
    {
      title: 'Releases & CI/CD',
      items: [
        { label: 'Releases & Manifests', icon: Rocket, path: '/app/releases' },
        { label: 'Deployment Logs', icon: Server, path: '/app/deployments' },
      ],
    },
    {
      title: 'Studio & Access',
      items: [
        { label: 'Team Directory', icon: Users, path: '/app/team' },
        { label: 'Notifications Feed', icon: Bell, path: '/app/notifications' },
        { label: 'Workspace Settings', icon: Settings, path: '/app/settings/workspace' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#24251F]/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#ECE7DE] dark:bg-[#1A1C18] border-r border-[#D8D0C3] dark:border-[#2C2F28] z-40 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#D8D0C3] dark:border-[#2C2F28] shrink-0 justify-between">
          <Logo size="md" />
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#242621] text-[#7C7E74] dark:text-[#A6A89E] border border-[#D8D0C3] dark:border-[#353831]">
            v2.4
          </span>
        </div>

        {/* Current Active Workspace Indicator */}
        <div className="px-5 py-3.5 border-b border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2]/60 dark:bg-[#20221E]/60">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#7C7E74] dark:text-[#9A9C92]">Active Workspace</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7] truncate">
              {activeWorkspace?.name || 'OrbitOps Core'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C65D3A]/10 text-[#C65D3A] dark:text-[#D97753] border border-[#C65D3A]/25">
              {activeWorkspace?.role || 'Architect'}
            </span>
          </div>
        </div>

        {/* Nav Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-2.5 text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#8E9086] mb-1.5">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#24251F] text-[#F3EFE7] dark:bg-[#FAF7F2] dark:text-[#24251F] font-semibold'
                          : 'text-[#5A5C54] dark:text-[#A6A89E] hover:text-[#24251F] dark:hover:text-[#F3EFE7] hover:bg-[#E2DAD0]/70 dark:hover:bg-[#242621]'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* System Health Quick Status Footer */}
        <div className="p-3.5 border-t border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E] shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#4A6B53]/10 border border-[#4A6B53]/25 text-[#4A6B53] dark:text-[#78A885] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#4A6B53] dark:bg-[#78A885] shrink-0" />
            <span className="font-mono text-[11px] truncate tracking-tight">Mesh Telemetry Nominal</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
