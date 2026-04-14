import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center font-medium rounded-full transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-chip-default)] text-[var(--color-chip-default-text)]",
        success:
          "bg-[var(--color-chip-success)] text-[var(--color-chip-success-text)]",
        warning:
          "bg-[var(--color-chip-warning)] text-[var(--color-chip-warning-text)]",
        error:
          "bg-[var(--color-chip-error)] text-[var(--color-chip-error-text)]",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
      },
      state: {
        default: "",
        outline: "border border-current",
        subtle: "opacity-75",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  },
);

type ChipVariant = VariantProps<typeof chipVariants>["variant"];
type ChipSize = VariantProps<typeof chipVariants>["size"];
type ChipState = VariantProps<typeof chipVariants>["state"];

interface ChipProps {
  variant?: ChipVariant;
  size?: ChipSize;
  state?: ChipState;
  className?: string;
  children: React.ReactNode;
}

export function Chip({
  variant = "default",
  size = "md",
  state = "default",
  className,
  children,
}: ChipProps) {
  return (
    <span className={cn(chipVariants({ variant, size, state }), className)}>
      {children}
    </span>
  );
}
