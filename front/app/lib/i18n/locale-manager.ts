import Cookies from "js-cookie";

const LOCALE_COOKIE_NAME = "app_locale";
const DEFAULT_LOCALE = "en";

export const getCurrentLocale = (): string => {
  // Verificamos si estamos en el navegador
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  return Cookies.get(LOCALE_COOKIE_NAME) || DEFAULT_LOCALE;
};

export const setCurrentLocale = (locale: string): void => {
  // Guardamos en cookie (expira en 365 días)
  Cookies.set(LOCALE_COOKIE_NAME, locale, { expires: 365, path: "/" });
};
