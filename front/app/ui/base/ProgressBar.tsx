import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressBarVariants = cva(
  "h-full rounded-full transition-all duration-500 ease-out",
  {
    variants: {
      color: {
        primary: "bg-primary",
        secondary: "bg-secondary",
        success: "bg-success",
        danger: "bg-danger",
        warning: "bg-amber-500",
        info: "bg-blue-500",
        neutral: "bg-slate-600",
      },
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
      },
      state: {
        default: "",
        striped: "bg-stripes",
        animated: "animate-pulse",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "md",
      state: "default",
    },
  },
);

type ProgressColor = VariantProps<typeof progressBarVariants>["color"];
type ProgressSize = VariantProps<typeof progressBarVariants>["size"];
type ProgressState = VariantProps<typeof progressBarVariants>["state"];

interface ProgressBarProps {
  color?: ProgressColor;
  size?: ProgressSize;
  state?: ProgressState;
  className?: string;
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
  /** Label for accessibility */
  label?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show label above bar */
  showLabel?: boolean;
}

export function ProgressBar({
  color = "primary",
  size = "md",
  state = "default",
  className,
  value,
  max,
  label,
  showPercentage = false,
  showLabel = false,
}: ProgressBarProps) {
  const percentage =
    max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-white">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-slate-700 rounded-full overflow-hidden",
          progressBarVariants({ size }),
        )}
      >
        <div
          className={progressBarVariants({ color, state })}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
      {showPercentage && !showLabel && (
        <div className="text-sm text-slate-400 mt-1 text-right font-medium">
          {value} / {max}
        </div>
      )}
    </div>
  );
}
