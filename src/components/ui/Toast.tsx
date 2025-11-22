import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};



export function Toast({
  id,
  title,
  description,
  type = 'info',
  duration = 5000,
  onClose
}: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'relative flex items-start space-x-3 p-4 rounded-xl shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300 border backdrop-blur-xl',
        type === 'success' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        type === 'error' && 'bg-red-500/10 border-red-500/20 text-red-500',
        type === 'info' && 'bg-blue-500/10 border-blue-500/20 text-blue-500'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-white">{title}</p>
        )}
        {description && (
          <p className="text-sm opacity-90 mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
