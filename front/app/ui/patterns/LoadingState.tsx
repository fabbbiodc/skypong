import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin rounded-full", {
  variants: {
    size: {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    },
    color: {
      default: "border-slate-600",
      primary: "border-primary",
      secondary: "border-secondary",
      danger: "border-danger",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

const skeletonVariants = cva("animate-pulse rounded", {
  variants: {
    size: {
      sm: "h-3 w-12",
      md: "h-4 w-24",
      lg: "h-5 w-32",
    },
    color: {
      default: "bg-slate-700",
      primary: "bg-slate-600",
    },
  },
  defaultVariants: {
    size: "md",
    color: "default",
  },
});

interface LoadingStateProps {
  className?: string;
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "secondary" | "danger";
  text?: string;
}

type SkeletonColor = "default" | "primary";

function toSkeletonColor(color: LoadingStateProps["color"]): SkeletonColor {
  if (color === "primary") {
    return "primary";
  }
  return "default";
}

export function LoadingState({
  className,
  variant = "spinner",
  size = "md",
  color = "primary",
  text,
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div className={cn(spinnerVariants({ size, color }), "border-2")} />
        {text && <span className="text-sm text-slate-300">{text}</span>}
      </div>
    );
  }

  if (variant === "skeleton") {
    const skeletonColor = toSkeletonColor(color);

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className={cn(skeletonVariants({ size, color: skeletonColor }))} />
        {text && (
          <div
            className={cn(
              skeletonVariants({ size: "sm", color: skeletonColor }),
            )}
          />
        )}
      </div>
    );
  }

  // dots variant
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <span
        className={cn(
          size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-3 h-3" : "w-2 h-2",
          "bg-primary rounded-full animate-bounce",
        )}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={cn(
          size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-3 h-3" : "w-2 h-2",
          "bg-primary rounded-full animate-bounce",
        )}
        style={{ animationDelay: "150ms" }}
      />
      <span
        className={cn(
          size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-3 h-3" : "w-2 h-2",
          "bg-primary rounded-full animate-bounce",
        )}
        style={{ animationDelay: "300ms" }}
      />
      {text && <span className="text-sm text-slate-300 ml-2">{text}</span>}
    </div>
  );
}
