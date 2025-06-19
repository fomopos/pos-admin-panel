import React from 'react';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { BanknotesIcon, CreditCardIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

/**
 * Centralized DropdownSearchOption constants for the application
 * 
 * This file contains all dropdown options used throughout the app,
 * organized by category for easy maintenance and reusability.
 */

// ===== GEOGRAPHIC OPTIONS =====

/**
 * Countries with flags - Popular countries first, then alphabetical
 */
export const COUNTRIES: DropdownSearchOption[] = [
  // Popular countries first
  { id: 'US', label: 'United States', icon: '🇺🇸' },
  { id: 'GB', label: 'United Kingdom', icon: '🇬🇧' },
  { id: 'CA', label: 'Canada', icon: '🇨🇦' },
  { id: 'AU', label: 'Australia', icon: '🇦🇺' },
  { id: 'DE', label: 'Germany', icon: '🇩🇪' },
  { id: 'FR', label: 'France', icon: '🇫🇷' },
  { id: 'IN', label: 'India', icon: '🇮🇳' },
  { id: 'JP', label: 'Japan', icon: '🇯🇵' },
  { id: 'BR', label: 'Brazil', icon: '🇧🇷' },
  { id: 'CN', label: 'China', icon: '🇨🇳' },
  { id: 'separator', label: '─────────────────────', icon: '' },
  // All countries alphabetically
  { id: 'AD', label: 'Andorra', icon: '🇦🇩' },
  { id: 'AE', label: 'United Arab Emirates', icon: '🇦🇪' },
  { id: 'AF', label: 'Afghanistan', icon: '🇦🇫' },
  { id: 'AG', label: 'Antigua and Barbuda', icon: '🇦🇬' },
  { id: 'AI', label: 'Anguilla', icon: '🇦🇮' },
  { id: 'AL', label: 'Albania', icon: '🇦🇱' },
  { id: 'AM', label: 'Armenia', icon: '🇦🇲' },
  { id: 'AO', label: 'Angola', icon: '🇦🇴' },
  { id: 'AQ', label: 'Antarctica', icon: '🇦🇶' },
  { id: 'AR', label: 'Argentina', icon: '🇦🇷' },
  { id: 'AS', label: 'American Samoa', icon: '🇦🇸' },
  { id: 'AT', label: 'Austria', icon: '🇦🇹' },
  { id: 'AW', label: 'Aruba', icon: '🇦🇼' },
  { id: 'AX', label: 'Åland Islands', icon: '🇦🇽' },
  { id: 'AZ', label: 'Azerbaijan', icon: '🇦🇿' },
  { id: 'BA', label: 'Bosnia and Herzegovina', icon: '🇧🇦' },
  { id: 'BB', label: 'Barbados', icon: '🇧🇧' },
  { id: 'BD', label: 'Bangladesh', icon: '🇧🇩' },
  { id: 'BE', label: 'Belgium', icon: '🇧🇪' },
  { id: 'BF', label: 'Burkina Faso', icon: '🇧🇫' },
  { id: 'BG', label: 'Bulgaria', icon: '🇧🇬' },
  { id: 'BH', label: 'Bahrain', icon: '🇧🇭' },
  { id: 'BI', label: 'Burundi', icon: '🇧🇮' },
  { id: 'BJ', label: 'Benin', icon: '🇧🇯' },
  { id: 'BL', label: 'Saint Barthélemy', icon: '🇧🇱' },
  { id: 'BM', label: 'Bermuda', icon: '🇧🇲' },
  { id: 'BN', label: 'Brunei', icon: '🇧🇳' },
  { id: 'BO', label: 'Bolivia', icon: '🇧🇴' },
  { id: 'BQ', label: 'Caribbean Netherlands', icon: '🇧🇶' },
  { id: 'BS', label: 'Bahamas', icon: '🇧🇸' },
  { id: 'BT', label: 'Bhutan', icon: '🇧🇹' },
  { id: 'BV', label: 'Bouvet Island', icon: '🇧🇻' },
  { id: 'BW', label: 'Botswana', icon: '🇧🇼' },
  { id: 'BY', label: 'Belarus', icon: '🇧🇾' },
  { id: 'BZ', label: 'Belize', icon: '🇧🇿' },
  { id: 'CC', label: 'Cocos (Keeling) Islands', icon: '🇨🇨' },
  { id: 'CD', label: 'Congo (Democratic Republic)', icon: '🇨🇩' },
  { id: 'CF', label: 'Central African Republic', icon: '🇨🇫' },
  { id: 'CG', label: 'Congo', icon: '🇨🇬' },
  { id: 'CH', label: 'Switzerland', icon: '🇨🇭' },
  { id: 'CI', label: 'Côte d\'Ivoire', icon: '🇨🇮' },
  { id: 'CK', label: 'Cook Islands', icon: '🇨🇰' },
  { id: 'CL', label: 'Chile', icon: '🇨🇱' },
  { id: 'CM', label: 'Cameroon', icon: '🇨🇲' },
  { id: 'CO', label: 'Colombia', icon: '🇨🇴' },
  { id: 'CR', label: 'Costa Rica', icon: '🇨🇷' },
  { id: 'CU', label: 'Cuba', icon: '🇨🇺' },
  { id: 'CV', label: 'Cape Verde', icon: '🇨🇻' },
  { id: 'CW', label: 'Curaçao', icon: '🇨🇼' },
  { id: 'CX', label: 'Christmas Island', icon: '🇨🇽' },
  { id: 'CY', label: 'Cyprus', icon: '🇨🇾' },
  { id: 'CZ', label: 'Czech Republic', icon: '🇨🇿' },
  { id: 'DJ', label: 'Djibouti', icon: '🇩🇯' },
  { id: 'DK', label: 'Denmark', icon: '🇩🇰' },
  { id: 'DM', label: 'Dominica', icon: '🇩🇲' },
  { id: 'DO', label: 'Dominican Republic', icon: '🇩🇴' },
  { id: 'DZ', label: 'Algeria', icon: '🇩🇿' },
  { id: 'EC', label: 'Ecuador', icon: '🇪🇨' },
  { id: 'EE', label: 'Estonia', icon: '🇪🇪' },
  { id: 'EG', label: 'Egypt', icon: '🇪🇬' },
  { id: 'EH', label: 'Western Sahara', icon: '🇪🇭' },
  { id: 'ER', label: 'Eritrea', icon: '🇪🇷' },
  { id: 'ES', label: 'Spain', icon: '🇪🇸' },
  { id: 'ET', label: 'Ethiopia', icon: '🇪🇹' },
  { id: 'FI', label: 'Finland', icon: '🇫🇮' },
  { id: 'FJ', label: 'Fiji', icon: '🇫🇯' },
  { id: 'FK', label: 'Falkland Islands', icon: '🇫🇰' },
  { id: 'FM', label: 'Micronesia', icon: '🇫🇲' },
  { id: 'FO', label: 'Faroe Islands', icon: '🇫🇴' },
  { id: 'GA', label: 'Gabon', icon: '🇬🇦' },
  { id: 'GD', label: 'Grenada', icon: '🇬🇩' },
  { id: 'GE', label: 'Georgia', icon: '🇬🇪' },
  { id: 'GF', label: 'French Guiana', icon: '🇬🇫' },
  { id: 'GG', label: 'Guernsey', icon: '🇬🇬' },
  { id: 'GH', label: 'Ghana', icon: '🇬🇭' },
  { id: 'GI', label: 'Gibraltar', icon: '🇬🇮' },
  { id: 'GL', label: 'Greenland', icon: '🇬🇱' },
  { id: 'GM', label: 'Gambia', icon: '🇬🇲' },
  { id: 'GN', label: 'Guinea', icon: '🇬🇳' },
  { id: 'GP', label: 'Guadeloupe', icon: '🇬🇵' },
  { id: 'GQ', label: 'Equatorial Guinea', icon: '🇬🇶' },
  { id: 'GR', label: 'Greece', icon: '🇬🇷' },
  { id: 'GS', label: 'South Georgia and the South Sandwich Islands', icon: '🇬🇸' },
  { id: 'GT', label: 'Guatemala', icon: '🇬🇹' },
  { id: 'GU', label: 'Guam', icon: '🇬🇺' },
  { id: 'GW', label: 'Guinea-Bissau', icon: '🇬🇼' },
  { id: 'GY', label: 'Guyana', icon: '🇬🇾' },
  { id: 'HK', label: 'Hong Kong', icon: '🇭🇰' },
  { id: 'HM', label: 'Heard Island and McDonald Islands', icon: '🇭🇲' },
  { id: 'HN', label: 'Honduras', icon: '🇭🇳' },
  { id: 'HR', label: 'Croatia', icon: '🇭🇷' },
  { id: 'HT', label: 'Haiti', icon: '🇭🇹' },
  { id: 'HU', label: 'Hungary', icon: '🇭🇺' },
  { id: 'ID', label: 'Indonesia', icon: '🇮🇩' },
  { id: 'IE', label: 'Ireland', icon: '🇮🇪' },
  { id: 'IL', label: 'Israel', icon: '🇮🇱' },
  { id: 'IM', label: 'Isle of Man', icon: '🇮🇲' },
  { id: 'IO', label: 'British Indian Ocean Territory', icon: '🇮🇴' },
  { id: 'IQ', label: 'Iraq', icon: '🇮🇶' },
  { id: 'IR', label: 'Iran', icon: '🇮🇷' },
  { id: 'IS', label: 'Iceland', icon: '🇮🇸' },
  { id: 'IT', label: 'Italy', icon: '🇮🇹' },
  { id: 'JE', label: 'Jersey', icon: '🇯🇪' },
  { id: 'JM', label: 'Jamaica', icon: '🇯🇲' },
  { id: 'JO', label: 'Jordan', icon: '🇯🇴' },
  { id: 'KE', label: 'Kenya', icon: '🇰🇪' },
  { id: 'KG', label: 'Kyrgyzstan', icon: '🇰🇬' },
  { id: 'KH', label: 'Cambodia', icon: '🇰🇭' },
  { id: 'KI', label: 'Kiribati', icon: '🇰🇮' },
  { id: 'KM', label: 'Comoros', icon: '🇰🇲' },
  { id: 'KN', label: 'Saint Kitts and Nevis', icon: '🇰🇳' },
  { id: 'KP', label: 'North Korea', icon: '🇰🇵' },
  { id: 'KR', label: 'South Korea', icon: '🇰🇷' },
  { id: 'KW', label: 'Kuwait', icon: '🇰🇼' },
  { id: 'KY', label: 'Cayman Islands', icon: '🇰🇾' },
  { id: 'KZ', label: 'Kazakhstan', icon: '🇰🇿' },
  { id: 'LA', label: 'Laos', icon: '🇱🇦' },
  { id: 'LB', label: 'Lebanon', icon: '🇱🇧' },
  { id: 'LC', label: 'Saint Lucia', icon: '🇱🇨' },
  { id: 'LI', label: 'Liechtenstein', icon: '🇱🇮' },
  { id: 'LK', label: 'Sri Lanka', icon: '🇱🇰' },
  { id: 'LR', label: 'Liberia', icon: '🇱🇷' },
  { id: 'LS', label: 'Lesotho', icon: '🇱🇸' },
  { id: 'LT', label: 'Lithuania', icon: '🇱🇹' },
  { id: 'LU', label: 'Luxembourg', icon: '🇱🇺' },
  { id: 'LV', label: 'Latvia', icon: '🇱🇻' },
  { id: 'LY', label: 'Libya', icon: '🇱🇾' },
  { id: 'MA', label: 'Morocco', icon: '🇲🇦' },
  { id: 'MC', label: 'Monaco', icon: '🇲🇨' },
  { id: 'MD', label: 'Moldova', icon: '🇲🇩' },
  { id: 'ME', label: 'Montenegro', icon: '🇲🇪' },
  { id: 'MF', label: 'Saint Martin', icon: '🇲🇫' },
  { id: 'MG', label: 'Madagascar', icon: '🇲🇬' },
  { id: 'MH', label: 'Marshall Islands', icon: '🇲🇭' },
  { id: 'MK', label: 'North Macedonia', icon: '🇲🇰' },
  { id: 'ML', label: 'Mali', icon: '🇲🇱' },
  { id: 'MM', label: 'Myanmar', icon: '🇲🇲' },
  { id: 'MN', label: 'Mongolia', icon: '🇲🇳' },
  { id: 'MO', label: 'Macao', icon: '🇲🇴' },
  { id: 'MP', label: 'Northern Mariana Islands', icon: '🇲🇵' },
  { id: 'MQ', label: 'Martinique', icon: '🇲🇶' },
  { id: 'MR', label: 'Mauritania', icon: '🇲🇷' },
  { id: 'MS', label: 'Montserrat', icon: '🇲🇸' },
  { id: 'MT', label: 'Malta', icon: '🇲🇹' },
  { id: 'MU', label: 'Mauritius', icon: '🇲🇺' },
  { id: 'MV', label: 'Maldives', icon: '🇲🇻' },
  { id: 'MW', label: 'Malawi', icon: '🇲🇼' },
  { id: 'MX', label: 'Mexico', icon: '🇲🇽' },
  { id: 'MY', label: 'Malaysia', icon: '🇲🇾' },
  { id: 'MZ', label: 'Mozambique', icon: '🇲🇿' },
  { id: 'NA', label: 'Namibia', icon: '🇳🇦' },
  { id: 'NC', label: 'New Caledonia', icon: '🇳🇨' },
  { id: 'NE', label: 'Niger', icon: '🇳🇪' },
  { id: 'NF', label: 'Norfolk Island', icon: '🇳🇫' },
  { id: 'NG', label: 'Nigeria', icon: '🇳🇬' },
  { id: 'NI', label: 'Nicaragua', icon: '🇳🇮' },
  { id: 'NL', label: 'Netherlands', icon: '🇳🇱' },
  { id: 'NO', label: 'Norway', icon: '🇳🇴' },
  { id: 'NP', label: 'Nepal', icon: '🇳🇵' },
  { id: 'NR', label: 'Nauru', icon: '🇳🇷' },
  { id: 'NU', label: 'Niue', icon: '🇳🇺' },
  { id: 'NZ', label: 'New Zealand', icon: '🇳🇿' },
  { id: 'OM', label: 'Oman', icon: '🇴🇲' },
  { id: 'PA', label: 'Panama', icon: '🇵🇦' },
  { id: 'PE', label: 'Peru', icon: '🇵🇪' },
  { id: 'PF', label: 'French Polynesia', icon: '🇵🇫' },
  { id: 'PG', label: 'Papua New Guinea', icon: '🇵🇬' },
  { id: 'PH', label: 'Philippines', icon: '🇵🇭' },
  { id: 'PK', label: 'Pakistan', icon: '🇵🇰' },
  { id: 'PL', label: 'Poland', icon: '🇵🇱' },
  { id: 'PM', label: 'Saint Pierre and Miquelon', icon: '🇵🇲' },
  { id: 'PN', label: 'Pitcairn', icon: '🇵🇳' },
  { id: 'PR', label: 'Puerto Rico', icon: '🇵🇷' },
  { id: 'PS', label: 'Palestinian Territory', icon: '🇵🇸' },
  { id: 'PT', label: 'Portugal', icon: '🇵🇹' },
  { id: 'PW', label: 'Palau', icon: '🇵🇼' },
  { id: 'PY', label: 'Paraguay', icon: '🇵🇾' },
  { id: 'QA', label: 'Qatar', icon: '🇶🇦' },
  { id: 'RE', label: 'Réunion', icon: '🇷🇪' },
  { id: 'RO', label: 'Romania', icon: '🇷🇴' },
  { id: 'RS', label: 'Serbia', icon: '🇷🇸' },
  { id: 'RU', label: 'Russia', icon: '🇷🇺' },
  { id: 'RW', label: 'Rwanda', icon: '🇷🇼' },
  { id: 'SA', label: 'Saudi Arabia', icon: '🇸🇦' },
  { id: 'SB', label: 'Solomon Islands', icon: '🇸🇧' },
  { id: 'SC', label: 'Seychelles', icon: '🇸🇨' },
  { id: 'SD', label: 'Sudan', icon: '🇸🇩' },
  { id: 'SE', label: 'Sweden', icon: '🇸🇪' },
  { id: 'SG', label: 'Singapore', icon: '🇸🇬' },
  { id: 'SH', label: 'Saint Helena', icon: '🇸🇭' },
  { id: 'SI', label: 'Slovenia', icon: '🇸🇮' },
  { id: 'SJ', label: 'Svalbard and Jan Mayen', icon: '🇸🇯' },
  { id: 'SK', label: 'Slovakia', icon: '🇸🇰' },
  { id: 'SL', label: 'Sierra Leone', icon: '🇸🇱' },
  { id: 'SM', label: 'San Marino', icon: '🇸🇲' },
  { id: 'SN', label: 'Senegal', icon: '🇸🇳' },
  { id: 'SO', label: 'Somalia', icon: '🇸🇴' },
  { id: 'SR', label: 'Suriname', icon: '🇸🇷' },
  { id: 'SS', label: 'South Sudan', icon: '🇸🇸' },
  { id: 'ST', label: 'São Tomé and Príncipe', icon: '🇸🇹' },
  { id: 'SV', label: 'El Salvador', icon: '🇸🇻' },
  { id: 'SX', label: 'Sint Maarten', icon: '🇸🇽' },
  { id: 'SY', label: 'Syria', icon: '🇸🇾' },
  { id: 'SZ', label: 'Eswatini', icon: '🇸🇿' },
  { id: 'TC', label: 'Turks and Caicos Islands', icon: '🇹🇨' },
  { id: 'TD', label: 'Chad', icon: '🇹🇩' },
  { id: 'TF', label: 'French Southern Territories', icon: '🇹🇫' },
  { id: 'TG', label: 'Togo', icon: '🇹🇬' },
  { id: 'TH', label: 'Thailand', icon: '🇹🇭' },
  { id: 'TJ', label: 'Tajikistan', icon: '🇹🇯' },
  { id: 'TK', label: 'Tokelau', icon: '🇹🇰' },
  { id: 'TL', label: 'Timor-Leste', icon: '🇹🇱' },
  { id: 'TM', label: 'Turkmenistan', icon: '🇹🇲' },
  { id: 'TN', label: 'Tunisia', icon: '🇹🇳' },
  { id: 'TO', label: 'Tonga', icon: '🇹🇴' },
  { id: 'TR', label: 'Turkey', icon: '🇹🇷' },
  { id: 'TT', label: 'Trinidad and Tobago', icon: '🇹🇹' },
  { id: 'TV', label: 'Tuvalu', icon: '🇹🇻' },
  { id: 'TW', label: 'Taiwan', icon: '🇹🇼' },
  { id: 'TZ', label: 'Tanzania', icon: '🇹🇿' },
  { id: 'UA', label: 'Ukraine', icon: '🇺🇦' },
  { id: 'UG', label: 'Uganda', icon: '🇺🇬' },
  { id: 'UM', label: 'United States Minor Outlying Islands', icon: '🇺🇲' },
  { id: 'UY', label: 'Uruguay', icon: '🇺🇾' },
  { id: 'UZ', label: 'Uzbekistan', icon: '🇺🇿' },
  { id: 'VA', label: 'Vatican City', icon: '🇻🇦' },
  { id: 'VC', label: 'Saint Vincent and the Grenadines', icon: '🇻🇨' },
  { id: 'VE', label: 'Venezuela', icon: '🇻🇪' },
  { id: 'VG', label: 'British Virgin Islands', icon: '🇻🇬' },
  { id: 'VI', label: 'U.S. Virgin Islands', icon: '🇻🇮' },
  { id: 'VN', label: 'Vietnam', icon: '🇻🇳' },
  { id: 'VU', label: 'Vanuatu', icon: '🇻🇺' },
  { id: 'WF', label: 'Wallis and Futuna', icon: '🇼🇫' },
  { id: 'WS', label: 'Samoa', icon: '🇼🇸' },
  { id: 'YE', label: 'Yemen', icon: '🇾🇪' },
  { id: 'YT', label: 'Mayotte', icon: '🇾🇹' },
  { id: 'ZA', label: 'South Africa', icon: '🇿🇦' },
  { id: 'ZM', label: 'Zambia', icon: '🇿🇲' },
  { id: 'ZW', label: 'Zimbabwe', icon: '🇿🇼' },
];

/**
 * Locale options with flag icons
 */
export const LOCALES: DropdownSearchOption[] = [
  { id: 'en-US', label: 'English (US)', icon: '🇺🇸' },
  { id: 'en-GB', label: 'English (UK)', icon: '🇬🇧' },
  { id: 'es-ES', label: 'Spanish (Spain)', icon: '🇪🇸' },
  { id: 'es-MX', label: 'Spanish (Mexico)', icon: '🇲🇽' },
  { id: 'fr-FR', label: 'French (France)', icon: '🇫🇷' },
  { id: 'de-DE', label: 'German (Germany)', icon: '🇩🇪' },
  { id: 'it-IT', label: 'Italian (Italy)', icon: '🇮🇹' },
  { id: 'pt-BR', label: 'Portuguese (Brazil)', icon: '🇧🇷' },
  { id: 'pt-PT', label: 'Portuguese (Portugal)', icon: '🇵🇹' },
  { id: 'ja-JP', label: 'Japanese (Japan)', icon: '🇯🇵' },
  { id: 'ko-KR', label: 'Korean (South Korea)', icon: '🇰🇷' },
  { id: 'zh-CN', label: 'Chinese (Simplified)', icon: '🇨🇳' },
];

// ===== BUSINESS OPTIONS =====

/**
 * Location types with icons
 */
export const LOCATION_TYPES: DropdownSearchOption[] = [
  { id: 'retail', label: 'Retail', icon: '🏪' },
  { id: 'warehouse', label: 'Warehouse', icon: '🏭' },
  { id: 'outlet', label: 'Outlet', icon: '🏬' },
  { id: 'kiosk', label: 'Kiosk', icon: '🏪' },
  { id: 'online', label: 'Online', icon: '💻' },
  { id: 'popup', label: 'Pop-up', icon: '⏰' },
];

/**
 * Store types with icons
 */
export const STORE_TYPES: DropdownSearchOption[] = [
  { id: 'general', label: 'General Store', icon: '🏪' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'cafe', label: 'Cafe', icon: '☕' },
  { id: 'specialty', label: 'Specialty Store', icon: '🎯' },
];

// ===== FINANCIAL OPTIONS =====

/**
 * Currency options with symbols
 */
export const CURRENCIES: DropdownSearchOption[] = [
  { id: 'USD', label: 'USD - US Dollar', icon: '$' },
  { id: 'EUR', label: 'EUR - Euro', icon: '€' },
  { id: 'GBP', label: 'GBP - British Pound', icon: '£' },
  { id: 'CAD', label: 'CAD - Canadian Dollar', icon: 'C$' },
  { id: 'AUD', label: 'AUD - Australian Dollar', icon: 'A$' },
  { id: 'JPY', label: 'JPY - Japanese Yen', icon: '¥' },
  { id: 'CNY', label: 'CNY - Chinese Yuan', icon: '¥' },
  { id: 'INR', label: 'INR - Indian Rupee', icon: '₹' },
  { id: 'AED', label: 'AED - UAE Dirham', icon: 'د.إ' },
  { id: 'CHF', label: 'CHF - Swiss Franc', icon: 'Fr' },
];

/**
 * Payment tender types (for PaymentSettings)
 */
export const TENDER_TYPES = [
  { value: 'cash', label: 'Cash', icon: BanknotesIcon },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCardIcon },
  { value: 'debit_card', label: 'Debit Card', icon: CreditCardIcon },
  { value: 'gift_card', label: 'Gift Card', icon: CreditCardIcon },
  { value: 'store_credit', label: 'Store Credit', icon: CurrencyDollarIcon },
  { value: 'check', label: 'Check', icon: BanknotesIcon },
  { value: 'mobile_payment', label: 'Mobile Payment', icon: CreditCardIcon },
  { value: 'voucher', label: 'Voucher', icon: CurrencyDollarIcon },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: BanknotesIcon },
  { value: 'cryptocurrency', label: 'Cryptocurrency', icon: CurrencyDollarIcon }
];

