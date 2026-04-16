"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { Button } from "./Button";

const languageSelectorVariants = cva("flex gap-4", {
  variants: {
    layout: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    layout: "horizontal",
  },
});

type Layout = VariantProps<typeof languageSelectorVariants>["layout"];

interface LanguageSelectorProps {
  layout?: Layout;
  className?: string;
}

const languages = [
  { code: "es", label: "ESP" },
  { code: "en", label: "ENG" },
  { code: "it", label: "ITA" },
];

export function LanguageSelector({
  layout = "horizontal",
  className,
}: LanguageSelectorProps) {
  const { changeLanguage, locale } = useLanguage();

  return (
    <nav className={cn(languageSelectorVariants({ layout }), className)}>
      {languages.map((lang) => (
        <Button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          variant={locale === lang.code ? "primary" : "ghost"}
          size="sm"
        >
          {lang.label}
        </Button>
      ))}
    </nav>
  );
}
