import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const cardVariants = cva("bg-white rounded-xl transition-all duration-200", {
  variants: {
    variant: {
      default: "border border-gray-200",
      elevated: "shadow-md hover:shadow-lg",
      bordered: "border-2 border-primary",
      ghost: "border border-transparent hover:border-gray-200",
    },
    padding: {
      none: "p-0",
      sm: "p-3 md:p-4",
      md: "p-4 md:p-6",
      lg: "p-6 md:p-8",
    },
    state: {
      default: "",
      hover: "hover:border-primary-hover",
      active: "active:scale-[0.98]",
      disabled: "opacity-50 pointer-events-none",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    state: "default",
  },
});

type CardVariant = VariantProps<typeof cardVariants>["variant"];
type CardPadding = VariantProps<typeof cardVariants>["padding"];
type CardState = VariantProps<typeof cardVariants>["state"];

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  state?: CardState;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function Card({
  variant = "default",
  padding = "md",
  state = "default",
  className,
  children,
  onClick,
  title,
  subtitle,
  icon,
}: CardProps) {
  const cardClass = cn(
    cardVariants({ variant, padding, state }),
    onClick && "cursor-pointer hover:border-primary",
    className,
  );

  return (
    <div className={cardClass} onClick={onClick}>
      {(title || subtitle || icon) && (
        <div className="mb-4 flex items-start gap-3">
          {icon && <div className="text-2xl">{icon}</div>}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg md:text-xl font-semibold font-display text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm md:text-base text-muted mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
