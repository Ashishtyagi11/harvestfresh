import React from 'react';
import { useStore } from '../store/useStore';

export const Toast = () => {
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  if (!toast) return null;

  const bgColors = {
    success: 'bg-primary text-white border-primary-container',
    error: 'bg-error text-white border-error-container',
    warning: 'bg-tertiary-container text-on-tertiary-container border-tertiary',
    info: 'bg-secondary text-white border-secondary-container'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border animate-bounce-short transition-all">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[toast.type] || bgColors.info}`}>
        <span className="material-symbols-outlined text-xl">
          {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'info'}
        </span>
        <span className="font-jakarta text-sm font-semibold">{toast.message}</span>
        <button onClick={hideToast} className="ml-2 opacity-80 hover:opacity-100">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
};
