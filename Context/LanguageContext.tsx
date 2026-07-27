'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translation files
import arTranslations from '@/locales/ar.json';
import frTranslations from '@/locales/fr.json';
import enTranslations from '@/locales/en.json';

type Language = 'ar' | 'fr' | 'en';

type Translations = typeof arTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  ar: arTranslations,
  fr: frTranslations,
  en: enTranslations,
};

// Detect browser language
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'fr'; // Default for SSR
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for exact matches or language prefixes
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('ar')) return 'ar';
  if (browserLang.startsWith('en')) return 'en';
  
  // Default to French
  return 'fr';
};

// Get stored language or detect browser language
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'fr';
  
  const stored = localStorage.getItem('obd-language') as Language;
  if (stored && ['ar', 'fr', 'en'].includes(stored)) {
    return stored;
  }
  
  return detectBrowserLanguage();
};

export const LanguageProvider = ({ children, initialLanguage }: { children: ReactNode; initialLanguage?: Language }) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage || 'fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('obd-language') as Language;
      if (stored && ['ar', 'fr', 'en'].includes(stored)) {
        if (stored !== language) {
          setLanguageState(stored);
        }
      } else {
        const detected = detectBrowserLanguage();
        if (detected !== language) {
          setLanguageState(detected);
        }
        localStorage.setItem('obd-language', detected);
        document.cookie = `obd-language=${detected}; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('obd-language', lang);
      // Set cookie for server-side access (expires in 1 year)
      document.cookie = `obd-language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      // Update document direction
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Update document direction when language changes
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, dir, mounted]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
