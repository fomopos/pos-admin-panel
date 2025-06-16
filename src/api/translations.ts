// Translation API service for managing translations
import { apiClient } from '../services/api';

export interface Translation {
  key: string;
  value: string;
  description?: string;
}

export interface TranslationData {
  [key: string]: any;
}

export interface TranslationResponse {
  success: boolean;
  data: TranslationData;
  message?: string;
}

export interface SaveTranslationRequest {
  language: string;
  translations: TranslationData;
}

export interface SaveTranslationResponse {
  success: boolean;
  message: string;
}

export const translationAPI = {
  /**
   * Get all translations for a specific language
   */
  async getTranslations(language: string): Promise<TranslationResponse> {
    try {
      const response = await apiClient.get(`/translations/${language}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to fetch translations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch translations');
    }
  },

  /**
   * Save translations for a specific language
   */
  async saveTranslations(request: SaveTranslationRequest): Promise<SaveTranslationResponse> {
    try {
      const response = await apiClient.put(`/translations/${request.language}`, {
        translations: request.translations
      });
      
      return {
        success: true,
        message: response.data.message || 'Translations saved successfully'
      };
    } catch (error: any) {
      console.error('Failed to save translations:', error);
      throw new Error(error.response?.data?.message || 'Failed to save translations');
    }
  },

  /**
   * Get all available languages
   */
  async getAvailableLanguages(): Promise<string[]> {
    try {
      const response = await apiClient.get('/translations/languages');
      return response.data.languages || ['en', 'es'];
    } catch (error: any) {
      console.error('Failed to fetch available languages:', error);
      // Return default languages as fallback
      return ['en', 'es'];
    }
  },

  /**
   * Create a new language translation set
   */
  async createLanguage(language: string, baseLanguage: string = 'en'): Promise<SaveTranslationResponse> {
    try {
      const response = await apiClient.post('/translations/languages', {
        language,
        baseLanguage
      });
      
      return {
        success: true,
        message: response.data.message || `Language ${language} created successfully`
      };
    } catch (error: any) {
      console.error('Failed to create language:', error);
      throw new Error(error.response?.data?.message || 'Failed to create language');
    }
  }
};