import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const listRowVariants = cva(
  "flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 border-transparent bg-white transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        highlighted: "bg-purple-50 border-primary",
        success: "bg-green-50 border-green-500",
        warning: "bg-amber-50 border-amber-500",
        danger: "bg-red-50 border-red-500",
      },
      size: {
        sm: "p-2 py-2 text-sm",
        md: "p-3 py-3 text-base",
        lg: "p-4 py-4 text-lg",
      },
      state: {
        default: "",
        hover: "hover:border-primary hover:shadow-md cursor-pointer",
        active: "active:scale-[0.98]",
        disabled: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  },
);

type ListRowVariant = VariantProps<typeof listRowVariants>["variant"];
type ListRowSize = VariantProps<typeof listRowVariants>["size"];
type ListRowState = VariantProps<typeof listRowVariants>["state"];

interface ListRowProps {
  variant?: ListRowVariant;
  size?: ListRowSize;
  state?: ListRowState;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function ListRow({
  variant = "default",
  size = "md",
  state = "default",
  className,
  children,
  onClick,
}: ListRowProps) {
  const stateWithClick: ListRowState = onClick ? "hover" : state;

  return (
    <div
      className={cn(
        listRowVariants({ variant, size, state: stateWithClick }),
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
