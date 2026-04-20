import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        success: "bg-success text-white",
        warning: "bg-amber-500 text-white",
        danger: "bg-danger text-white",
        info: "bg-blue-500 text-white",
        neutral: "bg-slate-700 text-slate-200",
        outline: "border-2 border-slate-600 text-slate-300 bg-transparent",
      },
      size: {
        sm: "text-xs px-2 py-0.5 min-w-[1.5rem] min-h-[1.5rem]",
        md: "text-sm px-2.5 py-1 min-w-[2rem] min-h-[2rem]",
        lg: "text-base px-3 py-1.5 min-w-[2.5rem] min-h-[2.5rem]",
      },
      shape: {
        rounded: "rounded-lg",
        pill: "rounded-full",
        square: "rounded-none",
      },
      state: {
        default: "",
        pulse: "animate-pulse",
        subtle: "opacity-80",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "rounded",
      state: "default",
    },
  },
);

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
type BadgeSize = VariantProps<typeof badgeVariants>["size"];
type BadgeShape = VariantProps<typeof badgeVariants>["shape"];
type BadgeState = VariantProps<typeof badgeVariants>["state"];

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  state?: BadgeState;
  className?: string;
  children: ReactNode;
}

export function Badge({
  variant = "primary",
  size = "md",
  shape = "rounded",
  state = "default",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, shape, state }), className)}
    >
      {children}
    </span>
  );
}
