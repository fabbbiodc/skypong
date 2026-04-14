import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const statCardVariants = cva(
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
      size: {
        sm: "p-3 text-2xl",
        md: "p-4 text-3xl md:text-4xl",
        lg: "p-6 text-4xl md:text-5xl",
      },
      state: {
        default: "",
        compact: "p-2",
        featured: "border-4 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  },
);

type StatCardVariant = VariantProps<typeof statCardVariants>["variant"];
type StatCardSize = VariantProps<typeof statCardVariants>["size"];
type StatCardState = VariantProps<typeof statCardVariants>["state"];

interface StatCardProps {
  variant?: StatCardVariant;
  size?: StatCardSize;
  state?: StatCardState;
  className?: string;
  label: string;
  value: string | number;
  icon?: ReactNode;
  /** Trend direction: up (green), down (red), neutral (gray) */
  trend?: "up" | "down" | "neutral";
  /** Trend value display (e.g., "+5", "-10") */
  trendValue?: string;
}

export function StatCard({
  variant = "default",
  size = "md",
  state = "default",
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
    <div className={cn(statCardVariants({ variant, size, state }), className)}>
      {icon && (
        <div
          className={cn(
            "mb-2",
            size === "sm"
              ? "text-2xl"
              : size === "lg"
                ? "text-5xl"
                : "text-3xl",
          )}
        >
          {icon}
        </div>
      )}
      <div
        className={cn(
          "font-bold font-display text-gray-900",
          size === "sm" ? "text-2xl" : size === "lg" ? "text-4xl" : "text-3xl",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "text-gray-600 mt-1 font-medium",
          size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm",
        )}
      >
        {label}
      </div>
      {trend && trendValue && (
        <div
          className={cn(
            "font-medium mt-2",
            trendColor,
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {trendIcon} {trendValue}
        </div>
      )}
    </div>
  );
}
