/**
 * Location and country detection utilities
 * 
 * This utility provides functions to detect the user's current country
 * based on their browser settings, timezone, and locale.
 */

/**
 * Get user's country based on browser locale
 * Falls back to timezone-based detection if locale doesn't include country
 */
export const detectUserCountry = (): string => {
  try {
    // First try to get country from browser locale (e.g., "en-US" -> "US")
    const locale = navigator.language || navigator.languages?.[0];
    if (locale && locale.includes('-')) {
      const countryCode = locale.split('-')[1]?.toUpperCase();
      if (countryCode && isValidCountryCode(countryCode)) {
        return countryCode;
      }
    }

    // Fallback: Try to detect country from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryFromTimezone = getCountryFromTimezone(timezone);
    if (countryFromTimezone) {
      return countryFromTimezone;
    }

    // Final fallback: Default to US
    return 'US';
  } catch (error) {
    console.warn('Could not detect user country:', error);
    return 'US'; // Safe fallback
  }
};

/**
 * Get country name from country code
 */
export const getCountryNameFromCode = (countryCode: string): string => {
  const countryMap: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom', 
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'GR': 'Greece',
    'TR': 'Turkey',
    'RU': 'Russia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India',
    'SG': 'Singapore',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'IL': 'Israel',
    'EG': 'Egypt',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'NZ': 'New Zealand'
  };

  return countryMap[countryCode] || countryCode;
};

/**
 * Validate if country code is supported
 */
const isValidCountryCode = (countryCode: string): boolean => {
  const validCodes = [
    'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT',
    'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'PL', 'CZ', 'HU', 'GR', 'TR', 'RU',
    'JP', 'KR', 'CN', 'IN', 'SG', 'HK', 'TW', 'TH', 'MY', 'ID', 'PH', 'VN',
    'AE', 'SA', 'IL', 'EG', 'ZA', 'NG', 'KE', 'BR', 'MX', 'AR', 'CL', 'CO',
    'PE', 'VE', 'NZ'
  ];
  return validCodes.includes(countryCode);
};

/**
 * Get country from timezone (approximate mapping)
 */
const getCountryFromTimezone = (timezone: string): string | null => {
  const timezoneToCountry: Record<string, string> = {
    // North America
    'America/New_York': 'US',
    'America/Chicago': 'US', 
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    'America/Anchorage': 'US',
    'America/Honolulu': 'US',
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    'America/Montreal': 'CA',
    'America/Mexico_City': 'MX',
    
    // Europe
    'Europe/London': 'GB',
    'Europe/Dublin': 'IE',
    'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Amsterdam': 'NL',
    'Europe/Brussels': 'BE',
    'Europe/Zurich': 'CH',
    'Europe/Vienna': 'AT',
    'Europe/Stockholm': 'SE',
    'Europe/Oslo': 'NO',
    'Europe/Copenhagen': 'DK',
    'Europe/Helsinki': 'FI',
    'Europe/Lisbon': 'PT',
    'Europe/Warsaw': 'PL',
    'Europe/Prague': 'CZ',
    'Europe/Budapest': 'HU',
    'Europe/Athens': 'GR',
    'Europe/Istanbul': 'TR',
    'Europe/Moscow': 'RU',
    
    // Asia
    'Asia/Tokyo': 'JP',
    'Asia/Seoul': 'KR',
    'Asia/Shanghai': 'CN',
    'Asia/Hong_Kong': 'HK',
    'Asia/Taipei': 'TW',
    'Asia/Singapore': 'SG',
    'Asia/Bangkok': 'TH',
    'Asia/Kuala_Lumpur': 'MY',
    'Asia/Jakarta': 'ID',
    'Asia/Manila': 'PH',
    'Asia/Ho_Chi_Minh': 'VN',
    'Asia/Dubai': 'AE',
    'Asia/Riyadh': 'SA',
    'Asia/Tel_Aviv': 'IL',
    'Asia/Kolkata': 'IN',
    
    // Oceania
    'Australia/Sydney': 'AU',
    'Australia/Melbourne': 'AU',
    'Australia/Brisbane': 'AU',
    'Australia/Perth': 'AU',
    'Pacific/Auckland': 'NZ',
    
    // Africa
    'Africa/Johannesburg': 'ZA',
    'Africa/Lagos': 'NG',
    'Africa/Nairobi': 'KE',
    'Africa/Cairo': 'EG',
    
    // South America
    'America/Sao_Paulo': 'BR',
    'America/Buenos_Aires': 'AR',
    'America/Santiago': 'CL',
    'America/Bogota': 'CO',
    'America/Lima': 'PE',
    'America/Caracas': 'VE'
  };

  return timezoneToCountry[timezone] || null;
};

/**
 * Get user's country name (full name, not code)
 */
export const detectUserCountryName = (): string => {
  const countryCode = detectUserCountry();
  return getCountryNameFromCode(countryCode);
};

/**
 * Debug function to log detection results
 */
export const debugLocationDetection = (): void => {
  console.log('=== Location Detection Debug ===');
  console.log('Navigator language:', navigator.language);
  console.log('Navigator languages:', navigator.languages);
  console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log('Detected country code:', detectUserCountry());
  console.log('Detected country name:', detectUserCountryName());
  console.log('================================');
};
