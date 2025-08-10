import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

// Get saved language preference from localStorage
const getSavedLanguage = () => {
  try {
    return localStorage.getItem('momentum-language') || 'en';
  } catch (error) {
    return 'en';
  }
};

// Save language preference to localStorage
const saveLanguage = (language) => {
  try {
    localStorage.setItem('momentum-language', language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      }
    },
    lng: getSavedLanguage(), // default language
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag'],

      // keys or params to lookup language from
      lookupLocalStorage: 'momentum-language',

      // cache user language on
      caches: ['localStorage'],

      // only detect languages that are in the whitelist
      checkWhitelist: true,
    },

    react: {
      useSuspense: false,
    },
  });

// Custom language change function that also saves to localStorage
export const changeLanguage = (language) => {
  saveLanguage(language);
  return i18n.changeLanguage(language);
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' }
  ];
};

export default i18n;