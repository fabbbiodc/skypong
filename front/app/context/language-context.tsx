"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { Locale } from "@/lib/i18n/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";
import type { TranslationDictionary } from "@/lib/types/translation";
import { getCurrentLocale, setCurrentLocale } from "../lib/i18n/locale-manager";
import es from "../lib/i18n/locales/es";
import en from "../lib/i18n/locales/en";
import it from "../lib/i18n/locales/it";

const dictionaries = {
  en,
  es,
  it,
} satisfies Record<Locale, TranslationDictionary>;

interface LanguageContextValue {
  t: TranslationDictionary;
  locale: Locale;
  changeLanguage: (newLocale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(getCurrentLocale());
  }, []);

  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    setCurrentLocale(newLocale);
  };

  const t = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];

  return (
    <LanguageContext.Provider value={{ t, locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
};
