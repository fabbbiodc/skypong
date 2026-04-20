"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { BallCTA } from "./BallCTA";

const heroVariants = cva(
  "mb-4 flex flex-col items-center justify-center gap-4",
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
      sm: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
      md: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
      lg: "text-6xl sm:text-7xl md:text-8xl lg:text-9xl",
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
}

export function Hero({
  alignment = "center",
  titleSize = "md",
  ballSize = "md",
  className,
}: HeroProps) {
  return (
    <section className={cn(heroVariants({ alignment }), className)}>
      <div>
        <h1 className={cn(titleVariants({ size: titleSize }), "mb-2")}>
          SKYPONG
        </h1>
      </div>
      <div>
        <BallCTA size={ballSize} />
      </div>
    </section>
  );
}