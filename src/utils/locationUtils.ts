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
    'IN': 'India',
    'JP': 'Japan',
    'BR': 'Brazil',
    'CN': 'China',
    'RU': 'Russia',
    'MX': 'Mexico',
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
    'GR': 'Greece',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'HR': 'Croatia',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'LU': 'Luxembourg',
    'IS': 'Iceland',
    'TR': 'Turkey',
    'UA': 'Ukraine',
    'BY': 'Belarus',
    'MD': 'Moldova',
    'RS': 'Serbia',
    'ME': 'Montenegro',
    'MK': 'North Macedonia',
    'AL': 'Albania',
    'BA': 'Bosnia and Herzegovina',
    'XK': 'Kosovo',
    'AD': 'Andorra',
    'SM': 'San Marino',
    'VA': 'Vatican City',
    'MC': 'Monaco',
    'LI': 'Liechtenstein',
    'KR': 'South Korea',
    'KP': 'North Korea',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'BD': 'Bangladesh',
    'PK': 'Pakistan',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'MM': 'Myanmar',
    'KH': 'Cambodia',
    'LA': 'Laos',
    'MN': 'Mongolia',
    'AF': 'Afghanistan',
    'IR': 'Iran',
    'IQ': 'Iraq',
    'SY': 'Syria',
    'JO': 'Jordan',
    'LB': 'Lebanon',
    'IL': 'Israel',
    'PS': 'Palestinian Territory',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'QA': 'Qatar',
    'BH': 'Bahrain',
    'KW': 'Kuwait',
    'OM': 'Oman',
    'YE': 'Yemen',
    'EG': 'Egypt',
    'LY': 'Libya',
    'TN': 'Tunisia',
    'DZ': 'Algeria',
    'MA': 'Morocco',
    'SD': 'Sudan',
    'SS': 'South Sudan',
    'ET': 'Ethiopia',
    'ER': 'Eritrea',
    'DJ': 'Djibouti',
    'SO': 'Somalia',
    'KE': 'Kenya',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'RW': 'Rwanda',
    'BI': 'Burundi',
    'MG': 'Madagascar',
    'MU': 'Mauritius',
    'SC': 'Seychelles',
    'KM': 'Comoros',
    'MV': 'Maldives',
    'ZA': 'South Africa',
    'NA': 'Namibia',
    'BW': 'Botswana',
    'ZW': 'Zimbabwe',
    'ZM': 'Zambia',
    'MW': 'Malawi',
    'MZ': 'Mozambique',
    'SZ': 'Eswatini',
    'LS': 'Lesotho',
    'AO': 'Angola',
    'CD': 'Congo (Democratic Republic)',
    'CG': 'Congo',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CM': 'Cameroon',
    'GQ': 'Equatorial Guinea',
    'GA': 'Gabon',
    'ST': 'São Tomé and Príncipe',
    'CV': 'Cape Verde',
    'GW': 'Guinea-Bissau',
    'GN': 'Guinea',
    'SL': 'Sierra Leone',
    'LR': 'Liberia',
    'CI': 'Côte d\'Ivoire',
    'GH': 'Ghana',
    'TG': 'Togo',
    'BJ': 'Benin',
    'NE': 'Niger',
    'BF': 'Burkina Faso',
    'ML': 'Mali',
    'SN': 'Senegal',
    'GM': 'Gambia',
    'MR': 'Mauritania',
    'NZ': 'New Zealand',
    'FJ': 'Fiji',
    'PG': 'Papua New Guinea',
    'SB': 'Solomon Islands',
    'VU': 'Vanuatu',
    'NC': 'New Caledonia',
    'PF': 'French Polynesia',
    'WS': 'Samoa',
    'TO': 'Tonga',
    'FM': 'Micronesia',
    'PW': 'Palau',
    'MH': 'Marshall Islands',
    'KI': 'Kiribati',
    'NR': 'Nauru',
    'TV': 'Tuvalu',
    'AR': 'Argentina',
    'CL': 'Chile',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'PE': 'Peru',
    'EC': 'Ecuador',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'GF': 'French Guiana',
    'FK': 'Falkland Islands',
    'GS': 'South Georgia and the South Sandwich Islands'
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
 * Get user's country code (same as detectUserCountry but with explicit naming for clarity)
 */
