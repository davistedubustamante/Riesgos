import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Premium Toast Notification System for RiskFlow
 * Provides toast notifications with animations and variants
 */

const ToastContext = createContext(null);

// Toast variants with premium styling
const toastVariants = {
  default: {
    className: 'border-white/10 bg-black/60 text-white',
    icon: null,
  },
  destructive: {
    className: 'border-red-500/50 bg-red-950/80 text-red-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  success: {
    className: 'border-emerald-500/50 bg-emerald-950/80 text-emerald-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    className: 'border-amber-500/50 bg-amber-950/80 text-amber-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    className: 'border-cyan-500/50 bg-cyan-950/80 text-cyan-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

/**
 * Toast item component with premium animations
 */
function ToastItem({ toast, onDismiss }) {
  const variant = toastVariants[toast.variant] || toastVariants.default;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-xl backdrop-blur-md',
        'max-w-sm w-full pointer-events-auto',
        'transition-all duration-300 ease-premium',
        toast.exiting
          ? 'animate-slide-out-right opacity-0 translate-x-4'
          : 'animate-slide-in-right opacity-100 translate-x-0',
        variant.className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {variant.icon && (
        <div className={cn('flex-shrink-0 mt-0.5', toast.exiting ? 'opacity-0' : 'opacity-100')}>
          {variant.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm">{toast.title}</p>
        )}
        {toast.description && (
          <p className={cn('text-xs mt-1 opacity-80', toast.title ? '' : 'mt-0')}>
            {toast.description}
          </p>
        )}
        
        {/* Action button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick?.();
              onDismiss(toast.id);
            }}
            className={cn(
              'mt-2 text-xs font-medium px-3 py-1.5 rounded-md',
              'bg-white/10 hover:bg-white/20 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-white/20'
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Progress bar (auto-dismiss indicator) */}
      {toast.duration && !toast.exiting && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white/20 animate-shrink"
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'flex-shrink-0 p-1 rounded-md',
          'hover:bg-white/10 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-white/20'
        )}
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast Provider - wrap your app with this
 */
export function ToastProvider({ 
  children, 
  position = 'bottom-right',
  maxToasts = 5,
}) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(({ 
    title, 
    description, 
    variant = 'default',
    duration = 4000,
    action,
  }) => {
    const id = `toast-${++toastIdRef.current}`;
    
    setToasts((prev) => {
      const newToasts = [...prev, { 
        id, 
        title, 
        description, 
        variant, 
        duration,
        action,
        exiting: false 
      }];
      // Limit max toasts
      return newToasts.slice(-maxToasts);
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss, maxToasts]);

  // Convenience methods
  const success = useCallback((title, description) => {
    return toast({ title, description, variant: 'success' });
  }, [toast]);

  const error = useCallback((title, description) => {
    return toast({ title, description, variant: 'destructive', duration: 6000 });
  }, [toast]);

  const warning = useCallback((title, description) => {
    return toast({ title, description, variant: 'warning' });
  }, [toast]);

  const info = useCallback((title, description) => {
    return toast({ title, description, variant: 'info' });
  }, [toast]);

  // Position classes
  const positions = {
    'top-right': 'top-4 right-4 flex-col-reverse',
    'bottom-right': 'bottom-4 right-4 flex-col',
    'top-left': 'top-4 left-4 flex-col-reverse',
    'bottom-left': 'bottom-4 left-4 flex-col',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col',
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss, success, error, warning, info }}>
      {children}
      
      {/* Toast container */}
      <div
        className={cn(
          'fixed z-[100] pointer-events-none',
          'flex gap-2',
          positions[position] || positions['bottom-right']
        )}
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>

      {/* CSS for progress bar animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink linear forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

/**
 * useToast hook - use inside a ToastProvider
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

/**
 * Shorthand hook for common toast patterns
 */
export function useToastNotification() {
  const { toast, success, error, warning, info } = useToast();

  return {
    toast,           // Full control
    success,         // toast({ title, description }) with success variant
    error,           // toast({ title, description }) with error variant
    warning,         // toast({ title, description }) with warning variant
    info,            // toast({ title, description }) with info variant
    
    // API result helpers
    toastApiSuccess: (message = 'Operación exitosa') => 
      success('Éxito', message),
    
    toastApiError: (error, fallback = 'Ocurrió un error') =>
      error('Error', error?.message || fallback),
    
    toastApiLoading: (message = 'Cargando...') =>
      toast({ title: message, variant: 'info', duration: 0 }),
  };
}
