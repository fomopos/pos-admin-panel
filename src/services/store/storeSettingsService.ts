import type {
  SupportedCurrency,
  SupportedTimezone,
  BusinessHours
} from '../types/store.types';

/**
 * Store Settings Helper Service
 * 
 * NOTE: The store settings API (/v0/store/{store_id}/settings) is not yet implemented.
 * This service now only provides helper methods for supported currencies, timezones, etc.
 * When the API is implemented, add the API methods back here.
 */
export class StoreSettingsService {
  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Array<{ code: SupportedCurrency; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
    ];
  }

  /**
   * Get supported timezones
   */
  getSupportedTimezones(): Array<{ code: SupportedTimezone; name: string; offset: string }> {
    return [
      { code: 'America/New_York', name: 'Eastern Time (US)', offset: 'UTC-5/-4' },
      { code: 'America/Chicago', name: 'Central Time (US)', offset: 'UTC-6/-5' },
      { code: 'America/Denver', name: 'Mountain Time (US)', offset: 'UTC-7/-6' },
      { code: 'America/Los_Angeles', name: 'Pacific Time (US)', offset: 'UTC-8/-7' },
      { code: 'Europe/London', name: 'Greenwich Mean Time', offset: 'UTC+0/+1' },
      { code: 'Europe/Paris', name: 'Central European Time', offset: 'UTC+1/+2' },
      { code: 'Europe/Berlin', name: 'Central European Time', offset: 'UTC+1/+2' },
      { code: 'Asia/Dubai', name: 'Gulf Standard Time', offset: 'UTC+4' },
      { code: 'Asia/Kolkata', name: 'India Standard Time', offset: 'UTC+5:30' },
      { code: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+9' },
      { code: 'Asia/Shanghai', name: 'China Standard Time', offset: 'UTC+8' },
      { code: 'Australia/Sydney', name: 'Australian Eastern Time', offset: 'UTC+10/+11' }
    ];
  }

  /**
   * Get default business hours
   */
  getDefaultBusinessHours(): BusinessHours[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      is_open: !['Saturday', 'Sunday'].includes(day),
      open_time: '09:00',
      close_time: '18:00'
    }));
  }
}

// Create and export a singleton instance
export const storeSettingsService = new StoreSettingsService();
