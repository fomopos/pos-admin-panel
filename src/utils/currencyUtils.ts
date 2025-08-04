import { useTenantStore } from '../tenants/tenantStore';
import { storeServices } from '../services/store';

/**
 * Currency utility functions for formatting and displaying currency values
 * based on the current store's currency setting
 */

/**
 * Get the currency symbol for a given currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const supportedCurrencies = storeServices.settings.getSupportedCurrencies();
  const currency = supportedCurrencies.find(c => c.code === currencyCode);
  return currency?.symbol || '$';
};

/**
 * Get the current store's currency symbol
 */
export const useStoreCurrencySymbol = (): string => {
  const { currentStore } = useTenantStore();
  const storeCurrency = currentStore?.currency || 'USD';
  return getCurrencySymbol(storeCurrency);
};

/**
 * Get the current store's currency code
 */
export const useStoreCurrency = (): string => {
  const { currentStore } = useTenantStore();
  return currentStore?.currency || 'USD';
};

/**
 * Format currency value with proper locale and currency symbol
 */
export const formatCurrency = (
  amount: string | number, 
  currencyCode?: string,
  locale?: string
): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Use current store currency if not provided
  const { currentStore } = useTenantStore.getState();
  const currency = currencyCode || currentStore?.currency || 'USD';
  
  // Use current store locale if not provided
  const storeLocale = locale || currentStore?.locale || 'en-US';
  
  try {
    return new Intl.NumberFormat(storeLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    // Fallback to USD formatting if there's an error
    console.warn(`Failed to format currency with ${currency}/${storeLocale}, falling back to USD`, error);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  }
};

/**
 * Format currency value with just the symbol (no Intl formatting)
 * Useful for simple display scenarios
 */
export const formatCurrencySimple = (
  amount: string | number, 
  currencyCode?: string
): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const { currentStore } = useTenantStore.getState();
  const currency = currencyCode || currentStore?.currency || 'USD';
  const symbol = getCurrencySymbol(currency);
  
  return `${symbol}${numericAmount.toFixed(2)}`;
};

/**
 * Hook to get currency formatting function bound to current store
 */
export const useCurrencyFormatter = () => {
  const { currentStore } = useTenantStore();
  const storeCurrency = currentStore?.currency || 'USD';
  const storeLocale = currentStore?.locale || 'en-US';
  
  return (amount: string | number) => formatCurrency(amount, storeCurrency, storeLocale);
};
