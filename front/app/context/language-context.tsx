'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentLocale, setCurrentLocale } from '../lib/i18n/locale-manager';
import es from '../lib/i18n/locales/es';
import en from '../lib/i18n/locales/en';
import it from '../lib/i18n/locales/it';

const dictionaries: Record<string, any> = { es, en, it };

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
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

  const changeLanguage = (newLocale: string) => {
    setLocale(newLocale);
    setCurrentLocale(newLocale);
  };

  const t = dictionaries[locale] || dictionaries['es'];

  return (
    <LanguageContext.Provider value={{ t, locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);