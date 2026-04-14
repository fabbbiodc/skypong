'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocale } from '../lib/i18n/locale-manager';
import es from '../lib/i18n/locales/es';
import en from '../lib/i18n/locales/en';
import it from '../lib/i18n/locales/it';

const dictionaries: Record<string, any> = { es, en, it };

export const useTranslation = () => {
  const [locale, setLocale] = useState('en');

  const checkLocale = useCallback(() => {
    const currentLocale = getCurrentLocale();
    setLocale((prevLocale) => {
      if (prevLocale !== currentLocale) {
        return currentLocale;
      }
      return prevLocale;
    });
  }, []);

  useEffect(() => {
    checkLocale();
    const interval = setInterval(checkLocale, 500);
    return () => clearInterval(interval);
  }, [checkLocale]);

  const t = dictionaries[locale] || dictionaries['es'];

  return { t, locale };
};