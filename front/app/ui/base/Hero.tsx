"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { BallCTA } from "./BallCTA";

const heroVariants = cva(
  "mb-2 flex flex-col items-center justify-center gap-2 overflow-hidden",
  {
    variants: {
      alignment: {
        center: "text-center",
        left: "text-left",
      },
    },
    defaultVariants: {
      alignment: "center",
    },
  },
);

const titleVariants = cva("font-display font-bold text-white opacity-50", {
  variants: {
    size: {
      sm: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
      md: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
      lg: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type HeroAlignment = VariantProps<typeof heroVariants>["alignment"];
type TitleSize = VariantProps<typeof titleVariants>["size"];

interface HeroProps {
  alignment?: HeroAlignment;
  titleSize?: TitleSize;
  ballSize?: "sm" | "md" | "lg";
  className?: string;
  onReady?: () => void;
}

export function Hero({
  alignment = "center",
  titleSize = "md",
  ballSize = "sm",
  className,
  onReady,
}: HeroProps) {
  return (
    <section className={cn(heroVariants({ alignment }), className)}>
      <div>
        <h1 className={cn(titleVariants({ size: titleSize }), "mb-0")}>
          SKYPONG
        </h1>
      </div>
      <div>
        <BallCTA size={ballSize} onReady={onReady} />
      </div>
    </section>
  );
}