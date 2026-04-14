import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const statCardVariants = cva(
  // Base styles
  "flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 hover:border-gray-300",
        primary: "bg-purple-50 border-primary hover:border-primary-hover",
        success: "bg-green-50 border-green-500 hover:border-green-600",
        danger: "bg-red-50 border-red-500 hover:border-red-600",
        warning: "bg-amber-50 border-amber-500 hover:border-amber-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  className?: string;
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatCard({
  variant,
  className,
  label,
  value,
  icon,
  trend,
  trendValue,
}: StatCardProps) {
  const trendColor = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  }[trend || "neutral"];

  const trendIcon = {
    up: "↑",
    down: "↓",
    neutral: "→",
  }[trend || "neutral"];

  return (
    <div className={cn(statCardVariants({ variant, className }))}>
      {icon && <div className="text-3xl md:text-4xl mb-2">{icon}</div>}
      <div className="text-3xl md:text-4xl font-bold font-display text-gray-900">
        {value}
      </div>
      <div className="text-sm md:text-base text-gray-600 mt-1 font-medium">
        {label}
      </div>
      {trend && trendValue && (
        <div className={cn("text-xs md:text-sm font-medium mt-2", trendColor)}>
          {trendIcon} {trendValue}
        </div>
      )}
    </div>
  );
}
