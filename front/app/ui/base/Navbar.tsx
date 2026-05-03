"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "./Button";
import { backgrounds } from "@/lib/design-tokens";
import { useState, useRef, useEffect } from "react";

const navbarVariants = cva(
  "fixed top-4 left-4 right-4 z-50 flex items-center justify-between mx-auto px-8 py-4 rounded-full shadow-none max-w-[1200px] transition-transform duration-300",
  {
    variants: {
      visibility: {
        visible: "translate-y-0",
        hidden: "-translate-y-full",
      },
      background: {
        main: backgrounds.main,
        transparent: backgrounds.transparent,
      },
    },
    defaultVariants: {
      visibility: "visible",
      background: "main",
    },
  },
);

type NavbarVisibility = VariantProps<typeof navbarVariants>["visibility"];

interface NavbarProps {
  className?: string;
  background?: "main" | "transparent";
}

export function Navbar({ className, background = "main" }: NavbarProps) {
  const { t } = useTranslation();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
            setIsNavVisible(true);
          } else if (
            currentScrollY > lastScrollY.current &&
            currentScrollY > 50
          ) {
            setIsNavVisible(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navVisibility: NavbarVisibility = isNavVisible ? "visible" : "hidden";

  return (
    <nav
      className={cn(
        navbarVariants({ visibility: navVisibility, background }),
        className,
      )}
    >
      <Link href="/" className="skypong-logo">
        SKYPONG
      </Link>

      <div className="flex items-center gap-3">
        <Button href="/game-mode" variant="primary" size="md">
          {t?.navigation?.play || "Play"}
        </Button>
      </div>
    </nav>
  );
}
