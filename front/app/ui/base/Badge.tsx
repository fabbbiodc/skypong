import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const badgeVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        success: "bg-green-500 text-white",
        warning: "bg-amber-500 text-white",
        danger: "bg-danger text-white",
        info: "bg-blue-500 text-white",
        neutral: "bg-gray-200 text-gray-800",
        outline: "border-2 border-primary text-primary bg-transparent",
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
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "rounded",
    },
  },
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  children: ReactNode;
}

export function Badge({
  variant,
  size,
  shape,
  className,
  children,
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, shape, className }))}>
      {children}
    </span>
  );
}
