/**
 * Formatting Service
 * Centralized service for all data formatting operations across the application
 * 
 * Features:
 * - Date and time formatting with multiple presets
 * - Currency formatting with locale support
 * - Number formatting with various options
 * - Percentage formatting
 * - Phone number formatting
 * - File size formatting
 * - Distance/duration formatting
 */

import type {
  DateFormatType,
  TimeFormatType,
  CurrencyFormatOptions,
  NumberFormatOptions,
  CustomDateFormatOptions,
  PercentageFormatOptions,
  PhoneFormatType
} from './types';

class FormattingService {
  private defaultLocale: string = 'en-US';
  private defaultCurrency: string = 'USD';
  private defaultTimeFormat: TimeFormatType = '12h';

  /**
   * Set default locale for all formatting operations
   */
  setDefaultLocale(locale: string): void {
    this.defaultLocale = locale;
  }

  /**
   * Set default currency for currency formatting
   */
  setDefaultCurrency(currency: string): void {
    this.defaultCurrency = currency;
  }

  /**
   * Set default time format (12h or 24h)
   */
  setDefaultTimeFormat(format: TimeFormatType): void {
    this.defaultTimeFormat = format;
  }

  /**
   * Format date with predefined formats
   * 
   * @example
   * formatDate('2025-11-05T14:30:00Z', 'medium') // "Nov 5, 2025"
   * formatDate('2025-11-05T14:30:00Z', 'datetime-short') // "Nov 5, 2025, 2:30 PM"
   */
  formatDate(
    dateInput: string | Date | number,
    format: DateFormatType = 'medium',
    customOptions?: CustomDateFormatOptions
  ): string {
    const date = this.parseDate(dateInput);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const locale = customOptions?.locale || this.defaultLocale;

    switch (format) {
      case 'short':
        return new Intl.DateTimeFormat(locale, {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        }).format(date);

      case 'medium':
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);

      case 'long':
        return new Intl.DateTimeFormat(locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).format(date);

      case 'full':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).format(date);

      case 'iso':
        return date.toISOString().split('T')[0];

      case 'time':
        return new Intl.DateTimeFormat(locale, {
          hour: 'numeric',
          minute: '2-digit',
          hour12: this.defaultTimeFormat === '12h'
        }).format(date);