export const detectUserCountryCode = (): string => {
  return detectUserCountry();
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

/**
 * Get country code from country name  
 */
export const getCountryCodeFromName = (countryName: string): string => {
  // Create reverse mapping from names to codes
  const nameToCodeMap: Record<string, string> = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU', 
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'India': 'IN',
    'Japan': 'JP',
    'Brazil': 'BR',
    'China': 'CN',
    'Russia': 'RU',
    'Mexico': 'MX',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Ireland': 'IE',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Croatia': 'HR',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Lithuania': 'LT',
    'Latvia': 'LV',
    'Estonia': 'EE',
    'Malta': 'MT',
    'Cyprus': 'CY',
    'Luxembourg': 'LU',
    'Iceland': 'IS',
    'Turkey': 'TR',
    'Ukraine': 'UA',
    'Belarus': 'BY',
    'Moldova': 'MD',
    'Serbia': 'RS',
    'Montenegro': 'ME',
    'North Macedonia': 'MK',
    'Albania': 'AL',
    'Bosnia and Herzegovina': 'BA',
    'Kosovo': 'XK',
    'Andorra': 'AD',
    'San Marino': 'SM',
    'Vatican City': 'VA',
    'Monaco': 'MC',
    'Liechtenstein': 'LI',
    'South Korea': 'KR',
    'North Korea': 'KP',
    'Thailand': 'TH',
    'Vietnam': 'VN',
    'Malaysia': 'MY',
    'Singapore': 'SG',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Bangladesh': 'BD',
    'Pakistan': 'PK',
    'Sri Lanka': 'LK',
    'Nepal': 'NP',
    'Myanmar': 'MM',
    'Cambodia': 'KH',
    'Laos': 'LA',
    'Mongolia': 'MN',
    'Afghanistan': 'AF',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Syria': 'SY',
    'Jordan': 'JO',
    'Lebanon': 'LB',
    'Israel': 'IL',
    'Palestinian Territory': 'PS',
    'Saudi Arabia': 'SA',
    'United Arab Emirates': 'AE',
    'Qatar': 'QA',
    'Bahrain': 'BH',
    'Kuwait': 'KW',
    'Oman': 'OM',
    'Yemen': 'YE',
    'Egypt': 'EG',
    'Libya': 'LY',
    'Tunisia': 'TN',
    'Algeria': 'DZ',
    'Morocco': 'MA',
    'Sudan': 'SD',
    'South Sudan': 'SS',
    'Ethiopia': 'ET',
    'Eritrea': 'ER',
    'Djibouti': 'DJ',
    'Somalia': 'SO',
    'Kenya': 'KE',
    'Uganda': 'UG',
    'Tanzania': 'TZ',
    'Rwanda': 'RW',
    'Burundi': 'BI',
    'Madagascar': 'MG',
    'Mauritius': 'MU',
    'Seychelles': 'SC',
    'Comoros': 'KM',
    'Maldives': 'MV',
    'South Africa': 'ZA',
    'Namibia': 'NA',
    'Botswana': 'BW',
    'Zimbabwe': 'ZW',
    'Zambia': 'ZM',
    'Malawi': 'MW',
    'Mozambique': 'MZ',
    'Eswatini': 'SZ',
    'Lesotho': 'LS',
    'Angola': 'AO',
    'Congo (Democratic Republic)': 'CD',
    'Congo': 'CG',
    'Central African Republic': 'CF',
    'Chad': 'TD',
    'Cameroon': 'CM',
    'Equatorial Guinea': 'GQ',
    'Gabon': 'GA',
    'São Tomé and Príncipe': 'ST',
    'Cape Verde': 'CV',
    'Guinea-Bissau': 'GW',
    'Guinea': 'GN',
    'Sierra Leone': 'SL',
    'Liberia': 'LR',
    'Côte d\'Ivoire': 'CI',
    'Ghana': 'GH',
    'Togo': 'TG',
    'Benin': 'BJ',
    'Niger': 'NE',
    'Burkina Faso': 'BF',
    'Mali': 'ML',
    'Senegal': 'SN',
    'Gambia': 'GM',
    'Mauritania': 'MR',
    'New Zealand': 'NZ',
    'Fiji': 'FJ',
    'Papua New Guinea': 'PG',
    'Solomon Islands': 'SB',
    'Vanuatu': 'VU',
    'New Caledonia': 'NC',
    'French Polynesia': 'PF',
    'Samoa': 'WS',
    'Tonga': 'TO',
    'Micronesia': 'FM',
    'Palau': 'PW',
    'Marshall Islands': 'MH',
    'Kiribati': 'KI',
    'Nauru': 'NR',
    'Tuvalu': 'TV',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Uruguay': 'UY',
    'Paraguay': 'PY',
    'Bolivia': 'BO',
    'Peru': 'PE',
    'Ecuador': 'EC',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'Guyana': 'GY',
    'Suriname': 'SR',
    'French Guiana': 'GF',
    'Falkland Islands': 'FK',
    'South Georgia and the South Sandwich Islands': 'GS'
  };
  
  return nameToCodeMap[countryName] || countryName;
};
