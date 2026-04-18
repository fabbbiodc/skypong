"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { getCurrentLocale, setCurrentLocale } from "../lib/i18n/locale-manager";
import es from "../lib/i18n/locales/es";
import en from "../lib/i18n/locales/en";
import it from "../lib/i18n/locales/it";

const SUPPORTED_LOCALES = ["en", "es", "it"] as const;

type Locale = (typeof SUPPORTED_LOCALES)[number];
type TranslationDictionary = typeof en;

const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  es: es as TranslationDictionary,
  it: it as TranslationDictionary,
};

interface LanguageContextValue {
  t: TranslationDictionary;
  locale: Locale;
  changeLanguage: (newLocale: Locale) => void;
}

const DEFAULT_LOCALE: Locale = "en";

function toLocale(value: string): Locale {
  if (value === "es" || value === "it" || value === "en") {
    return value;
  }
  return DEFAULT_LOCALE;
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
    setLocale(toLocale(getCurrentLocale()));
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
