import { TIMEZONES } from '../constants/dropdownOptions';

/**
 * Utility functions for timezone handling
 */

/**
 * Gets the user's local system timezone using Intl.DateTimeFormat
 * Returns the IANA timezone identifier (e.g., 'America/New_York', 'Europe/London')
 */
export const getSystemTimezone = (): string => {
  try {
    // Use Intl.DateTimeFormat to get the user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone;
  } catch (error) {
    // Fallback to UTC if detection fails
    console.warn('Failed to detect system timezone, falling back to UTC:', error);
    return 'UTC';
  }
};

/**
 * Gets the default timezone for the application
 * First tries to use the system timezone, falls back to a supported timezone if needed
 */
export const getDefaultTimezone = (): string => {
  const systemTimezone = getSystemTimezone();
  
  // Check if the system timezone is in our supported timezones list
  const isSupported = TIMEZONES.some(tz => tz.id === systemTimezone);
  
  if (isSupported) {
    return systemTimezone;
  }
  
  // If system timezone is not in our list, try to find a close match
  const fallbackTimezone = findClosestTimezone(systemTimezone);
  
  if (fallbackTimezone) {
    console.info(`System timezone "${systemTimezone}" not supported, using fallback: "${fallbackTimezone}"`);
    return fallbackTimezone;
  }
  
  // Final fallback to Eastern Time (most common business timezone)
  console.info(`No close match found for "${systemTimezone}", using default: America/New_York`);
  return 'America/New_York';
};

/**
 * Finds the closest supported timezone based on the system timezone
 */
const findClosestTimezone = (systemTimezone: string): string | null => {
  // Common timezone mappings for unsupported system timezones
  const timezoneMapping: Record<string, string> = {
    // US Timezones
    'US/Eastern': 'America/New_York',
    'US/Central': 'America/Chicago',
    'US/Mountain': 'America/Denver',
    'US/Pacific': 'America/Los_Angeles',
    
    // Europe
    'Europe/Dublin': 'Europe/London',
    'Europe/Amsterdam': 'Europe/Berlin',
    'Europe/Rome': 'Europe/Berlin',
    'Europe/Madrid': 'Europe/Berlin',
    'Europe/Brussels': 'Europe/Berlin',
    'Europe/Vienna': 'Europe/Berlin',
    'Europe/Prague': 'Europe/Berlin',
    'Europe/Warsaw': 'Europe/Berlin',
    'Europe/Stockholm': 'Europe/Berlin',
    'Europe/Oslo': 'Europe/Berlin',
    'Europe/Copenhagen': 'Europe/Berlin',
    'Europe/Helsinki': 'Europe/Berlin',
    'Europe/Zurich': 'Europe/Berlin',
    
    // Asia
    'Asia/Calcutta': 'Asia/Kolkata',
    'Asia/Seoul': 'Asia/Tokyo',
    'Asia/Hong_Kong': 'Asia/Shanghai',
    'Asia/Singapore': 'Asia/Shanghai',
    'Asia/Taipei': 'Asia/Shanghai',
    'Asia/Bangkok': 'Asia/Shanghai',
    'Asia/Jakarta': 'Asia/Shanghai',
    'Asia/Manila': 'Asia/Shanghai',
    
    // Australia
    'Australia/Melbourne': 'Australia/Sydney',
    'Australia/Brisbane': 'Australia/Sydney',
    'Australia/Adelaide': 'Australia/Sydney',
    'Australia/Perth': 'Australia/Sydney',
    
    // Canada
    'Canada/Eastern': 'America/New_York',
    'Canada/Central': 'America/Chicago',
    'Canada/Mountain': 'America/Denver',
    'Canada/Pacific': 'America/Los_Angeles',
    'America/Toronto': 'America/New_York',
    'America/Montreal': 'America/New_York',
    'America/Vancouver': 'America/Los_Angeles',
  };
  
  // Direct mapping lookup
  if (timezoneMapping[systemTimezone]) {
    return timezoneMapping[systemTimezone];
  }
  
  // Try to find by region prefix
  const regions = [
    { prefix: 'America/', fallback: 'America/New_York' },
    { prefix: 'Europe/', fallback: 'Europe/London' },
    { prefix: 'Asia/', fallback: 'Asia/Tokyo' },
    { prefix: 'Australia/', fallback: 'Australia/Sydney' },
    { prefix: 'Africa/', fallback: 'Africa/Cairo' },
    { prefix: 'Pacific/', fallback: 'Pacific/Auckland' },
  ];
  
  for (const region of regions) {
    if (systemTimezone.startsWith(region.prefix)) {
      // Check if the fallback is in our supported list
      const isSupported = TIMEZONES.some(tz => tz.id === region.fallback);
      if (isSupported) {
        return region.fallback;
      }
    }
  }
  
  return null;
};

/**
 * Gets the timezone display name for the current system timezone
 */
export const getSystemTimezoneDisplayName = (): string => {
  const systemTimezone = getSystemTimezone();
  const timezoneOption = TIMEZONES.find(tz => tz.id === systemTimezone);
  
  if (timezoneOption) {
    return `${timezoneOption.icon} ${timezoneOption.label}`;
  }
  
  // Fallback to system timezone ID if not found
  return systemTimezone;
};

/**
 * Validates if a timezone is supported by the application
 */
export const isTimezoneSupported = (timezone: string): boolean => {
  return TIMEZONES.some(tz => tz.id === timezone);
};
