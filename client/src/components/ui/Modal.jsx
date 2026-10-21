import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-lg' }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with warm studio dimming */}
      <div
        className="fixed inset-0 bg-[#24251F]/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] rounded-lg shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5DED2] dark:border-[#2D302A]">
          <div>
            <h3 className="font-editorial text-lg font-medium text-[#24251F] dark:text-[#EAE7E0] tracking-tight">{title}</h3>
            {description && <p className="text-[11px] text-[#7E7B72] dark:text-[#87857C] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#7E7B72] hover:text-[#24251F] dark:hover:text-[#EAE7E0] p-1.5 rounded hover:bg-[#E5DED2]/50 dark:hover:bg-[#2A2C27] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
