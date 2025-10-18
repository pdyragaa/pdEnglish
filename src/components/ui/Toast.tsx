import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const colors = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
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
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative flex items-start space-x-3 p-4 rounded-lg shadow-lg max-w-sm',
        colors[type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold">{title}</p>
        )}
        {description && (
          <p className="text-sm opacity-90 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }: { 
  toasts: ToastProps[]; 
  onClose: (id: string) => void; 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
