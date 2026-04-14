import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles - using Tailwind v4 auto-generated utilities from CSS variables
  "inline-flex items-center justify-center font-bold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary hover:bg-primary-hover text-white",
        secondary: "bg-secondary hover:bg-secondary-hover text-white",
        danger: "bg-danger hover:bg-danger-hover text-white",
        ghost: "bg-ghost hover:bg-ghost-hover text-gray-700",
      },
      size: {
        sm: "btn-sm",
        md: "btn-md",
        lg: "btn-lg",
      },
      font: {
        display: "font-display",
        body: "font-sans",
        mono: "font-mono",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      font: "display",
    },
  },
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  href?: string;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  variant,
  size,
  font,
  href,
  className,
  children,
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const buttonClass = cn(buttonVariants({ variant, size, font, className }));

  if (href) {
    return (
      <Link href={href} className={buttonClass}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
