
import { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language } from '../types';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('ar');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    // Update direction when language changes
    const newDirection = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    
    // Update root attributes
    document.documentElement.dir = newDirection;
    document.documentElement.lang = language;
    
    // Toggle tailwind classes
    document.documentElement.classList.toggle('rtl', newDirection === 'rtl');
    document.documentElement.classList.toggle('ltr', newDirection === 'ltr');
    
    // Set Cairo font for Arabic
    if (language === 'ar') {
      document.body.style.fontFamily = "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
    } else {
      document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
    }
  }, [language]);

  const t = (key: keyof typeof translations.ar) => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
      return key as string;
    }
    return translation;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const setLanguageExplicitly = (lang: Language) => {
    setLanguage(lang);
  };

  return { 
    t, 
    language, 
    direction,
    toggleLanguage,
    setLanguage: setLanguageExplicitly
  };
};
