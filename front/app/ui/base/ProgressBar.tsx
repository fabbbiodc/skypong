import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressBarVariants = cva(
  // Base styles for the bar
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      color: {
        primary: 'bg-primary',
        success: 'bg-green-500',
        danger: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
        neutral: 'bg-gray-400',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
);

interface ProgressBarProps extends VariantProps<typeof progressBarVariants> {
  className?: string;
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  color,
  className,
  value,
  max,
  label,
  showPercentage = false,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel && label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs md:text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-xs md:text-sm font-semibold text-gray-900">{percentage}%</span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        heightClasses[size]
      )}>
        <div
          className={progressBarVariants({ color })}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
      {showPercentage && !showLabel && (
        <div className="text-xs md:text-sm text-gray-600 mt-1 text-right font-medium">
          {value} / {max}
        </div>
      )}
    </div>
  );
}
