import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources from new directory structure
import enTranslations from '../locales/en/translation.json';
import esTranslations from '../locales/es/translation.json';
import hiTranslations from '../locales/hi/translation.json';
import arTranslations from '../locales/ar/translation.json';
import deTranslations from '../locales/de/translation.json';
import skTranslations from '../locales/sk/translation.json';

// Resources object with all supported languages
const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  },
  hi: {
    translation: hiTranslations
  },
  ar: {
    translation: arTranslations
  },
  de: {
    translation: deTranslations
  },
  sk: {
    translation: skTranslations
  }
};

// RTL language detection
export const RTL_LANGUAGES = ['ar'];

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

// Language information
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  de: { name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  sk: { name: 'Slovak', nativeName: 'Slovenčina', direction: 'ltr' }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    
    // Supported languages
    supportedLngs: ['en', 'es', 'hi', 'ar', 'de', 'sk'],
    
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
    
    // Enhanced fallback behavior
    fallbackLng: {
      'ar': ['en'], // Arabic falls back to English
      'hi': ['en'], // Hindi falls back to English
      'de': ['en'], // German falls back to English
      'sk': ['en'], // Slovak falls back to English
      'es': ['en'], // Spanish falls back to English
      'default': ['en']
    },
    
    // Use JSON resources
    resources,
  });

// Listen for language changes to update document direction
i18n.on('languageChanged', (lng) => {
  document.dir = isRTL(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Function to load translations dynamically (enhanced for future use)
export async function loadTranslations(language: string) {
  try {
    // Check if language is supported
    if (!Object.keys(SUPPORTED_LANGUAGES).includes(language)) {
      console.warn(`Language ${language} is not supported, falling back to English`);
      language = 'en';
    }

    // For future API integration
    const response = await fetch(`/api/translations/${language}`);
    
    if (response.ok) {
      const translations = await response.json();
      i18n.addResourceBundle(language, 'translation', translations, true, true);
    }
    
    await i18n.changeLanguage(language);
    
    // Update document direction for RTL languages
    document.dir = isRTL(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
  } catch (error) {
    console.warn(`Failed to load dynamic translations for ${language}:`, error);
    // Fallback to existing translations
    await i18n.changeLanguage(language);
    
    // Still update document direction and language
    document.dir = isRTL(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }
}

export default i18n;