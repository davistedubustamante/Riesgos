import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, title, description, variant, exiting: false }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto max-w-sm w-full rounded-lg border p-4 shadow-xl backdrop-blur-md transition-all duration-300',
              t.exiting
                ? 'animate-slide-out-right'
                : 'animate-slide-in-right',
              t.variant === 'destructive'
                ? 'border-red-500/50 bg-red-950/80 text-red-100'
                : t.variant === 'success'
                ? 'border-emerald-500/50 bg-emerald-950/80 text-emerald-100'
                : 'border-white/10 bg-black/60 text-white'
            )}
          >
            {t.title && <p className="font-semibold text-sm">{t.title}</p>}
            {t.description && (
              <p className="text-xs mt-1 opacity-80">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
