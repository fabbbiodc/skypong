import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const sectionVariants = cva("", {
  variants: {
    variant: {
      default: "",
      card: "bg-slate-800/10 backdrop-blur-md rounded-xl border border-slate-700/30",
      elevated: "bg-slate-800/20 backdrop-blur-md rounded-xl shadow-md",
      bordered: "bg-slate-800/20 backdrop-blur-md rounded-xl border-2 border-slate-600",
    },
    padding: {
      none: "p-0",
      sm: "p-3 md:p-4",
      md: "p-4 md:p-6",
      lg: "p-6 md:p-8",
    },
    size: {
      sm: "max-w-md",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    size: "full",
  },
});

type SectionVariant = VariantProps<typeof sectionVariants>["variant"];
type SectionPadding = VariantProps<typeof sectionVariants>["padding"];
type SectionSize = VariantProps<typeof sectionVariants>["size"];

interface SectionProps {
  variant?: SectionVariant;
  padding?: SectionPadding;
  size?: SectionSize;
  className?: string;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export function Section({
  variant = "default",
  padding = "md",
  size = "full",
  className,
  children,
  title,
  subtitle,
}: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ variant, padding, size }), className)}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
