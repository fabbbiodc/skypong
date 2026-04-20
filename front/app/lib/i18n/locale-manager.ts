import Cookies from "js-cookie";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/lib/i18n/types";

const LOCALE_COOKIE_NAME = "app_locale";

export const getCurrentLocale = (): Locale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const locale = Cookies.get(LOCALE_COOKIE_NAME);
  return locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
};

export const setCurrentLocale = (locale: Locale): void => {
  Cookies.set(LOCALE_COOKIE_NAME, locale, { expires: 365, path: "/" });
};
