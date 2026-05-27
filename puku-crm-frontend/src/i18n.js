import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en/translation.json';
import translationJA from './locales/ja/translation.json';
import translationFR from './locales/fr/translation.json';
import translationZH from './locales/zh/translation.json';
import translationHI from './locales/hi/translation.json';
import translationBN from './locales/bn/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
  en: { translation: translationEN },
  ja: { translation: translationJA },
  fr: { translation: translationFR },
  zh: { translation: translationZH },
  hi: { translation: translationHI },
  bn: { translation: translationBN },
  ar: { translation: translationAR }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    }
  });

export default i18n;
