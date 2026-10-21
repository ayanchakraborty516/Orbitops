import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Drawer({ isOpen, onClose, title, subtitle, children, width = 'max-w-2xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Studio Backdrop */}
      <div
        className="fixed inset-0 bg-[#24251F]/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-screen ${width} bg-[#FAF7F2] dark:bg-[#20221E] border-l border-[#D8D0C3] dark:border-[#353831] shadow-xl flex flex-col animate-in slide-in-from-right duration-200`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5DED2] dark:border-[#2D302A] flex items-center justify-between shrink-0 bg-[#FAF7F2] dark:bg-[#20221E]">
            <div>
              <h3 className="font-editorial text-lg font-medium text-[#24251F] dark:text-[#EAE7E0] tracking-tight">{title}</h3>
              {subtitle && <p className="text-[11px] font-mono text-[#7E7B72] dark:text-[#87857C] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#7E7B72] hover:text-[#24251F] dark:hover:text-[#EAE7E0] p-1.5 rounded hover:bg-[#E5DED2]/50 dark:hover:bg-[#2A2C27] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#FAF7F2] dark:bg-[#20221E]">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Drawer;
