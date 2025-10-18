import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  animation = 'wave'
}: SkeletonProps) {
  const baseClasses = 'bg-muted rounded';
  
  const variantClasses = {
    text: 'h-4',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  const animationVariants = {
    pulse: {
      animate: {
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    wave: {
      animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    none: {},
  };

  const style = {
    width: width || '100%',
    height: height || '1rem',
    background: animation === 'wave' 
      ? 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)'
      : undefined,
    backgroundSize: animation === 'wave' ? '200% 100%' : undefined,
  };

  if (animation === 'none') {
    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        style={style}
      />
    );
  }

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
      variants={animationVariants[animation]}
      animate="animate"
    />
  );
}

// Predefined skeleton components
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '75%' : '100%'}
          className={cn(i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton width="20%" />
          <Skeleton width="30%" />
          <Skeleton width="25%" />
          <Skeleton width="15%" />
          <Skeleton width="10%" />
        </div>
      ))}
    </div>
  );
}
