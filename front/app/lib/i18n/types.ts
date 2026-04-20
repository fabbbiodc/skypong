export const SUPPORTED_LOCALES = ["en", "es", "it"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: string): value is Locale => {
  return SUPPORTED_LOCALES.includes(value as Locale);
};
