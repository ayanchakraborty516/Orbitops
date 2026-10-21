import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Building,
  Plus,
  Wifi,
  WifiOff,
  Check,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi.js';

export function TopNav({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, workspaces, activeWorkspace, switchWorkspace, logout } = useAuth();
  const { isConnected } = useSocket();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const wsRef = useRef();
  const profRef = useRef();

  // Fetch unread notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list(),
    refetchInterval: 15000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wsRef.current && !wsRef.current.contains(e.target)) {
        setIsWorkspaceMenuOpen(false);
      }
      if (profRef.current && !profRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#F3EFE7]/90 dark:bg-[#161714]/90 backdrop-blur-md border-b border-[#D8D0C3] dark:border-[#2C2F28] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-[#5A5C54] hover:text-[#24251F] dark:text-[#A6A89E] dark:hover:text-[#F3EFE7] hover:bg-[#E5DED2]/60 dark:hover:bg-[#242621] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace Switcher */}
        <div className="relative" ref={wsRef}>
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] text-xs font-medium text-[#24251F] dark:text-[#F3EFE7] hover:bg-[#E5DED2]/50 dark:hover:bg-[#282B24] transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-[#C65D3A] shrink-0" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate font-medium">
              {activeWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#7C7E74]" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] rounded-xl shadow-lg py-2 z-50">
              <p className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92]">
                Workspaces ({workspaces.length})
              </p>
              <div className="max-h-48 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => {
                      switchWorkspace(ws);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#E5DED2]/60 dark:hover:bg-[#282B24] transition-colors ${
                      activeWorkspace?._id === ws._id
                        ? 'font-semibold text-[#C65D3A] dark:text-[#D97753] bg-[#C65D3A]/5'
                        : 'text-[#24251F] dark:text-[#EDE8DF]'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?._id === ws._id && <Check className="w-3.5 h-3.5 shrink-0 text-[#C65D3A]" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-[#D8D0C3] dark:border-[#353831] mt-1.5 pt-1.5 px-2">
                <button
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    navigate('/app/settings/workspace');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5A5C54] dark:text-[#A6A89E] hover:text-[#24251F] dark:hover:text-[#F3EFE7] hover:bg-[#E5DED2]/50 dark:hover:bg-[#282B24]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C65D3A]" />
                  <span>Workspace Settings & Roles</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Socket status indicator */}
        <div
          title={isConnected ? 'Live Socket.IO Connected' : 'Socket.IO Disconnected'}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#5A5C54] dark:text-[#A6A89E] bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831]"
        >
          {isConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B53] dark:bg-[#78A885]" />
              <span>LIVE MESH</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C65D3A]" />
              <span>OFFLINE</span>
            </>
          )}
        </div>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Notifications Button */}
        <button
          onClick={() => navigate('/app/notifications')}
          className="relative p-2 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] text-[#5A5C54] dark:text-[#A6A89E] hover:text-[#24251F] dark:hover:text-[#F3EFE7] hover:bg-[#E5DED2]/50 dark:hover:bg-[#282B24] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C65D3A] text-[9px] font-mono font-bold text-white flex items-center justify-center ring-2 ring-[#FAF7F2] dark:ring-[#20221E]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={profRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] hover:bg-[#E5DED2]/50 dark:hover:bg-[#282B24] transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#D8D0C3] dark:ring-[#353831]"
            />
            <span className="hidden md:inline text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7] max-w-[120px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#7C7E74]" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-[#D8D0C3] dark:border-[#353831]">
                <p className="text-xs font-bold text-[#24251F] dark:text-[#F3EFE7] truncate font-serif">{user?.name}</p>
                <p className="text-[11px] text-[#7C7E74] dark:text-[#9A9C92] truncate font-mono">{user?.email}</p>
                <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[#C65D3A]/10 text-[#C65D3A] dark:text-[#D97753] border border-[#C65D3A]/20">
                  {user?.title || 'Engineer'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/app/settings/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#5A5C54] dark:text-[#A6A89E] hover:text-[#24251F] dark:hover:text-[#F3EFE7] hover:bg-[#E5DED2]/50 dark:hover:bg-[#282B24] flex items-center gap-2.5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#7C7E74]" />
                  <span>Profile & Preferences</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/app/settings/workspace');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#5A5C54] dark:text-[#A6A89E] hover:text-[#24251F] dark:hover:text-[#F3EFE7] hover:bg-[#E5DED2]/50 dark:hover:bg-[#282B24] flex items-center gap-2.5 transition-colors"
                >
                  <Building className="w-4 h-4 text-[#7C7E74]" />
                  <span>Workspace Settings</span>
                </button>
              </div>

              <div className="border-t border-[#D8D0C3] dark:border-[#353831] pt-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#C65D3A] dark:text-[#D97753] hover:bg-[#C65D3A]/10 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNav;
