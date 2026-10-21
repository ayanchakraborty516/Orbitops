import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, title = 'Confirmed') => addToast({ title, message: msg, type: 'success' }), [addToast]);
  const error = useCallback((msg, title = 'Notice') => addToast({ title, message: msg, type: 'error' }), [addToast]);
  const info = useCallback((msg, title = 'Update') => addToast({ title, message: msg, type: 'info' }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      {/* Contemporary Studio Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-md border shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 bg-[#FAF7F2] dark:bg-[#20221E] ${
              toast.type === 'success'
                ? 'border-[#D3E2D7] dark:border-[#2D3E32] text-[#24251F] dark:text-[#EAE7E0]'
                : toast.type === 'error'
                ? 'border-[#EACCC6] dark:border-[#523432] text-[#24251F] dark:text-[#EAE7E0]'
                : 'border-[#D8D0C3] dark:border-[#353831] text-[#24251F] dark:text-[#EAE7E0]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#345E40] dark:text-[#78A885]" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#C65D3A] dark:text-[#D9734E]" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#57554D] dark:text-[#B8B5AC]" />}
            </div>
            <div className="flex-1 text-xs">
              {toast.title && <p className="font-semibold text-[#24251F] dark:text-[#EAE7E0] leading-snug">{toast.title}</p>}
              <p className="text-[#57554D] dark:text-[#B8B5AC] text-[11px] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#7E7B72] hover:text-[#24251F] dark:hover:text-[#EAE7E0] transition-colors p-1 -mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
