'use client';

import { useState, useEffect, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;
let setToastsState: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

export function toast(message: string, type: 'success' | 'error' = 'success') {
  if (setToastsState) {
    setToastsState(prev => [...prev, { id: ++toastId, message, type }]);
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    setToastsState = setToasts;
    return () => {
      setToastsState = null;
    };
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right ${
            t.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          onClick={() => removeToast(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
