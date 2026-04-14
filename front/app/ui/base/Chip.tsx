import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 text-xs md:text-sm font-medium rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-chip-default text-chip-default-text',
        success: 'bg-chip-success text-chip-success-text',
        warning: 'bg-chip-warning text-chip-warning-text',
        error: 'bg-chip-error text-chip-error-text',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ChipProps extends VariantProps<typeof chipVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Chip({ variant, className, children }: ChipProps) {
  return (
    <span className={cn(chipVariants({ variant, className }))}>
      {children}
    </span>
  );
}
