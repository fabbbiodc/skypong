"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const footerVariants = cva("w-full text-center mb-2", {
  variants: {
    size: {
      compact: "text-xs",
      default: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const linkListVariants = cva(
  "flex flex-col items-center justify-center gap-2 p-3 list-none",
  {
    variants: {
      size: {
        compact: "text-xs",
        default: "text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type FooterSize = VariantProps<typeof footerVariants>["size"];

interface FooterLink {
  href: string;
  label: string;
}

interface FooterProps {
  links?: FooterLink[];
  size?: FooterSize;
  className?: string;
}

export function Footer({ links, size = "default", className }: FooterProps) {
  const { t } = useTranslation();

  const defaultLinks: FooterLink[] = [
    { href: "/privacy", label: t?.legal?.privacy || "Privacy" },
    { href: "/terms", label: t?.legal?.terms || "Terms" },
  ];

  const footerLinks = links || defaultLinks;

  return (
    <footer className={cn(footerVariants({ size }), className)}>
      <ul className={cn(linkListVariants({ size }))}>
        {footerLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-primary hover:text-primary-hover transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}
