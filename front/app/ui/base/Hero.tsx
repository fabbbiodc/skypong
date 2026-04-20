"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const heroVariants = cva(
  "mb-8 flex flex-col items-center justify-center gap-8",
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

const iconVariants = cva(
  "text-primary transition-all duration-300 hover:text-primary-hover hover:scale-110",
  {
    variants: {
      size: {
        sm: "text-5xl",
        md: "text-6xl",
        lg: "text-7xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type HeroAlignment = VariantProps<typeof heroVariants>["alignment"];
type TitleSize = VariantProps<typeof titleVariants>["size"];
type IconSize = VariantProps<typeof iconVariants>["size"];

interface HeroProps {
  alignment?: HeroAlignment;
  titleSize?: TitleSize;
  iconSize?: IconSize;
  className?: string;
}

export function Hero({
  alignment = "center",
  titleSize = "md",
  iconSize = "md",
  className,
}: HeroProps) {
  const { t } = useTranslation();

  return (
    <section className={cn(heroVariants({ alignment }), className)}>
      <div>
        <h1 className={cn(titleVariants({ size: titleSize }), "mb-4")}>
          SKYPONG
        </h1>
      </div>
      <div>
        <Link
          href="/play"
          aria-label="Play game"
          className={iconVariants({ size: iconSize })}
        >
          ▶
        </Link>
      </div>
    </section>
  );
}
