import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LanguageIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BookOpenIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { translationAPI, type TranslationData } from '../api/translations';

// Import local translations as fallback
import enTranslations from '../locales/en/translation.json';
import esTranslations from '../locales/es/translation.json';

interface TranslationItem {
  key: string;
  values: Record<string, string>; // Multi-language values
  isEditing: boolean;
  originalValues: Record<string, string>; // Multi-language original values
  isNested?: boolean;
  level?: number;
}

interface LanguageStats {
  total: number;
  modified: number;
  empty: number;
}

interface MultiLanguageTranslations {
  [language: string]: TranslationData;
}

const TranslationManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'es']); // Multiple languages
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en', 'es']);
  const [translations, setTranslations] = useState<MultiLanguageTranslations>({});
  const [flatTranslations, setFlatTranslations] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['categories', 'nav', 'common']));
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Language display names
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    ja: '日本語',
    ko: '한국어',
    zh: '中文'
  };

  const languageFlags: Record<string, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    it: '🇮🇹',
    pt: '🇵🇹',
    ja: '🇯🇵',
    ko: '🇰🇷',
    zh: '🇨🇳'
  };

  // Load local translations as fallback for multiple languages
  const getLocalTranslations = (language: string): TranslationData => {
    switch (language) {
      case 'es':
        return esTranslations;
      case 'en':
      default:
        return enTranslations;
    }
  };

  // Flatten nested object into dot notation for multiple languages
  const flattenTranslations = (multiLangObj: MultiLanguageTranslations): TranslationItem[] => {
    const items: TranslationItem[] = [];
    const languages = Object.keys(multiLangObj);
    
    if (languages.length === 0) return items;
    
    // Get all keys from the first language
    const baseLanguage = languages[0];
    const baseTranslations = multiLangObj[baseLanguage];
    
    const processObject = (obj: any, prefix = '', level = 0) => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Add section header
          items.push({
            key: fullKey,
            values: {},
            originalValues: {},
            isEditing: false,
            isNested: true,
            level
          });
          
          // Add nested items
          processObject(value, fullKey, level + 1);
        } else {
          // Collect values from all languages for this key
          const values: Record<string, string> = {};
          const originalValues: Record<string, string> = {};
          
          languages.forEach(lang => {
            const langValue = getNestedValue(multiLangObj[lang], fullKey);
            values[lang] = String(langValue || '');
            originalValues[lang] = String(langValue || '');
          });
          
          items.push({
            key: fullKey,
            values,
            originalValues,
            isEditing: false,
            level
          });
        }
      });
    };
    
    processObject(baseTranslations);
    return items;
  };

  // Helper function to get nested value by dot notation
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Convert flat translations back to nested object for multiple languages
  const unflattenTranslations = (items: TranslationItem[]): MultiLanguageTranslations => {
    const result: MultiLanguageTranslations = {};
    
    // Initialize result for each language
    selectedLanguages.forEach(lang => {
      result[lang] = {};
    });
    
    items.filter(item => !item.isNested).forEach(item => {
      const keys = item.key.split('.');
      
      selectedLanguages.forEach(lang => {
        let current = result[lang];
        
        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            current[key] = item.values[lang] || '';
          } else {
            if (!current[key]) {
              current[key] = {};
            }
            current = current[key];
          }
        });
      });
    });
    
    return result;
  };

  // Load translations for multiple languages
  const loadTranslations = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const multiLangTranslations: MultiLanguageTranslations = {};
      
      // Load translations for each selected language
      for (const language of selectedLanguages) {
        try {
          const response = await translationAPI.getTranslations(language);
          multiLangTranslations[language] = response.data;
        } catch (apiError) {
          // Fallback to local translations
          console.warn(`API not available for ${language}, using local translations`);
          const localTranslations = getLocalTranslations(language);
          multiLangTranslations[language] = localTranslations;
        }
      }
      
      setTranslations(multiLangTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load translations. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load available languages
  const loadAvailableLanguages = async () => {
    try {
      const languages = await translationAPI.getAvailableLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      console.warn('Failed to load available languages, using defaults');
      setAvailableLanguages(['en', 'es']);
    }
  };

  // Save translations for all selected languages
  const saveTranslations = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const multiLangData = unflattenTranslations(flatTranslations);
      
      // Save each language separately
      for (const language of selectedLanguages) {
        await translationAPI.saveTranslations({
          language,
          translations: multiLangData[language]
        });
        
        // Update i18n if current language was modified
        if (language === i18n.language) {
          i18n.addResourceBundle(language, 'translation', multiLangData[language], true, true);
        }
      }
      
      setHasChanges(false);
      
      setMessage({
        type: 'success',
        text: `Translations for ${selectedLanguages.map(lang => languageNames[lang] || lang).join(', ')} saved successfully!`
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to save translations. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle translation value change for a specific language
  const updateTranslation = (index: number, language: string, newValue: string) => {
    const updated = [...flatTranslations];
    updated[index] = { 
      ...updated[index], 
      values: { ...updated[index].values, [language]: newValue }
    };
    setFlatTranslations(updated);
    
    // Check if there are changes in any language
    const hasAnyChanges = updated.some(item => {
      if (item.isNested) return false;
      return selectedLanguages.some(lang => 
        item.values[lang] !== item.originalValues[lang]
      );
    });
    setHasChanges(hasAnyChanges);
  };

  // Toggle edit mode
  const toggleEdit = (index: number) => {
    const updated = [...flatTranslations];
    updated[index] = { ...updated[index], isEditing: !updated[index].isEditing };
    setFlatTranslations(updated);
  };

  // Cancel edit
  const cancelEdit = (index: number) => {
    const updated = [...flatTranslations];
    updated[index] = {
      ...updated[index],
      values: { ...updated[index].originalValues },
      isEditing: false
    };
    setFlatTranslations(updated);
  };

  // Toggle section expansion
  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  // Get section from key
  const getSection = (key: string) => {
    return key.split('.')[0];
  };

  // Check if section is expanded
  const isSectionExpanded = (key: string) => {
    const section = getSection(key);
    return expandedSections.has(section);
  };

  // Filter translations based on search
  const filteredTranslations = flatTranslations.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const keyMatches = item.key.toLowerCase().includes(searchLower);
    const valueMatches = selectedLanguages.some(lang => 
      item.values[lang]?.toLowerCase().includes(searchLower)
    );
    
    return keyMatches || valueMatches;
  });

  // Calculate statistics
  const calculateStats = (): LanguageStats => {
    const valueItems = flatTranslations.filter(item => !item.isNested);
    
    return {
      total: valueItems.length,
      modified: valueItems.filter(item => 
        selectedLanguages.some(lang => 
          item.values[lang] !== item.originalValues[lang]
        )
      ).length,
      empty: valueItems.filter(item => 
        selectedLanguages.some(lang => 
          !item.values[lang]?.trim()
        )
      ).length
    };
  };

  const stats = calculateStats();

  // Initialize
  useEffect(() => {
    loadAvailableLanguages();
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [selectedLanguages]);

  useEffect(() => {
    if (Object.keys(translations).length > 0) {
      const flattened = flattenTranslations(translations);
      setFlatTranslations(flattened);
    }
  }, [translations]);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <LanguageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
                <p className="text-gray-600 mt-1">Manage and edit application translations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadTranslations()}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={saveTranslations}
                disabled={saving || !hasChanges}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Language Selection & Stats */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Languages to Edit
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => (
                    <label key={lang} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLanguages([...selectedLanguages, lang]);
                          } else {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {languageFlags[lang]} {languageNames[lang] || lang.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{stats.total}</span> total
                </span>
              </div>
              
              {stats.modified > 0 && (
                <div className="flex items-center space-x-2">
                  <PencilIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-blue-600">
                    <span className="font-medium">{stats.modified}</span> modified
                  </span>
                </div>
              )}
              
              {stats.empty > 0 && (
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                  <span className="text-sm text-amber-600">
                    <span className="font-medium">{stats.empty}</span> empty
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search translations by key or value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Translations */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading translations...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTranslations.map((item, index) => {
              const section = getSection(item.key);
              const isExpanded = isSectionExpanded(item.key);
              
              if (item.isNested) {
                return (
                  <div key={item.key} className="bg-gray-50 px-6 py-3">
                    <button
                      onClick={() => toggleSection(section)}
                      className="flex items-center space-x-2 text-left w-full"
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      )}
                      <KeyIcon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900 capitalize">
                        {item.key.replace(/\./g, ' › ')}
                      </span>
                    </button>
                  </div>
                );
              }
              
              if (!isExpanded && item.level! > 0) {
                return null;
              }
              
              return (
                <div key={item.key} className="px-6 py-4 hover:bg-gray-50">
                  <div className="space-y-4">
                    {/* Translation Key and Status */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {item.key}
                      </span>
                      {selectedLanguages.some(lang => 
                        item.values[lang] !== item.originalValues[lang]
                      ) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Modified
                        </span>
                      )}
                      {selectedLanguages.some(lang => 
                        !item.values[lang]?.trim()
                      ) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Empty
                        </span>
                      )}
                    </div>
                    
                    {/* Multi-Language Values */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedLanguages.length}, 1fr)` }}>
                      {selectedLanguages.map((language) => (
                        <div key={language} className="space-y-2">
                          {/* Language Header */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              {languageFlags[language]} {languageNames[language] || language}
                            </span>
                            {item.values[language] !== item.originalValues[language] && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Modified
                              </span>
                            )}
                            {!item.values[language]?.trim() && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Empty
                              </span>
                            )}
                          </div>
                          
                          {/* Translation Value */}
                          {item.isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={item.values[language] || ''}
                                onChange={(e) => updateTranslation(index, language, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                rows={Math.max(1, Math.ceil((item.values[language]?.length || 0) / 50))}
                                placeholder={`Enter ${languageNames[language]} translation...`}
                              />
                            </div>
                          ) : (
                            <div
                              className="text-sm text-gray-900 p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 min-h-[40px] flex items-center"
                              onClick={() => toggleEdit(index)}
                            >
                              {item.values[language] || (
                                <span className="text-gray-400 italic">Click to add {languageNames[language]} translation</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Edit Controls */}
                    {item.isEditing && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => toggleEdit(index)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Save All
                        </button>
                        <button
                          onClick={() => cancelEdit(index)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {/* Edit Button when not editing */}
                    {!item.isEditing && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleEdit(index)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredTranslations.length === 0 && (
              <div className="p-8 text-center">
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No translations found matching your search.' : 'No translations found.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationManagement;
