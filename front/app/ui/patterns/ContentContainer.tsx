import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const contentContainerVariants = cva("w-full", {
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      xl: "max-w-5xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type ContentContainerSize = VariantProps<typeof contentContainerVariants>["size"];

interface ContentContainerProps {
  children: ReactNode;
  size?: ContentContainerSize;
  className?: string;
}

export function ContentContainer({
  children,
  size = "md",
  className,
}: ContentContainerProps) {
  return (
    <div className={cn(contentContainerVariants({ size }), className)}>
      {children}
    </div>
  );
}
