import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PriorityDisplayProps {
  priority?: number;
  size?: 'small' | 'medium';
}

export function PriorityDisplay({ priority, size = 'small' }: PriorityDisplayProps) {
  if (!priority || priority < 1 || priority > 3) {
    return null;
  }

  const getTooltipText = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Tak sobie ważne';
      case 2:
        return 'Ważne';
      case 3:
        return 'Bardzo ważne';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-0.5" title={getTooltipText(priority)}>
      {[1, 2, 3].map((level) => (
        <Star
          key={level}
          className={cn(
            "transition-colors",
            size === 'medium' ? "w-5 h-5" : "w-3.5 h-3.5",
            level <= priority
              ? "text-yellow-400 fill-current"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
