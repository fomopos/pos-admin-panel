import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

// Resources object
const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    // Enable nested key support
    keySeparator: '.',
    nsSeparator: ':',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    // Use JSON resources
    resources,
  });

// Function to load translations dynamically (optional for future use)
export async function loadTranslations(language: string) {
  try {
    // For future API integration
    const response = await fetch(`/api/translations/${language}`);
    
    if (response.ok) {
      const translations = await response.json();
      i18n.addResourceBundle(language, 'translation', translations, true, true);
    }
    
    await i18n.changeLanguage(language);
  } catch (error) {
    console.warn(`Failed to load dynamic translations for ${language}:`, error);
    // Fallback to existing translations
    await i18n.changeLanguage(language);
  }
}

export default i18n;