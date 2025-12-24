
import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
}

export const LanguageToggle: React.FC<Props> = ({ lang, setLang }) => {
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-sm font-semibold backdrop-blur-sm border border-white/20 flex items-center gap-2"
    >
      <Globe className="w-4 h-4" />
      <span>{translations[lang].langToggle}</span>
      <span className="text-xs text-white/50">{lang === 'ar' ? 'EN' : 'AR'}</span>
    </button>
  );
};
