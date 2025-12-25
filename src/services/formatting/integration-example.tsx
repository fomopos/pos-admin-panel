/**
 * Formatting Service Integration Example
 * 
 * This file demonstrates how to integrate the formatting service
 * with your application's i18n and tenant management systems.
 * 
 * Add this code to your App.tsx or main application component.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenantStore } from '../../tenants/tenantStore';
import { formattingService } from './index';

/**
 * Hook to synchronize formatting service with app state
 */
export const useFormattingSync = () => {
  const { i18n } = useTranslation();
  const { currentStore } = useTenantStore();

  // Sync locale with i18n language
  useEffect(() => {
    const locale = i18n.language;
    formattingService.setDefaultLocale(locale);
    console.log('🌍 Formatting Service: Updated locale to', locale);
  }, [i18n.language]);

  // Sync currency with current store
  useEffect(() => {
    if (currentStore?.currency) {
      formattingService.setDefaultCurrency(currentStore.currency);
      console.log('💰 Formatting Service: Updated currency to', currentStore.currency);
    }
  }, [currentStore]);

  // Set time format based on locale (customize as needed)
  useEffect(() => {
    const locale = i18n.language;
    // Use 24h format for European locales, 12h for others
    const timeFormat = ['de', 'es', 'fr'].includes(locale) ? '24h' : '12h';
    formattingService.setDefaultTimeFormat(timeFormat);
    console.log('⏰ Formatting Service: Updated time format to', timeFormat);
  }, [i18n.language]);
};

/**
 * Example: Using in App.tsx
 * 
 * import { useFormattingSync } from './hooks/useFormattingSync';
 * 
 * function App() {
 *   useFormattingSync();
 *   
 *   return (
 *     <div className="app">
 *       {/* Your app content *\/}
 *     </div>
 *   );
 * }
 */

/**
 * Example: Manual initialization (if not using the hook)
 */
export const initializeFormattingService = (locale: string, currency: string, timeFormat: '12h' | '24h' = '12h') => {
  formattingService.setDefaultLocale(locale);
  formattingService.setDefaultCurrency(currency);
  formattingService.setDefaultTimeFormat(timeFormat);
  
  console.log('✅ Formatting Service initialized:', { locale, currency, timeFormat });
};

/**
 * Locale to time format mapping
 */
export const getTimeFormatForLocale = (locale: string): '12h' | '24h' => {
  const use24Hour = [
    'de', 'de-DE',  // German
    'es', 'es-ES',  // Spanish
    'fr', 'fr-FR',  // French
    'it', 'it-IT',  // Italian
    'nl', 'nl-NL',  // Dutch
    'pt', 'pt-PT',  // Portuguese
    'sk', 'sk-SK',  // Slovak
    'hi', 'hi-IN'   // Hindi
  ];
  
  return use24Hour.some(l => locale.startsWith(l)) ? '24h' : '12h';
};

/**
 * Example usage in component
 */
export const ExampleUsage = () => {
  // Import the formatting service
  // import { formattingService } from '../services/formatting';
  
  const sampleData = {
    date: '2025-11-05T14:30:00Z',
    amount: 1234.56,
    currency: 'INR',
    count: 1234567,
    percentage: 0.1523,
    fileSize: 1536000,
    duration: 3665,
    phone: '5551234567'
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Formatting Service Examples</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Date Formatting</h3>
        <p>Short: {formattingService.formatDate(sampleData.date, 'short')}</p>
        <p>Medium: {formattingService.formatDate(sampleData.date, 'medium')}</p>
        <p>Long: {formattingService.formatDate(sampleData.date, 'long')}</p>
        <p>DateTime: {formattingService.formatDate(sampleData.date, 'datetime-short')}</p>
        <p>Relative: {formattingService.formatRelativeTime(sampleData.date)}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Currency Formatting</h3>
        <p>Standard: {formattingService.formatCurrency(sampleData.amount, { currency: sampleData.currency })}</p>
        <p>Compact: {formattingService.formatCurrency(sampleData.amount, { currency: sampleData.currency, compact: true })}</p>
        <p>No Symbol: {formattingService.formatCurrency(sampleData.amount, { showSymbol: false })}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Number Formatting</h3>
        <p>Standard: {formattingService.formatNumber(sampleData.count)}</p>
        <p>Compact: {formattingService.formatNumber(sampleData.count, { compact: true })}</p>
        <p>Percentage: {formattingService.formatPercentage(sampleData.percentage)}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Other Formats</h3>
        <p>File Size: {formattingService.formatFileSize(sampleData.fileSize)}</p>
        <p>Duration: {formattingService.formatDuration(sampleData.duration)}</p>
        <p>Phone: {formattingService.formatPhoneNumber(sampleData.phone, 'national')}</p>
      </div>
    </div>
  );
};