      case 'datetime-short':
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: this.defaultTimeFormat === '12h'
        }).format(date);

      case 'datetime-medium':
        return new Intl.DateTimeFormat(locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: this.defaultTimeFormat === '12h'
        }).format(date);

      case 'datetime-long':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: this.defaultTimeFormat === '12h'
        }).format(date);

      case 'custom':
        if (customOptions) {
          return new Intl.DateTimeFormat(locale, customOptions).format(date);
        }
        return this.formatDate(dateInput, 'medium');

      default:
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
    }
  }

  /**
   * Format date and time separately
   * Returns { date: string, time: string }
   * 
   * @example
   * formatDateTimeSeparate('2025-11-05T14:30:00Z')
   * // { date: "Nov 5, 2025", time: "2:30 PM" }
   */
  formatDateTimeSeparate(
    dateInput: string | Date | number,
    dateFormat: DateFormatType = 'medium',
    timeFormat: TimeFormatType = this.defaultTimeFormat
  ): { date: string; time: string } {
    const date = this.parseDate(dateInput);
    if (!date || isNaN(date.getTime())) {
      return { date: 'Invalid Date', time: '' };
    }

    const dateStr = this.formatDate(date, dateFormat);
    const timeStr = new Intl.DateTimeFormat(this.defaultLocale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h'
    }).format(date);

    return { date: dateStr, time: timeStr };
  }

  /**
   * Format currency with locale and currency support
   * 
   * @example
   * formatCurrency(1234.56, { currency: 'USD' }) // "$1,234.56"
   * formatCurrency(1234.56, { currency: 'INR' }) // "₹1,234.56"
   * formatCurrency(1234.56, { compact: true }) // "$1.2K"
   */
  formatCurrency(
    amount: number | string,
    options: CurrencyFormatOptions = {}
  ): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
      return 'Invalid Amount';
    }

    const {
      currency = this.defaultCurrency,
      locale = this.defaultLocale,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      showSymbol = true,
      compact = false
    } = options;

    const formatOptions: Intl.NumberFormatOptions = {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits
    };

    if (compact) {
      formatOptions.notation = 'compact';
      formatOptions.compactDisplay = 'short';
    }

    return new Intl.NumberFormat(locale, formatOptions).format(numericAmount);
  }

  /**
   * Format number with grouping and decimal options
   * 
   * @example
   * formatNumber(1234567.89) // "1,234,567.89"
   * formatNumber(1234567.89, { compact: true }) // "1.2M"
   */
  formatNumber(
    value: number | string,
    options: NumberFormatOptions = {}
  ): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
      return 'Invalid Number';
    }

    const {
      locale = this.defaultLocale,
      minimumFractionDigits = 0,
      maximumFractionDigits = 2,
      useGrouping = true,
      compact = false
    } = options;

    const formatOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping
    };

    if (compact) {
      formatOptions.notation = 'compact';
      formatOptions.compactDisplay = 'short';
    }

    return new Intl.NumberFormat(locale, formatOptions).format(numericValue);
  }

  /**
   * Format percentage
   * 
   * @example
   * formatPercentage(0.1523) // "15.23%"
   * formatPercentage(0.1523, { maximumFractionDigits: 1 }) // "15.2%"
   */
  formatPercentage(
    value: number | string,
    options: PercentageFormatOptions = {}
  ): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
      return 'Invalid Percentage';
    }

    const {
      locale = this.defaultLocale,
      minimumFractionDigits = 0,
      maximumFractionDigits = 2
    } = options;

    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(numericValue);
  }

  /**
   * Format phone number
   * 
   * @example
   * formatPhoneNumber('5551234567', 'national') // "(555) 123-4567"
   * formatPhoneNumber('+15551234567', 'international') // "+1 (555) 123-4567"
   */
  formatPhoneNumber(
    phoneNumber: string,
    format: PhoneFormatType = 'national'
  ): string {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    switch (format) {
      case 'international':
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
          return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
          return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phoneNumber;

      case 'national':
        if (cleaned.length === 10) {
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
          return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        return phoneNumber;

      case 'compact':
        return cleaned;

      default:
        return phoneNumber;
    }
  }

  /**
   * Format file size
   * 
   * @example
   * formatFileSize(1024) // "1 KB"
   * formatFileSize(1536000) // "1.5 MB"
   */
  formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 0) return 'Invalid Size';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  /**
   * Format duration (in seconds) to human-readable format
   * 
   * @example
   * formatDuration(3665) // "1h 1m 5s"
   * formatDuration(125) // "2m 5s"
   */
  formatDuration(seconds: number, showSeconds: boolean = true): string {
    if (seconds < 0) return 'Invalid Duration';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (showSeconds && secs > 0) parts.push(`${secs}s`);

    return parts.length > 0 ? parts.join(' ') : '0s';
  }

  /**
   * Format distance (in meters) to human-readable format
   * 
   * @example
   * formatDistance(1500) // "1.5 km"
   * formatDistance(500) // "500 m"
   */
  formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
    if (meters < 0) return 'Invalid Distance';

    if (unit === 'metric') {
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
      }
      return `${Math.round(meters)} m`;
    } else {
      const feet = meters * 3.28084;
      if (feet >= 5280) {
        return `${(feet / 5280).toFixed(1)} mi`;
      }
      return `${Math.round(feet)} ft`;
    }
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   * 
   * @example
   * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
   * formatRelativeTime(new Date(Date.now() + 86400000)) // "in 1 day"
   */
  formatRelativeTime(dateInput: string | Date | number): string {
    const date = this.parseDate(dateInput);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);

    const rtf = new Intl.RelativeTimeFormat(this.defaultLocale, { numeric: 'auto' });

    if (absDiff < 60) {
      return rtf.format(-Math.floor(diffInSeconds), 'second');
    } else if (absDiff < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (absDiff < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (absDiff < 604800) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (absDiff < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
    } else if (absDiff < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  /**
   * Parse date from various input formats
   */
  private parseDate(dateInput: string | Date | number): Date {
    if (dateInput instanceof Date) {
      return dateInput;
    }
    if (typeof dateInput === 'number') {
      return new Date(dateInput);
    }
    return new Date(dateInput);
  }

  /**
   * Format business date range (start and end date)
   * 
   * @example
   * formatDateRange('2025-11-01', '2025-11-05') // "Nov 1 - Nov 5, 2025"
   * formatDateRange('2025-11-01', '2025-12-01') // "Nov 1 - Dec 1, 2025"
   */
  formatDateRange(
    startDate: string | Date | number,
    endDate: string | Date | number,
    format: DateFormatType = 'medium'
  ): string {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid Date Range';
    }

    const startFormatted = this.formatDate(start, format);
    const endFormatted = this.formatDate(end, format);

    // If same date, return just one date
    if (start.toDateString() === end.toDateString()) {
      return startFormatted;
    }

    // If same month and year, show abbreviated format
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      const startDay = start.getDate();
      const endDay = end.getDate();
      const monthYear = this.formatDate(start, 'medium');
      return `${monthYear.split(' ')[0]} ${startDay} - ${endDay}, ${start.getFullYear()}`;
    }

    return `${startFormatted} - ${endFormatted}`;
  }

  /**
   * Truncate text with ellipsis
   * 
   * @example
   * truncateText('Lorem ipsum dolor sit amet', 10) // "Lorem ipsu..."
   */
  truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Format ordinal numbers (1st, 2nd, 3rd, etc.)
   * 
   * @example
   * formatOrdinal(1) // "1st"
   * formatOrdinal(22) // "22nd"
   */
  formatOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }
}

// Export singleton instance
export const formattingService = new FormattingService();
export default formattingService;
