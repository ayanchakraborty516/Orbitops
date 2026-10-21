import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo.jsx';
import { Button } from '../ui/Button.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export function PublicNavbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="h-20 border-b border-[#D8D0C3] dark:border-[#2C2F28] bg-[#F3EFE7]/85 dark:bg-[#161714]/85 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <Logo size="lg" />
      </Link>

      <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-[#5A5C54] dark:text-[#A6A89E]">
        <a href="#features" className="hover:text-[#C65D3A] transition-colors">
          Platform Architecture
        </a>
        <a href="#architecture" className="hover:text-[#C65D3A] transition-colors">
          Ops Desk
        </a>
        <a href="#stack" className="hover:text-[#C65D3A] transition-colors">
          Reliability Engine
        </a>
        <a href="#metrics" className="hover:text-[#C65D3A] transition-colors">
          Telemetry
        </a>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {isAuthenticated ? (
          <Link to="/app/dashboard">
            <Button variant="primary" size="sm" icon={LayoutDashboard}>
              Open Ops Desk
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Get Access
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default PublicNavbar;