/**
 * Currency options for PaymentSettings (simplified format)
 */
export const PAYMENT_CURRENCIES = [
  { value: 'usd', label: 'USD - US Dollar' },
  { value: 'eur', label: 'EUR - Euro' },
  { value: 'gbp', label: 'GBP - British Pound' },
  { value: 'aed', label: 'AED - UAE Dirham' },
  { value: 'inr', label: 'INR - Indian Rupee' },
  { value: 'jpy', label: 'JPY - Japanese Yen' },
  { value: 'cad', label: 'CAD - Canadian Dollar' },
  { value: 'aud', label: 'AUD - Australian Dollar' },
  { value: 'chf', label: 'CHF - Swiss Franc' },
  { value: 'cny', label: 'CNY - Chinese Yuan' }
];

// ===== DEMO OPTIONS =====

/**
 * Sample category options with hierarchy (for demos)
 */
export const DEMO_CATEGORIES: DropdownSearchOption[] = [
  { id: '1', label: 'Electronics', description: 'Electronic devices and accessories', level: 0 },
  { id: '2', label: 'Smartphones', description: 'Mobile phones and accessories', level: 1 },
  { id: '3', label: 'iPhone', description: 'Apple smartphones', level: 2 },
  { id: '4', label: 'Android', description: 'Android smartphones', level: 2 },
  { id: '5', label: 'Laptops', description: 'Portable computers', level: 1 },
  { id: '6', label: 'Gaming Laptops', description: 'High-performance gaming computers', level: 2 },
  { id: '7', label: 'Business Laptops', description: 'Professional work computers', level: 2 },
  { id: '8', label: 'Clothing', description: 'Apparel and fashion items', level: 0 },
  { id: '9', label: 'Men\'s Clothing', description: 'Clothing for men', level: 1 },
  { id: '10', label: 'Women\'s Clothing', description: 'Clothing for women', level: 1 },
];

