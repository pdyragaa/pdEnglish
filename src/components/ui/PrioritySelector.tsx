import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PrioritySelectorProps {
  value: number | null;
  onChange: (priority: number) => void;
  disabled?: boolean;
}

export function PrioritySelector({ value, onChange, disabled = false }: PrioritySelectorProps) {
  const handleClick = (priority: number) => {
    if (!disabled) {
      onChange(priority);
    }
  };

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
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((priority) => {
        const isSelected = value === priority;

        return (
          <button
            key={priority}
            type="button"
            onClick={() => handleClick(priority)}
            disabled={disabled}
            title={getTooltipText(priority)}
            className={cn(
              "p-1 rounded-full transition-all duration-200",
              isSelected ? "text-yellow-400 bg-yellow-400/10" : "text-muted-foreground/50 hover:text-yellow-400 hover:bg-yellow-400/10",
              disabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground/50 hover:bg-transparent"
            )}
          >
            <Star
              className={cn(
                "w-5 h-5",
                isSelected && "fill-current"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
