import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';
import { Logo } from '../../components/brand/Logo.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F3EFE7] dark:bg-[#161714] text-charcoal-900 dark:text-stone-100 text-center">
      <div className="bg-[#FAF7F2] dark:bg-[#1E201C] border border-stone-300 dark:border-stone-800 p-8 rounded-lg max-w-md w-full flex flex-col items-center">
        <Logo size="lg" className="mb-6" />
        <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
          <ShieldAlert className="w-7 h-7 stroke-[1.5]" />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-terracotta-600 dark:text-terracotta-400 mb-1">
          ERROR // 403
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight mb-2">
          Authorization Required
        </h1>
        <p className="text-xs text-charcoal-600 dark:text-stone-400 max-w-sm mb-6">
          Your current tenant role does not have elevated permissions to inspect or mutate this resource.
        </p>
        <Link to="/app/dashboard" className="w-full">
          <Button variant="primary" size="md" icon={ArrowLeft} className="w-full">
            Return to Operations Desk
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