/**
 * Sample user options (for demos)
 */
export const DEMO_USERS: DropdownSearchOption[] = [
  { id: 'user1', label: 'John Doe', description: 'Administrator' },
  { id: 'user2', label: 'Jane Smith', description: 'Manager' },
  { id: 'user3', label: 'Bob Johnson', description: 'Sales Representative' },
  { id: 'user4', label: 'Alice Brown', description: 'Customer Service' },
  { id: 'user5', label: 'Charlie Wilson', description: 'IT Support' },
];

/**
 * Sample country options (for demos)
 */
export const DEMO_COUNTRIES: DropdownSearchOption[] = [
  { id: 'us', label: 'United States', description: 'North America' },
  { id: 'ca', label: 'Canada', description: 'North America' },
  { id: 'uk', label: 'United Kingdom', description: 'Europe' },
  { id: 'fr', label: 'France', description: 'Europe' },
  { id: 'de', label: 'Germany', description: 'Europe' },
  { id: 'jp', label: 'Japan', description: 'Asia' },
  { id: 'au', label: 'Australia', description: 'Oceania' },
];

/**
 * Enhanced currency options with styled icons (for demos)
 */
export const DEMO_CURRENCIES: DropdownSearchOption[] = [
  { id: 'USD', label: 'US Dollar', description: 'United States Dollar', icon: React.createElement('span', { className: 'font-bold text-green-600' }, '$') },
  { id: 'EUR', label: 'Euro', description: 'European Union Euro', icon: React.createElement('span', { className: 'font-bold text-blue-600' }, '€') },
  { id: 'GBP', label: 'British Pound', description: 'British Pound Sterling', icon: React.createElement('span', { className: 'font-bold text-purple-600' }, '£') },
  { id: 'JPY', label: 'Japanese Yen', description: 'Japanese Yen', icon: React.createElement('span', { className: 'font-bold text-red-600' }, '¥') },
  { id: 'CAD', label: 'Canadian Dollar', description: 'Canadian Dollar', icon: React.createElement('span', { className: 'font-bold text-indigo-600' }, 'C$') },
];
