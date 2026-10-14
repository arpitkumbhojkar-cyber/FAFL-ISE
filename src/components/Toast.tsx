import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-[#111827] px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-md animate-bounce">
      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
      <span>{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
