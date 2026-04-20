import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary hover:bg-primary-hover text-white active:bg-slate-900",
        secondary: "bg-secondary hover:bg-secondary-hover text-white",
        success: "bg-success hover:bg-success-hover text-white",
        danger: "bg-danger hover:bg-danger-hover text-white",
        ghost:
          "bg-transparent hover:bg-ghost-hover text-slate-300 border border-transparent hover:border-slate-500",
      },
      size: {
        sm: "px-3 py-1.5 text-xs sm:text-sm",
        md: "px-4 py-2 text-sm sm:text-base",
        lg: "px-6 py-3 text-base sm:text-lg",
      },
      font: {
        display: "font-display",
        body: "font-sans",
        mono: "font-mono",
      },
      state: {
        default: "",
        hover: "hover:scale-105 active:scale-95",
        active: "active:scale-95",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none",
      },
    },
    compoundVariants: [
      {
        state: "disabled",
        className: "opacity-50 cursor-not-allowed pointer-events-none",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      font: "display",
      state: "default",
    },
  },
);

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];
type ButtonFont = VariantProps<typeof buttonVariants>["font"];
type ButtonState = VariantProps<typeof buttonVariants>["state"];

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  font?: ButtonFont;
  state?: ButtonState;
  href?: string;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  font = "display",
  state = "default",
  href,
  className,
  children,
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const buttonClass = cn(
    buttonVariants({ variant, size, font, state }),
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className,
  );

  if (href && !disabled) {
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
