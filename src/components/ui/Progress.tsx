import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function Progress({
  value,
  max = 100,
  className,
  size = 'md',
  variant = 'default',
  showValue = false,
  animated = true,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Progress</span>
        {showValue && (
          <span className="text-sm text-muted-foreground">
            {value}/{max}
          </span>
        )}
      </div>
      
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors duration-300',
            variantClasses[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? {
            duration: 0.8,
            ease: 'easeOut',
          } : { duration: 0 }}
        />
      </div>
      
      {showValue && (
        <div className="text-right mt-1">
          <span className="text-xs text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Circular progress component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 40,
  strokeWidth = 4,
  className,
  variant = 'default',
  showValue = false,
  animated = true,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    default: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={colorClasses[variant]}
          style={{
            strokeDasharray,
            strokeDashoffset: animated ? circumference : strokeDashoffset,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={animated ? {
            duration: 0.8,
            ease: 'easeOut',
          } : { duration: 0 }}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
