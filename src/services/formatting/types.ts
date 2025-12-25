/**
 * Formatting Service Types
 * Centralized type definitions for all formatting operations
 */

/**
 * Date format options
 */
export type DateFormatType = 
  | 'short'           // e.g., "11/5/25"
  | 'medium'          // e.g., "Nov 5, 2025"
  | 'long'            // e.g., "November 5, 2025"
  | 'full'            // e.g., "Tuesday, November 5, 2025"
  | 'iso'             // e.g., "2025-11-05"
  | 'time'            // e.g., "2:30 PM"
  | 'datetime-short'  // e.g., "Nov 5, 2025, 2:30 PM"
  | 'datetime-medium' // e.g., "November 5, 2025, 2:30 PM"
  | 'datetime-long'   // e.g., "Tuesday, November 5, 2025 at 2:30 PM"
  | 'custom';

/**
 * Time format options
 */
export type TimeFormatType = 
  | '12h'  // 12-hour format with AM/PM
  | '24h'; // 24-hour format

/**
 * Currency format options
 */
export interface CurrencyFormatOptions {
  currency?: string;        // Currency code (e.g., 'USD', 'INR', 'EUR')
  locale?: string;          // Locale for formatting (e.g., 'en-US', 'hi-IN')
  minimumFractionDigits?: number;  // Minimum decimal places
  maximumFractionDigits?: number;  // Maximum decimal places
  showSymbol?: boolean;     // Whether to show currency symbol
  compact?: boolean;        // Use compact notation (e.g., $1.2K)
}

/**
 * Number format options
 */
export interface NumberFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;    // Use thousand separators
  compact?: boolean;        // Use compact notation (e.g., 1.2K)
}

/**
 * Date format options for custom formatting
 */
export interface CustomDateFormatOptions {
  locale?: string;
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
  timeZone?: string;
}

/**
 * Percentage format options
 */
export interface PercentageFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Phone number format options
 */
export type PhoneFormatType = 
  | 'international'  // e.g., "+1 (555) 123-4567"
  | 'national'       // e.g., "(555) 123-4567"
  | 'compact';       // e.g., "5551234567"
