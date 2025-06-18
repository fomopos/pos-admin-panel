import React, { useState, useEffect } from 'react';
import {
  BuildingStorefrontIcon,
  PrinterIcon,
  ComputerDesktopIcon,
  CogIcon,
  UserGroupIcon,
  LinkIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { 
  Button, 
  Card, 
  PageHeader, 
  Alert, 
  EnhancedTabs,
  ConfirmDialog,
  Loading,
  InputTextField,
  PropertyCheckbox,
  InputMoneyField,
  DropdownSearch
} from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { useDiscardChangesDialog } from '../hooks/useConfirmDialog';
import { storeServices } from '../services/store';
import type { StoreSettings, StoreDetails } from '../services/types/store.types';

// Location types with icons
const LOCATION_TYPES: DropdownSearchOption[] = [
  { id: 'retail', label: 'Retail', icon: '🏪' },
  { id: 'warehouse', label: 'Warehouse', icon: '🏭' },
  { id: 'outlet', label: 'Outlet', icon: '🏬' },
  { id: 'kiosk', label: 'Kiosk', icon: '🏪' },
  { id: 'online', label: 'Online', icon: '💻' },
  { id: 'popup', label: 'Pop-up', icon: '⏰' },
];

// Store types with icons
const STORE_TYPES: DropdownSearchOption[] = [
  { id: 'general', label: 'General Store', icon: '🏪' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'cafe', label: 'Cafe', icon: '☕' },
  { id: 'specialty', label: 'Specialty Store', icon: '🎯' },
];

// Currency options with symbols
const CURRENCIES: DropdownSearchOption[] = [
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

// Locale options with flag icons
const LOCALES: DropdownSearchOption[] = [
  { id: 'en-US', label: 'English (US)', icon: '🇺🇸' },
  { id: 'en-GB', label: 'English (UK)', icon: '🇬🇧' },
  { id: 'es-ES', label: 'Spanish (Spain)', icon: '🇪🇸' },
  { id: 'es-MX', label: 'Spanish (Mexico)', icon: '🇲🇽' },
  { id: 'fr-FR', label: 'French (France)', icon: '🇫🇷' },
  { id: 'de-DE', label: 'German (Germany)', icon: '🇩🇪' },
  { id: 'it-IT', label: 'Italian (Italy)', icon: '🇮🇹' },
  { id: 'pt-BR', label: 'Portuguese (Brazil)', icon: '🇧🇷' },
];

// Countries with flags for dropdown
const COUNTRIES: DropdownSearchOption[] = [
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
  { id: 'VG', label: 'Virgin Islands (British)', icon: '🇻🇬' },
  { id: 'VI', label: 'Virgin Islands (U.S.)', icon: '🇻🇮' },
  { id: 'VN', label: 'Vietnam', icon: '🇻🇳' },
  { id: 'VU', label: 'Vanuatu', icon: '🇻🇺' },
  { id: 'WF', label: 'Wallis and Futuna', icon: '🇼🇫' },
  { id: 'WS', label: 'Samoa', icon: '🇼🇸' },
  { id: 'YE', label: 'Yemen', icon: '🇾🇪' },
  { id: 'YT', label: 'Mayotte', icon: '🇾🇹' },
  { id: 'ZA', label: 'South Africa', icon: '🇿🇦' },
  { id: 'ZM', label: 'Zambia', icon: '🇿🇲' },
  { id: 'ZW', label: 'Zimbabwe', icon: '🇿🇼' }
];

interface StoreSettingsState {
  settings: StoreSettings | null;
  storeDetails: StoreDetails | null;
  isLoading: boolean;
  activeTab: string;
  showForm: boolean;
  formType: string;
  editingItem: any;
  errors: Record<string, string>;
  hasUnsavedChanges: boolean;
}

const StoreSettingsPage: React.FC = () => {
  const { currentTenant, currentStore } = useTenantStore();
  
  const [state, setState] = useState<StoreSettingsState>({
    settings: null,
    storeDetails: null,
    isLoading: true,
    activeTab: 'information',
    showForm: false,
    formType: '',
    editingItem: null,
    errors: {},
    hasUnsavedChanges: false
  });

  const discardDialog = useDiscardChangesDialog();

  // Fetch store settings and store details
  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const tenantId = currentTenant?.id || '272e';
        const storeId = currentStore?.store_id || '*';
        
        // Fetch store settings
        const settingsPromise = async () => {
          try {
            return await storeServices.settings.getStoreSettings({
              tenant_id: tenantId,
              store_id: storeId
            });
          } catch (apiError) {
            console.warn('Failed to fetch real store settings, using mock data:', apiError);
            return await storeServices.settings.getMockStoreSettings();
          }
        };
        
        // Fetch store details
        const detailsPromise = async () => {
          try {
            return await storeServices.store.getStoreDetails(tenantId, storeId);
          } catch (apiError) {
            console.warn('Failed to fetch real store details, using mock data:', apiError);
            return await storeServices.store.getMockStoreDetails();
          }
        };
        
        const [settings, storeDetails] = await Promise.all([
          settingsPromise(),
          detailsPromise()
        ]);
        
        setState(prev => ({ ...prev, settings, storeDetails, isLoading: false }));
      } catch (error) {
        console.error('Failed to fetch store data:', error);
        setState(prev => ({ ...prev, settings: null, storeDetails: null, isLoading: false }));
      }
    };

    fetchData();
  }, [currentTenant, currentStore]);

  const tabs = [
    { id: 'information', name: 'Store Information', icon: BuildingStorefrontIcon },
    { id: 'receipt', name: 'Receipt Settings', icon: PrinterIcon },
    { id: 'hardware', name: 'Hardware Configuration', icon: ComputerDesktopIcon },
    { id: 'operational', name: 'Operational Settings', icon: CogIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'api', name: 'API Information', icon: ServerIcon },
    { id: 'security', name: 'Security Settings', icon: ShieldCheckIcon }
  ];

  const handleTabChange = (tabId: string) => {
    if (state.hasUnsavedChanges) {
      discardDialog.openDiscardDialog(() => {
        setState(prev => ({ ...prev, activeTab: tabId, hasUnsavedChanges: false, errors: {} }));
      });
      return;
    }
    setState(prev => ({ ...prev, activeTab: tabId, hasUnsavedChanges: false, errors: {} }));
  };

  const handleSave = async (section: string, data: any) => {
    try {
      setState(prev => ({ ...prev, errors: {} }));
      
      const tenantId = currentTenant?.id || '272e';
      const storeId = currentStore?.store_id || '*';

      switch (section) {
        case 'information':
          // Handle store information update using real store API
          if (data.store_information) {
            const storeInfoData = data.store_information;
            
            // Update store details via the real store API
            if (state.storeDetails) {
              const updateData = storeServices.store.convertFromStoreInformation(storeInfoData, state.storeDetails);
              const updatedStoreDetails = await storeServices.store.updateStoreDetails(tenantId, storeId, updateData);
              
              setState(prev => ({ 
                ...prev, 
                storeDetails: updatedStoreDetails,
                hasUnsavedChanges: false 
              }));
            }
            
            // Also update legacy store settings for compatibility
            const updatedSettings = await storeServices.settings.updateStoreInformation(tenantId, storeId, data);
            setState(prev => ({ 
              ...prev, 
              settings: updatedSettings
            }));
          }
          break;
        case 'receipt':
          const receiptSettings = await storeServices.settings.updateReceiptSettings(tenantId, storeId, data);
          setState(prev => ({ ...prev, settings: receiptSettings, hasUnsavedChanges: false }));
          break;
        case 'hardware':
          const hardwareSettings = await storeServices.settings.updateHardwareConfig(tenantId, storeId, data);
          setState(prev => ({ ...prev, settings: hardwareSettings, hasUnsavedChanges: false }));
          break;
        case 'operational':
          const operationalSettings = await storeServices.settings.updateOperationalSettings(tenantId, storeId, data);
          setState(prev => ({ ...prev, settings: operationalSettings, hasUnsavedChanges: false }));
          break;
        case 'users':
          const userSettings = await storeServices.settings.updateUserManagement(tenantId, storeId, data);
          setState(prev => ({ ...prev, settings: userSettings, hasUnsavedChanges: false }));
          break;
        case 'integrations':
          const integrationSettings = await storeServices.settings.updateIntegrationSettings(tenantId, storeId, data);
          setState(prev => ({ ...prev, settings: integrationSettings, hasUnsavedChanges: false }));
          break;
        case 'api':
          const apiSettings = await storeServices.settings.updateApiInformation(tenantId, storeId, data);
          setState(prev => ({ ...prev, settings: apiSettings, hasUnsavedChanges: false }));
          break;
        case 'security':
          const securitySettings = await storeServices.settings.updateSecuritySettings(tenantId, storeId, data);
          setState(prev => ({ ...prev, settings: securitySettings, hasUnsavedChanges: false }));
          break;
        default:
          throw new Error('Invalid settings section');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setState(prev => ({
        ...prev,
        errors: { general: 'Failed to save settings. Please try again.' }
      }));
    }
  };

  if (state.isLoading) {
    return (
      <Loading
        title="Loading Store Data"
        description="Please wait while we fetch your store configuration and details..."
        fullScreen={false}
        size="md"
      />
    );
  }

  if (!state.settings || !state.storeDetails) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Store Settings</h1>
            <p className="text-slate-500 mt-1">
              Configure and manage all aspects of your point of sale system
            </p>
          </div>
        </div>
        
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No store data found</h3>
          <p className="text-sm text-slate-500 mb-6">
            Unable to load store settings and details. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Reload Page
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Store Settings"
        description={`${currentStore ? `${currentStore.store_name} - ` : ''}Configure and manage all aspects of your point of sale system`}
      />

      {/* General Error Message */}
      {state.errors.general && (
        <Alert variant="error">
          {state.errors.general}
        </Alert>
      )}

      {/* Unsaved Changes Warning */}
      {state.hasUnsavedChanges && (
        <Alert variant="warning">
          You have unsaved changes
        </Alert>
      )}

      {/* Tab Navigation */}
      <EnhancedTabs
        tabs={tabs}
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        allowOverflow={true}
      >
        {state.activeTab === 'information' && (
          <StoreInformationTab 
            settings={state.settings}
            storeDetails={state.storeDetails}
            onSave={(data) => handleSave('information', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'receipt' && (
          <ReceiptSettingsTab 
            settings={state.settings}
            onSave={(data) => handleSave('receipt', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'hardware' && (
          <HardwareConfigTab 
            settings={state.settings}
            onSave={(data) => handleSave('hardware', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'operational' && (
          <OperationalSettingsTab 
            settings={state.settings}
            onSave={(data) => handleSave('operational', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'users' && (
          <UserManagementTab 
            settings={state.settings}
            onSave={(data) => handleSave('users', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'integrations' && (
          <IntegrationsTab 
            settings={state.settings}
            onSave={(data) => handleSave('integrations', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'api' && (
          <ApiInformationTab 
            settings={state.settings}
            onSave={(data) => handleSave('api', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'security' && (
          <SecuritySettingsTab 
            settings={state.settings}
            onSave={(data) => handleSave('security', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}
      </EnhancedTabs>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={discardDialog.dialogState.isOpen}
        title={discardDialog.dialogState.title}
        message={discardDialog.dialogState.message}
        onConfirm={discardDialog.handleConfirm}
        onClose={discardDialog.closeDialog}
        variant={discardDialog.dialogState.variant}
        confirmText={discardDialog.dialogState.confirmText}
        cancelText={discardDialog.dialogState.cancelText}
        isLoading={discardDialog.dialogState.isLoading}
      />
    </div>
  );
};

// Store Information Tab Component
interface TabProps {
  settings: StoreSettings;
  storeDetails?: StoreDetails | null;
  onSave: (data: any) => void;
  onFieldChange: () => void;
}

const StoreInformationTab: React.FC<TabProps> = ({ settings, storeDetails, onSave, onFieldChange }) => {
  // Initialize form data using real store details when available, fallback to settings
  const initializeFormData = () => {
    if (storeDetails) {
      return storeServices.store.convertToStoreInformation(storeDetails);
    }
    return settings.store_information;
  };

  const [formData, setFormData] = useState(initializeFormData());

  // Update form data when storeDetails changes
  useEffect(() => {
    if (storeDetails) {
      const convertedData = storeServices.store.convertToStoreInformation(storeDetails);
      setFormData(convertedData);
    }
  }, [storeDetails]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const keys = field.split('.');
      const result = { ...prev };
      let current: any = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return result;
    });
    onFieldChange();
  };

  const handleTimingChange = (day: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      store_timing: {
        ...prev.store_timing,
        [day]: value
      }
    }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ store_information: formData });
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Store Details
            </h3>
            <p className="text-blue-600 mt-1">Configure your store's basic information and settings</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InputTextField
            label="Store ID"
            value={formData.store_id || ''}
            onChange={(value) => handleInputChange('store_id', value)}
            placeholder="Auto-generated store ID"
            disabled
            helperText="This is auto-generated and cannot be changed"
          />
        </div>

        <div>
          <InputTextField
            label="Store Name"
            required
            value={formData.store_name || ''}
            onChange={(value) => handleInputChange('store_name', value)}
            placeholder="Enter store name"
          />
        </div>

        <div>
          <DropdownSearch
            label="Location Type"
            options={LOCATION_TYPES}
            value={formData.location_type || 'retail'}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('location_type', selectedOption.id);
              }
            }}
            // Enhanced displayValue with icon and location type
            displayValue={(option) => {
              if (!option) return "Select location type";
              return (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              );
            }}
            renderOption={(option) => (
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <span>{option.label}</span>
              </div>
            )}
            placeholder="Select location type"
            searchPlaceholder="Search location types..."
          />
        </div>

        <div>
          <DropdownSearch
            label="Store Type"
            options={STORE_TYPES}
            value={formData.store_type || 'general'}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('store_type', selectedOption.id);
              }
            }}
            // Enhanced displayValue with icon and type name
            displayValue={(option) => {
              if (!option) return "Select store type";
              return (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              );
            }}
            renderOption={(option) => (
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <span>{option.label}</span>
              </div>
            )}
            placeholder="Select store type"
            searchPlaceholder="Search store types..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of your store"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
        />
      </div>

      {/* Address Information Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-xl">
            <MapPinIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Store Address
            </h3>
            <p className="text-emerald-600 mt-1">Enter your store's physical location details</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <InputTextField
          label="Address Line 1"
          required
          value={formData.address?.street1 || ''}
          onChange={(value) => handleInputChange('address.street1', value)}
          placeholder="Street address, P.O. box, company name"
        />

        <InputTextField
          label="Address Line 2"
          value={formData.address?.street2 || ''}
          onChange={(value) => handleInputChange('address.street2', value)}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputTextField
            label="City"
            required
            value={formData.address?.city || ''}
            onChange={(value) => handleInputChange('address.city', value)}
            placeholder="Enter city"
          />

          <InputTextField
            label="State/Province"
            required
            value={formData.address?.state || ''}
            onChange={(value) => handleInputChange('address.state', value)}
            placeholder="Enter state/province"
          />

          <InputTextField
            label="Postal Code"
            required
            value={formData.address?.postal_code || ''}
            onChange={(value) => handleInputChange('address.postal_code', value)}
            placeholder="Enter postal code"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DropdownSearch
            label="Country"
            required
            options={COUNTRIES}
            value={(() => {
              // Find the country option by label (since form stores the label)
              const currentCountry = COUNTRIES.find(
                country => country.label === formData.address?.country
              );
              return currentCountry?.id || '';
            })()}
            onSelect={(selectedOption) => {
              if (selectedOption && selectedOption.id !== 'separator') {
                handleInputChange('address.country', selectedOption.label);
              } else if (!selectedOption) {
                handleInputChange('address.country', '');
              }
            }}
            displayValue={(option) => {
              if (option) {
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                );
              }
              // If no option provided, try to find it by current value
              const currentCountry = COUNTRIES.find(
                country => country.label === formData.address?.country || 
                          country.id === formData.address?.country
              );
              if (currentCountry) {
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentCountry.icon}</span>
                    <span className="font-medium">{currentCountry.label}</span>
                  </div>
                );
              }
              return formData.address?.country || "Select a country";
            }}
            placeholder="Select a country"
            searchPlaceholder="Search countries..."
            renderOption={(option) => {
              // Handle separator
              if (option.id === 'separator') {
                return (
                  <div className="px-3 py-1 text-center text-gray-400 text-xs border-t border-gray-200 bg-gray-50">
                    All Countries
                  </div>
                );
              }
              
              return (
                <div className="flex items-center gap-3">
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              );
            }}
            allowClear
            clearLabel="Clear selection"
          />

          <InputTextField
            label="District"
            value={storeDetails?.address?.district || ''}
            onChange={(value) => handleInputChange('address.district', value)}
            placeholder="Enter district"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Latitude"
            value={storeDetails?.latitude || ''}
            onChange={(value) => handleInputChange('latitude', value)}
            placeholder="e.g., 40.7128"
          />

          <InputTextField
            label="Longitude"
            value={storeDetails?.longitude || ''}
            onChange={(value) => handleInputChange('longitude', value)}
            placeholder="e.g., -74.0060"
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
            <PhoneIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Contact Information
            </h3>
            <p className="text-purple-600 mt-1">Add contact details for customer communication</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Primary Phone"
          type="tel"
          value={formData.contact_info?.phone || storeDetails?.telephone1 || ''}
          onChange={(value) => handleInputChange('contact_info.phone', value)}
          placeholder="Enter primary phone number"
        />

        <InputTextField
          label="Secondary Phone"
          type="tel"
          value={storeDetails?.telephone2 || ''}
          onChange={(value) => handleInputChange('telephone2', value)}
          placeholder="Enter secondary phone number"
        />

        <InputTextField
          label="Email Address"
          type="email"
          value={formData.contact_info?.email || storeDetails?.email || ''}
          onChange={(value) => handleInputChange('contact_info.email', value)}
          placeholder="Enter email address"
        />

        <InputTextField
          label="Website"
          type="url"
          value={formData.contact_info?.website || ''}
          onChange={(value) => handleInputChange('contact_info.website', value)}
          placeholder="Enter website URL"
        />
      </div>

      {/* Legal Entity Information Section */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
              Legal Entity Information
            </h3>
            <p className="text-amber-600 mt-1">Configure legal entity details for compliance</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Legal Entity ID"
          value={storeDetails?.legal_entity_id || ''}
          onChange={(value) => handleInputChange('legal_entity_id', value)}
          placeholder="Enter legal entity ID"
        />

        <InputTextField
          label="Legal Entity Name"
          value={storeDetails?.legal_entity_name || ''}
          onChange={(value) => handleInputChange('legal_entity_name', value)}
          placeholder="Enter legal entity name"
        />
      </div>

      {/* Store Timing Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              Store Operating Hours
            </h3>
            <p className="text-green-600 mt-1">Configure your store's operating schedule</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holidays'].map((day) => (
          <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-gray-700">{day}</span>
            </div>
            <div className="md:col-span-2">
              <InputTextField
                label=""
                value={storeDetails?.store_timing?.[day as keyof typeof storeDetails.store_timing] || ''}
                onChange={(value) => handleTimingChange(day, value)}
                placeholder={day === 'Holidays' ? 'Closed' : '09:00-18:00'}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
        
      <div className="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-green-800 mb-2">Format Guide</h4>
            <p className="text-sm text-green-700">
              Use 24-hour format (e.g., "09:00-18:00") or "Closed" for non-operating days.
              Separate multiple time slots with commas (e.g., "09:00-12:00,14:00-18:00").
            </p>
          </div>
        </div>
      </div>

      {/* Regional Settings Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-xl">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Regional Settings
            </h3>
            <p className="text-indigo-600 mt-1">Configure locale and currency preferences</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DropdownSearch
            label="Locale"
            options={LOCALES}
            value={formData.locale || 'en-US'}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('locale', selectedOption.id);
              }
            }}
            // Enhanced displayValue with flag and locale code
            displayValue={(option) => {
              if (!option) return "Select locale";
              return (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.id}</span>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-600">{option.label.split(' (')[0]}</span>
                </div>
              );
            }}
            renderOption={(option) => (
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <span>{option.label}</span>
              </div>
            )}
            placeholder="Select locale"
            searchPlaceholder="Search locales..."
          />
        </div>

        <div>
          <DropdownSearch
            label="Currency"
            options={CURRENCIES}
            value={formData.currency || 'USD'}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('currency', selectedOption.id);
              }
            }}
            // Enhanced displayValue with currency symbol and code
            displayValue={(option) => {
              if (!option) return "Select currency";
              return (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600 min-w-[20px]">{option.icon}</span>
                  <span className="font-medium">{option.id}</span>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-600">{option.label.split(' - ')[1]}</span>
                </div>
              );
            }}
            renderOption={(option) => (
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold min-w-[24px]">{option.icon}</span>
                <span>{option.label}</span>
              </div>
            )}
            placeholder="Select currency"
            searchPlaceholder="Search currencies..."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Store Information
        </Button>
      </div>
    </div>
  );
};

// Placeholder components for other tabs (simplified for initial implementation)
const ReceiptSettingsTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.receipt_settings);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onFieldChange();
  };

  const handleCustomFieldChange = (index: number, field: string, value: any) => {
    const updatedFields = [...formData.custom_fields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setFormData(prev => ({ ...prev, custom_fields: updatedFields }));
    onFieldChange();
  };

  const addCustomField = () => {
    const newField = { name: '', value: '', position: 'footer' as const };
    setFormData(prev => ({ 
      ...prev, 
      custom_fields: [...prev.custom_fields, newField] 
    }));
    onFieldChange();
  };

  const removeCustomField = (index: number) => {
    const updatedFields = formData.custom_fields.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, custom_fields: updatedFields }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ receipt_settings: formData });
  };

  return (
    <div className="space-y-6">
      {/* Receipt Template */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Receipt Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Header Text
            </label>
            <textarea
              value={formData.header_text || ''}
              onChange={(e) => handleFieldChange('header_text', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Welcome to our store!"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Footer Text
            </label>
            <textarea
              value={formData.footer_text || ''}
              onChange={(e) => handleFieldChange('footer_text', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Thank you for your business!"
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PropertyCheckbox
            title="Show Logo"
            description="Display store logo on receipts"
            checked={formData.show_logo}
            onChange={(checked) => handleFieldChange('show_logo', checked)}
          />
          
          <PropertyCheckbox
            title="Show Barcode"
            description="Include transaction barcode on receipts"
            checked={formData.show_barcode}
            onChange={(checked) => handleFieldChange('show_barcode', checked)}
          />
          
          <PropertyCheckbox
            title="Show QR Code"
            description="Display QR code for digital receipt access"
            checked={formData.show_qr_code}
            onChange={(checked) => handleFieldChange('show_qr_code', checked)}
          />
        </div>
      </Card>

      {/* Receipt Content Options */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Receipt Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PropertyCheckbox
            title="Show Customer Info"
            description="Display customer information on receipts"
            checked={formData.show_customer_info}
            onChange={(checked) => handleFieldChange('show_customer_info', checked)}
          />
          
          <PropertyCheckbox
            title="Show Tax Breakdown"
            description="Include detailed tax calculations"
            checked={formData.show_tax_breakdown}
            onChange={(checked) => handleFieldChange('show_tax_breakdown', checked)}
          />
          
          <PropertyCheckbox
            title="Show Payment Details"
            description="Display payment method information"
            checked={formData.show_payment_details}
            onChange={(checked) => handleFieldChange('show_payment_details', checked)}
          />
        </div>
      </Card>

      {/* Printer Configuration */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Printer Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paper Size
            </label>
            <select
              value={formData.paper_size}
              onChange={(e) => handleFieldChange('paper_size', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="thermal_58mm">Thermal 58mm</option>
              <option value="thermal_80mm">Thermal 80mm</option>
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Copies
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.print_copies}
              onChange={(e) => handleFieldChange('print_copies', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <PropertyCheckbox
            title="Auto Print Receipt After Sale"
            description="Automatically print receipts when transactions are completed"
            checked={formData.auto_print}
            onChange={(checked) => handleFieldChange('auto_print', checked)}
          />
        </div>
      </Card>

      {/* Custom Fields */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Custom Fields</h3>
        <div className="space-y-4">
          {formData.custom_fields.map((field, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl">
              <div className="flex-1">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Field name"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Field value"
                />
              </div>
              <div>
                <select
                  value={field.position}
                  onChange={(e) => handleCustomFieldChange(index, 'position', e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeCustomField(index)}
                className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addCustomField}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-xl hover:bg-blue-50"
          >
            <PlusIcon className="h-4 w-4 mr-1 inline" />
            Add Custom Field
          </button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Receipt Settings
        </Button>
      </div>
    </div>
  );
};

const HardwareConfigTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.hardware_config);

  const handleBarcodeFieldChange = (field: keyof typeof formData.barcode_scanner, value: any) => {
    setFormData(prev => ({
      ...prev,
      barcode_scanner: {
        ...prev.barcode_scanner,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handlePrinterFieldChange = (field: keyof typeof formData.receipt_printer, value: any) => {
    setFormData(prev => ({
      ...prev,
      receipt_printer: {
        ...prev.receipt_printer,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleCashDrawerFieldChange = (field: keyof typeof formData.cash_drawer, value: any) => {
    setFormData(prev => ({
      ...prev,
      cash_drawer: {
        ...prev.cash_drawer,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleDisplayFieldChange = (field: keyof typeof formData.customer_display, value: any) => {
    setFormData(prev => ({
      ...prev,
      customer_display: {
        ...prev.customer_display,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ hardware_config: formData });
  };

  return (
    <div className="space-y-6">
      {/* Barcode Scanner */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Barcode Scanner</h3>
        <div className="space-y-4">
          <PropertyCheckbox
            title="Enable Barcode Scanner"
            description="Allow barcode scanning for product identification"
            checked={formData.barcode_scanner.enabled}
            onChange={(checked) => handleBarcodeFieldChange('enabled', checked)}
          />

          {formData.barcode_scanner.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prefix
                </label>
                <input
                  type="text"
                  value={formData.barcode_scanner.prefix || ''}
                  onChange={(e) => handleBarcodeFieldChange('prefix', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional prefix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Suffix
                </label>
                <input
                  type="text"
                  value={formData.barcode_scanner.suffix || ''}
                  onChange={(e) => handleBarcodeFieldChange('suffix', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional suffix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Length
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.barcode_scanner.min_length || ''}
                  onChange={(e) => handleBarcodeFieldChange('min_length', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min barcode length"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Length
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.barcode_scanner.max_length || ''}
                  onChange={(e) => handleBarcodeFieldChange('max_length', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Max barcode length"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Receipt Printer */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Receipt Printer</h3>
        <div className="space-y-4">
          <PropertyCheckbox
            title="Enable Receipt Printer"
            description="Allow printing receipts to a connected printer"
            checked={formData.receipt_printer.enabled}
            onChange={(checked) => handlePrinterFieldChange('enabled', checked)}
          />

          {formData.receipt_printer.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Printer Name
                </label>
                <input
                  type="text"
                  value={formData.receipt_printer.printer_name || ''}
                  onChange={(e) => handlePrinterFieldChange('printer_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Printer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Connection Type
                </label>
                <select
                  value={formData.receipt_printer.connection_type}
                  onChange={(e) => handlePrinterFieldChange('connection_type', e.target.value as 'usb' | 'network' | 'bluetooth')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="usb">USB</option>
                  <option value="network">Network</option>
                  <option value="bluetooth">Bluetooth</option>
                </select>
              </div>
              {formData.receipt_printer.connection_type === 'network' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      IP Address
                    </label>
                    <input
                      type="text"
                      value={formData.receipt_printer.ip_address || ''}
                      onChange={(e) => handlePrinterFieldChange('ip_address', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Port
                    </label>
                    <input
                      type="number"
                      value={formData.receipt_printer.port || ''}
                      onChange={(e) => handlePrinterFieldChange('port', parseInt(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9100"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Cash Drawer */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Cash Drawer</h3>
        <div className="space-y-4">
          <PropertyCheckbox
            title="Enable Cash Drawer"
            description="Connect and control a cash drawer for cash transactions"
            checked={formData.cash_drawer.enabled}
            onChange={(checked) => handleCashDrawerFieldChange('enabled', checked)}
          />

          {formData.cash_drawer.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <PropertyCheckbox
                title="Auto Open Drawer"
                description="Automatically open cash drawer for cash transactions"
                checked={formData.cash_drawer.auto_open}
                onChange={(checked) => handleCashDrawerFieldChange('auto_open', checked)}
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trigger Event
                </label>
                <select
                  value={formData.cash_drawer.trigger_event}
                  onChange={(e) => handleCashDrawerFieldChange('trigger_event', e.target.value as 'sale_complete' | 'payment_received')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sale_complete">Sale Complete</option>
                  <option value="payment_received">Payment Received</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Customer Display */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Display</h3>
        <div className="space-y-4">
          <PropertyCheckbox
            title="Enable Customer Display"
            description="Show transaction details on a customer-facing display"
            checked={formData.customer_display.enabled}
            onChange={(checked) => handleDisplayFieldChange('enabled', checked)}
          />

          {formData.customer_display.enabled && (
            <div className="text-sm text-slate-600">
              Customer display settings can be configured here when enabled.
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Hardware Configuration
        </Button>
      </div>
    </div>
  );
};

const OperationalSettingsTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.operational_settings);

  const handleInventoryFieldChange = (field: keyof typeof formData.inventory_alerts, value: any) => {
    setFormData(prev => ({
      ...prev,
      inventory_alerts: {
        ...prev.inventory_alerts,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleReturnFieldChange = (field: keyof typeof formData.return_policy, value: any) => {
    setFormData(prev => ({
      ...prev,
      return_policy: {
        ...prev.return_policy,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleDiscountFieldChange = (field: keyof typeof formData.discount_settings, value: any) => {
    setFormData(prev => ({
      ...prev,
      discount_settings: {
        ...prev.discount_settings,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleTransactionFieldChange = (field: keyof typeof formData.transaction_settings, value: any) => {
    setFormData(prev => ({
      ...prev,
      transaction_settings: {
        ...prev.transaction_settings,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ operational_settings: formData });
  };

  return (
    <div className="space-y-6">
      {/* Inventory Alerts */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Inventory Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventory_alerts.low_stock_threshold}
              onChange={(e) => handleInventoryFieldChange('low_stock_threshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reorder Point
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventory_alerts.reorder_point || ''}
              onChange={(e) => handleInventoryFieldChange('reorder_point', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reorder Quantity
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventory_alerts.reorder_quantity || ''}
              onChange={(e) => handleInventoryFieldChange('reorder_quantity', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50"
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PropertyCheckbox
            title="Out of Stock Notifications"
            description="Receive alerts when products are out of stock"
            checked={formData.inventory_alerts.out_of_stock_notifications}
            onChange={(checked) => handleInventoryFieldChange('out_of_stock_notifications', checked)}
          />
          
          <PropertyCheckbox
            title="Allow Negative Inventory"
            description="Permit selling items with negative stock levels"
            checked={formData.inventory_alerts.negative_inventory_allowed}
            onChange={(checked) => handleInventoryFieldChange('negative_inventory_allowed', checked)}
          />
          
          <PropertyCheckbox
            title="Auto Reorder"
            description="Automatically create reorder requests at reorder point"
            checked={formData.inventory_alerts.auto_reorder}
            onChange={(checked) => handleInventoryFieldChange('auto_reorder', checked)}
          />
        </div>
      </Card>

      {/* Return Policy */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Return Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Return Period (Days)
            </label>
            <input
              type="number"
              min="0"
              value={formData.return_policy.return_period_days}
              onChange={(e) => handleReturnFieldChange('return_period_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
            />
          </div>
          <InputMoneyField
            label="Restocking Fee (%)"
            value={formData.return_policy.restocking_fee_percentage?.toString() || ''}
            onChange={(value) => handleReturnFieldChange('restocking_fee_percentage', parseFloat(value) || undefined)}
            placeholder="0.00"
            min={0}
            max={100}
            step={0.01}
            currencySymbol="%"
            currencyPosition="after"
          />
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PropertyCheckbox
            title="Allow Returns"
            description="Enable customers to return purchased items"
            checked={formData.return_policy.returns_allowed}
            onChange={(checked) => handleReturnFieldChange('returns_allowed', checked)}
          />
          
          <PropertyCheckbox
            title="Require Receipt"
            description="Require receipt for processing returns"
            checked={formData.return_policy.require_receipt}
            onChange={(checked) => handleReturnFieldChange('require_receipt', checked)}
          />
          
          <PropertyCheckbox
            title="Allow Partial Returns"
            description="Enable partial quantity returns for items"
            checked={formData.return_policy.partial_returns_allowed}
            onChange={(checked) => handleReturnFieldChange('partial_returns_allowed', checked)}
          />
          
          <PropertyCheckbox
            title="Allow Exchanges"
            description="Enable product exchanges instead of refunds"
            checked={formData.return_policy.exchange_allowed}
            onChange={(checked) => handleReturnFieldChange('exchange_allowed', checked)}
          />
        </div>
      </Card>

      {/* Discount Settings */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Discount Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputMoneyField
            label="Maximum Discount (%)"
            value={formData.discount_settings.max_discount_percentage?.toString() || ''}
            onChange={(value) => handleDiscountFieldChange('max_discount_percentage', parseFloat(value) || 0)}
            placeholder="25.00"
            min={0}
            max={100}
            step={0.01}
            currencySymbol="%"
            currencyPosition="after"
          />
          
          <InputMoneyField
            label="Approval Threshold (%)"
            value={formData.discount_settings.approval_threshold_percentage?.toString() || ''}
            onChange={(value) => handleDiscountFieldChange('approval_threshold_percentage', parseFloat(value) || 0)}
            placeholder="10.00"
            min={0}
            max={100}
            step={0.01}
            currencySymbol="%"
            currencyPosition="after"
          />
          
          <InputMoneyField
            label="Employee Discount (%)"
            value={formData.discount_settings.employee_discount_percentage?.toString() || ''}
            onChange={(value) => handleDiscountFieldChange('employee_discount_percentage', parseFloat(value) || undefined)}
            placeholder="15.00"
            min={0}
            max={100}
            step={0.01}
            currencySymbol="%"
            currencyPosition="after"
            disabled={!formData.discount_settings.employee_discount_allowed}
          />
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PropertyCheckbox
            title="Manager Approval Required"
            description="Require manager approval for discounts above threshold"
            checked={formData.discount_settings.manager_approval_required}
            onChange={(checked) => handleDiscountFieldChange('manager_approval_required', checked)}
          />
          
          <PropertyCheckbox
            title="Employee Discount Allowed"
            description="Allow employees to apply special discount rates"
            checked={formData.discount_settings.employee_discount_allowed}
            onChange={(checked) => handleDiscountFieldChange('employee_discount_allowed', checked)}
          />
        </div>
      </Card>

      {/* Transaction Settings */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Transaction Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity Limit Per Item
            </label>
            <input
              type="number"
              min="1"
              value={formData.transaction_settings.quantity_limit_per_item || ''}
              onChange={(e) => handleTransactionFieldChange('quantity_limit_per_item', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
            />
          </div>
          
          <InputMoneyField
            label="Minimum Sale Amount"
            value={formData.transaction_settings.minimum_sale_amount?.toString() || ''}
            onChange={(value) => handleTransactionFieldChange('minimum_sale_amount', parseFloat(value) || undefined)}
            placeholder="0.00"
            min={0}
            step={0.01}
          />
          
          <InputMoneyField
            label="Maximum Sale Amount"
            value={formData.transaction_settings.maximum_sale_amount?.toString() || ''}
            onChange={(value) => handleTransactionFieldChange('maximum_sale_amount', parseFloat(value) || undefined)}
            placeholder="10000.00"
            min={0}
            step={0.01}
          />
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PropertyCheckbox
            title="Void Requires Approval"
            description="Require manager approval to void transactions"
            checked={formData.transaction_settings.void_requires_approval}
            onChange={(checked) => handleTransactionFieldChange('void_requires_approval', checked)}
          />
          
          <PropertyCheckbox
            title="Refund Requires Approval"  
            description="Require manager approval for refund transactions"
            checked={formData.transaction_settings.refund_requires_approval}
            onChange={(checked) => handleTransactionFieldChange('refund_requires_approval', checked)}
          />
          
          <PropertyCheckbox
            title="Allow Price Override"
            description="Allow cashiers to override product prices"
            checked={formData.transaction_settings.price_override_allowed}
            onChange={(checked) => handleTransactionFieldChange('price_override_allowed', checked)}
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Operational Settings
        </Button>
      </div>
    </div>
  );
};

const UserManagementTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.user_management);

  const handlePasswordPolicyChange = (field: keyof typeof formData.password_policy, value: any) => {
    setFormData(prev => ({
      ...prev,
      password_policy: {
        ...prev.password_policy,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleSessionSettingsChange = (field: keyof typeof formData.session_settings, value: any) => {
    setFormData(prev => ({
      ...prev,
      session_settings: {
        ...prev.session_settings,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ user_management: formData });
  };

  return (
    <div className="space-y-6">
      {/* User Roles */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">User Roles</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Role
            </label>
            <select
              value={formData.default_role}
              onChange={(e) => setFormData(prev => ({ ...prev, default_role: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {formData.roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="text-md font-medium text-slate-800 mb-3">Available Roles</h4>
            <div className="space-y-3">
              {formData.roles.map((role) => (
                <div key={role.role_id} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-slate-900">{role.role_name}</h5>
                      <p className="text-sm text-slate-600">{role.description}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {role.permissions.length} permissions
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                      >
                        {permission}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Password Policy */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Minimum Length
            </label>
            <input
              type="number"
              min="4"
              max="50"
              value={formData.password_policy.min_length}
              onChange={(e) => handlePasswordPolicyChange('min_length', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password Expiry (Days)
            </label>
            <input
              type="number"
              min="0"
              value={formData.password_policy.password_expiry_days || ''}
              onChange={(e) => handlePasswordPolicyChange('password_expiry_days', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="90 (0 = never expires)"
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireUppercase"
              checked={formData.password_policy.require_uppercase}
              onChange={(e) => handlePasswordPolicyChange('require_uppercase', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="requireUppercase" className="ml-2 text-sm text-slate-700">
              Require Uppercase Letters
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireLowercase"
              checked={formData.password_policy.require_lowercase}
              onChange={(e) => handlePasswordPolicyChange('require_lowercase', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="requireLowercase" className="ml-2 text-sm text-slate-700">
              Require Lowercase Letters
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireNumbers"
              checked={formData.password_policy.require_numbers}
              onChange={(e) => handlePasswordPolicyChange('require_numbers', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="requireNumbers" className="ml-2 text-sm text-slate-700">
              Require Numbers
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireSymbols"
              checked={formData.password_policy.require_symbols}
              onChange={(e) => handlePasswordPolicyChange('require_symbols', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="requireSymbols" className="ml-2 text-sm text-slate-700">
              Require Special Characters
            </label>
          </div>
        </div>
      </Card>

      {/* Session Settings */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Session Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={formData.session_settings.session_timeout_minutes}
              onChange={(e) => handleSessionSettingsChange('session_timeout_minutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max Concurrent Sessions
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.session_settings.max_concurrent_sessions}
              onChange={(e) => handleSessionSettingsChange('max_concurrent_sessions', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="3"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <PropertyCheckbox
            title="Auto Logout on Idle"
            description="Automatically log out users after idle timeout period"
            checked={formData.session_settings.auto_logout_on_idle}
            onChange={(checked) => handleSessionSettingsChange('auto_logout_on_idle', checked)}
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save User Management Settings
        </Button>
      </div>
    </div>
  );
};

const IntegrationsTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.integration_settings);

  const handlePaymentProcessorChange = (index: number, field: string, value: any) => {
    const updatedProcessors = [...formData.payment_processors];
    updatedProcessors[index] = { ...updatedProcessors[index], [field]: value };
    setFormData(prev => ({ ...prev, payment_processors: updatedProcessors }));
    onFieldChange();
  };

  const handleAccountingChange = (field: keyof typeof formData.accounting_software, value: any) => {
    setFormData(prev => ({
      ...prev,
      accounting_software: {
        ...prev.accounting_software,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleEcommerceChange = (index: number, field: string, value: any) => {
    const updatedPlatforms = [...formData.ecommerce_platforms];
    updatedPlatforms[index] = { ...updatedPlatforms[index], [field]: value };
    setFormData(prev => ({ ...prev, ecommerce_platforms: updatedPlatforms }));
    onFieldChange();
  };

  const handleEmailServiceChange = (field: keyof typeof formData.email_service, value: any) => {
    setFormData(prev => ({
      ...prev,
      email_service: {
        ...prev.email_service,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleSmtpSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      email_service: {
        ...prev.email_service,
        smtp_settings: {
          ...prev.email_service.smtp_settings,
          [field]: value
        } as NonNullable<typeof prev.email_service.smtp_settings>
      }
    }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ integration_settings: formData });
  };

  return (
    <div className="space-y-6">
      {/* Payment Processors */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Processors</h3>
        <div className="space-y-4">
          {formData.payment_processors.map((processor, index) => (
            <div key={processor.provider_id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900">{processor.provider_name}</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`processor-enabled-${index}`}
                      checked={processor.enabled}
                      onChange={(e) => handlePaymentProcessorChange(index, 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`processor-enabled-${index}`} className="ml-2 text-sm text-slate-700">
                      Enabled
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`processor-test-${index}`}
                      checked={processor.test_mode}
                      onChange={(e) => handlePaymentProcessorChange(index, 'test_mode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`processor-test-${index}`} className="ml-2 text-sm text-slate-700">
                      Test Mode
                    </label>
                  </div>
                </div>
              </div>
              {processor.enabled && (
                <div className="text-sm text-slate-600">
                  <p>Provider ID: {processor.provider_id}</p>
                  <p className="mt-1">Configuration settings can be managed here.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Accounting Software */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Accounting Software</h3>
        <div className="space-y-4">
          <PropertyCheckbox
            title="Enable Accounting Integration"
            description="Sync sales data with your accounting software"
            checked={formData.accounting_software.enabled}
            onChange={(checked) => handleAccountingChange('enabled', checked)}
          />

          {formData.accounting_software.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Provider
                </label>
                <select
                  value={formData.accounting_software.provider || ''}
                  onChange={(e) => handleAccountingChange('provider', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Provider</option>
                  <option value="quickbooks">QuickBooks</option>
                  <option value="xero">Xero</option>
                  <option value="sage">Sage</option>
                  <option value="zoho">Zoho Books</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sync Frequency
                </label>
                <select
                  value={formData.accounting_software.sync_frequency}
                  onChange={(e) => handleAccountingChange('sync_frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="real_time">Real Time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <PropertyCheckbox
                  title="Enable Auto Sync"
                  description="Automatically sync data at specified intervals"
                  checked={formData.accounting_software.auto_sync}
                  onChange={(checked) => handleAccountingChange('auto_sync', checked)}
                />
                {formData.accounting_software.last_sync && (
                  <p className="text-sm text-slate-500 mt-2">
                    Last sync: {new Date(formData.accounting_software.last_sync).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* E-commerce Platforms */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">E-commerce Platforms</h3>
        <div className="space-y-4">
          {formData.ecommerce_platforms.map((platform, index) => (
            <div key={platform.platform_id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900">{platform.platform_name}</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`platform-enabled-${index}`}
                    checked={platform.enabled}
                    onChange={(e) => handleEcommerceChange(index, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor={`platform-enabled-${index}`} className="ml-2 text-sm text-slate-700">
                    Enabled
                  </label>
                </div>
              </div>
              {platform.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`sync-inventory-${index}`}
                      checked={platform.sync_inventory}
                      onChange={(e) => handleEcommerceChange(index, 'sync_inventory', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`sync-inventory-${index}`} className="ml-2 text-sm text-slate-700">
                      Sync Inventory
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`sync-customers-${index}`}
                      checked={platform.sync_customers}
                      onChange={(e) => handleEcommerceChange(index, 'sync_customers', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`sync-customers-${index}`} className="ml-2 text-sm text-slate-700">
                      Sync Customers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`sync-orders-${index}`}
                      checked={platform.sync_orders}
                      onChange={(e) => handleEcommerceChange(index, 'sync_orders', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`sync-orders-${index}`} className="ml-2 text-sm text-slate-700">
                      Sync Orders
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Email Service */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Service</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailEnabled"
              checked={formData.email_service.enabled}
              onChange={(e) => handleEmailServiceChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="emailEnabled" className="ml-2 text-sm text-slate-700">
              Enable Email Service
            </label>
          </div>

          {formData.email_service.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Provider
                </label>
                <select
                  value={formData.email_service.provider || ''}
                  onChange={(e) => handleEmailServiceChange('provider', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Provider</option>
                  <option value="smtp">Custom SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">Amazon SES</option>
                </select>
              </div>

              {formData.email_service.provider === 'smtp' && formData.email_service.smtp_settings && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <h4 className="font-medium text-slate-900 mb-4">SMTP Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Host
                      </label>
                      <input
                        type="text"
                        value={formData.email_service.smtp_settings.host}
                        onChange={(e) => handleSmtpSettingsChange('host', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        value={formData.email_service.smtp_settings.port}
                        onChange={(e) => handleSmtpSettingsChange('port', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.email_service.smtp_settings.username}
                        onChange={(e) => handleSmtpSettingsChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your-email@domain.com"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useSSL"
                        checked={formData.email_service.smtp_settings.use_ssl}
                        onChange={(e) => handleSmtpSettingsChange('use_ssl', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <label htmlFor="useSSL" className="ml-2 text-sm text-slate-700">
                        Use SSL/TLS
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Integration Settings
        </Button>
      </div>
    </div>
  );
};

const SecuritySettingsTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.security_settings);

  const handleDataBackupChange = (field: keyof typeof formData.data_backup, value: any) => {
    setFormData(prev => ({
      ...prev,
      data_backup: {
        ...prev.data_backup,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleAuditLogsChange = (field: keyof typeof formData.audit_logs, value: any) => {
    setFormData(prev => ({
      ...prev,
      audit_logs: {
        ...prev.audit_logs,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleComplianceChange = (field: keyof typeof formData.compliance, value: any) => {
    setFormData(prev => ({
      ...prev,
      compliance: {
        ...prev.compliance,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleSecurityPoliciesChange = (field: keyof typeof formData.security_policies, value: any) => {
    setFormData(prev => ({
      ...prev,
      security_policies: {
        ...prev.security_policies,
        [field]: value
      }
    }));
    onFieldChange();
  };

  const handleEventsToLogChange = (event: string, checked: boolean) => {
    const updatedEvents = checked
      ? [...formData.audit_logs.events_to_log, event]
      : formData.audit_logs.events_to_log.filter(e => e !== event);
    
    setFormData(prev => ({
      ...prev,
      audit_logs: {
        ...prev.audit_logs,
        events_to_log: updatedEvents
      }
    }));
    onFieldChange();
  };

  const handleAllowedIpChange = (index: number, value: string) => {
    const updatedIps = [...(formData.security_policies.allowed_ip_addresses || [])];
    updatedIps[index] = value;
    setFormData(prev => ({
      ...prev,
      security_policies: {
        ...prev.security_policies,
        allowed_ip_addresses: updatedIps
      }
    }));
    onFieldChange();
  };

  const addAllowedIp = () => {
    const updatedIps = [...(formData.security_policies.allowed_ip_addresses || []), ''];
    setFormData(prev => ({
      ...prev,
      security_policies: {
        ...prev.security_policies,
        allowed_ip_addresses: updatedIps
      }
    }));
    onFieldChange();
  };

  const removeAllowedIp = (index: number) => {
    const updatedIps = (formData.security_policies.allowed_ip_addresses || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      security_policies: {
        ...prev.security_policies,
        allowed_ip_addresses: updatedIps
      }
    }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ security_settings: formData });
  };

  const auditEvents = [
    'user_login',
    'user_logout',
    'transaction_create',
    'transaction_void',
    'transaction_refund',
    'price_override',
    'discount_apply',
    'inventory_adjust',
    'settings_change',
    'user_create',
    'user_update',
    'user_delete'
  ];

  return (
    <div className="space-y-6">
      {/* Data Backup */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Backup</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="backupEnabled"
              checked={formData.data_backup.enabled}
              onChange={(e) => handleDataBackupChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="backupEnabled" className="ml-2 text-sm text-slate-700">
              Enable Automatic Backups
            </label>
          </div>

          {formData.data_backup.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={formData.data_backup.backup_frequency}
                  onChange={(e) => handleDataBackupChange('backup_frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Backup Time
                </label>
                <input
                  type="time"
                  value={formData.data_backup.backup_time}
                  onChange={(e) => handleDataBackupChange('backup_time', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Retention Period (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.data_backup.retention_days}
                  onChange={(e) => handleDataBackupChange('retention_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <PropertyCheckbox
                title="Enable Cloud Backup"
                description="Store backups securely in the cloud"
                checked={formData.data_backup.cloud_backup_enabled}
                onChange={(checked) => handleDataBackupChange('cloud_backup_enabled', checked)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Audit Logs</h3>
        <div className="space-y-4">
          <PropertyCheckbox
            title="Enable Audit Logging"
            description="Track and log system activities for security monitoring"
            checked={formData.audit_logs.enabled}
            onChange={(checked) => handleAuditLogsChange('enabled', checked)}
          />

          {formData.audit_logs.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Log Level
                  </label>
                  <select
                    value={formData.audit_logs.log_level}
                    onChange={(e) => handleAuditLogsChange('log_level', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="detailed">Detailed</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Retention Period (Days)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="2555"
                    value={formData.audit_logs.retention_days}
                    onChange={(e) => handleAuditLogsChange('retention_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Events to Log
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {auditEvents.map((event) => (
                    <div key={event} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`event-${event}`}
                        checked={formData.audit_logs.events_to_log.includes(event)}
                        onChange={(e) => handleEventsToLogChange(event, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <label htmlFor={`event-${event}`} className="ml-2 text-sm text-slate-700">
                        {event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Compliance */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PropertyCheckbox
            title="PCI Compliance"
            description="Enable Payment Card Industry compliance features"
            checked={formData.compliance.pci_compliance_enabled}
            onChange={(checked) => handleComplianceChange('pci_compliance_enabled', checked)}
          />
          
          <PropertyCheckbox
            title="GDPR Compliance"
            description="Enable General Data Protection Regulation compliance"
            checked={formData.compliance.gdpr_compliance_enabled}
            onChange={(checked) => handleComplianceChange('gdpr_compliance_enabled', checked)}
          />
          
          <PropertyCheckbox
            title="Data Encryption"
            description="Enable encryption for sensitive data storage"
            checked={formData.compliance.data_encryption_enabled}
            onChange={(checked) => handleComplianceChange('data_encryption_enabled', checked)}
          />
          
          <PropertyCheckbox
            title="Access Logging"
            description="Log all system access attempts and activities"
            checked={formData.compliance.access_logging_enabled}
            onChange={(checked) => handleComplianceChange('access_logging_enabled', checked)}
          />
        </div>
      </Card>

      {/* Security Policies */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Policies</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Failed Login Attempts Limit
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={formData.security_policies.failed_login_attempts_limit}
                onChange={(e) => handleSecurityPoliciesChange('failed_login_attempts_limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={formData.security_policies.account_lockout_duration_minutes}
                onChange={(e) => handleSecurityPoliciesChange('account_lockout_duration_minutes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PropertyCheckbox
              title="Require Two-Factor Authentication"
              description="Mandate 2FA for all user accounts"
              checked={formData.security_policies.two_factor_authentication_required}
              onChange={(checked) => handleSecurityPoliciesChange('two_factor_authentication_required', checked)}
            />
            
            <PropertyCheckbox
              title="IP Whitelist Enabled"
              description="Restrict access to specified IP addresses only"
              checked={formData.security_policies.ip_whitelist_enabled}
              onChange={(checked) => handleSecurityPoliciesChange('ip_whitelist_enabled', checked)}
            />
          </div>

          {formData.security_policies.ip_whitelist_enabled && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Allowed IP Addresses
              </label>
              <div className="space-y-2">
                {(formData.security_policies.allowed_ip_addresses || []).map((ip, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => handleAllowedIpChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="192.168.1.0/24"
                    />
                    <button
                      type="button"
                      onClick={() => removeAllowedIp(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAllowedIp}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-xl hover:bg-blue-50"
                >
                  <PlusIcon className="h-4 w-4 mr-1 inline" />
                  Add IP Address
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Security Settings
        </Button>
      </div>
    </div>
  );
};

// API Information Tab Component
const ApiInformationTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.api_information);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      const result = { ...prev };
      let current: any = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return result;
    });
    onFieldChange();
  };

  const handleEndpointChange = (endpoint: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endpoints: { ...prev.endpoints, [endpoint]: value }
    }));
    onFieldChange();
  };

  const handleSupportedEventChange = (index: number, value: string) => {
    const updatedEvents = [...formData.webhooks.supported_events];
    updatedEvents[index] = value;
    setFormData(prev => ({
      ...prev,
      webhooks: { ...prev.webhooks, supported_events: updatedEvents }
    }));
    onFieldChange();
  };

  const addSupportedEvent = () => {
    setFormData(prev => ({
      ...prev,
      webhooks: {
        ...prev.webhooks,
        supported_events: [...prev.webhooks.supported_events, '']
      }
    }));
    onFieldChange();
  };

  const removeSupportedEvent = (index: number) => {
    const updatedEvents = formData.webhooks.supported_events.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      webhooks: { ...prev.webhooks, supported_events: updatedEvents }
    }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ api_information: formData });
  };

  return (
    <div className="space-y-6">
      {/* API Version & Base URL */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ServerIcon className="h-5 w-5 mr-2" />
          API Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="API Version"
            value={formData.api_version}
            onChange={(value) => handleFieldChange('api_version', value)}
            placeholder="v1.0.0"
            helperText="Current API version being used"
          />

          <InputTextField
            label="Base URL"
            value={formData.base_url}
            onChange={(value) => handleFieldChange('base_url', value)}
            placeholder="https://api.yourstore.com/v1"
            helperText="Base URL for all API endpoints"
          />
        </div>
      </Card>

      {/* API Endpoints */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.endpoints).map(([key, value]) => (
            <InputTextField
              key={key}
              label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={value}
              onChange={(newValue) => handleEndpointChange(key, newValue)}
              placeholder={`/${key.replace(/_/g, '-')}`}
            />
          ))}
        </div>
      </Card>

      {/* Authentication Settings */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Authentication</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Authentication Method
            </label>
            <select
              value={formData.authentication.method}
              onChange={(e) => handleFieldChange('authentication.method', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bearer_token">Bearer Token</option>
              <option value="api_key">API Key</option>
              <option value="oauth2">OAuth 2.0</option>
            </select>
          </div>

          <InputTextField
            label="Token Expires In (seconds)"
            type="number"
            value={formData.authentication.token_expires_in?.toString() || ''}
            onChange={(value) => handleFieldChange('authentication.token_expires_in', parseInt(value) || undefined)}
            placeholder="3600"
          />

          <div className="flex items-center">
            <PropertyCheckbox
              title="Refresh Token Enabled"
              description="Allow token refresh without re-authentication"
              checked={formData.authentication.refresh_token_enabled}
              onChange={(checked) => handleFieldChange('authentication.refresh_token_enabled', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Rate Limiting */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Rate Limiting</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <PropertyCheckbox
              title="Rate Limiting Enabled"
              description="Enable API rate limiting"
              checked={formData.rate_limiting.enabled}
              onChange={(checked) => handleFieldChange('rate_limiting.enabled', checked)}
            />
          </div>

          <InputTextField
            label="Requests Per Minute"
            type="number"
            value={formData.rate_limiting.requests_per_minute.toString()}
            onChange={(value) => handleFieldChange('rate_limiting.requests_per_minute', parseInt(value) || 0)}
            placeholder="1000"
            disabled={!formData.rate_limiting.enabled}
          />

          <InputTextField
            label="Burst Limit"
            type="number"
            value={formData.rate_limiting.burst_limit.toString()}
            onChange={(value) => handleFieldChange('rate_limiting.burst_limit', parseInt(value) || 0)}
            placeholder="100"
            disabled={!formData.rate_limiting.enabled}
          />
        </div>
      </Card>

      {/* Webhooks */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Webhooks</h3>
        
        <div className="mb-6">
          <PropertyCheckbox
            title="Webhooks Enabled"
            description="Enable webhook notifications for events"
            checked={formData.webhooks.enabled}
            onChange={(checked) => handleFieldChange('webhooks.enabled', checked)}
          />
        </div>

        {formData.webhooks.enabled && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Callback URL"
                value={formData.webhooks.callback_url || ''}
                onChange={(value) => handleFieldChange('webhooks.callback_url', value)}
                placeholder="https://your-store.com/webhooks"
              />

              <InputTextField
                label="Secret Key"
                value={formData.webhooks.secret_key || ''}
                onChange={(value) => handleFieldChange('webhooks.secret_key', value)}
                placeholder="whsec_..."
                type="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Supported Events
              </label>
              <div className="space-y-2">
                {formData.webhooks.supported_events.map((event, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={event}
                      onChange={(e) => handleSupportedEventChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="order.created"
                    />
                    <button
                      type="button"
                      onClick={() => removeSupportedEvent(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSupportedEvent}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-xl hover:bg-blue-50"
                >
                  <PlusIcon className="h-4 w-4 mr-1 inline" />
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Documentation Links */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputTextField
            label="Swagger URL"
            value={formData.documentation.swagger_url || ''}
            onChange={(value) => handleFieldChange('documentation.swagger_url', value)}
            placeholder="https://api.yourstore.com/docs"
          />

          <InputTextField
            label="Postman Collection URL"
            value={formData.documentation.postman_collection_url || ''}
            onChange={(value) => handleFieldChange('documentation.postman_collection_url', value)}
            placeholder="https://api.yourstore.com/postman"
          />

          <InputTextField
            label="API Documentation URL"
            value={formData.documentation.api_docs_url || ''}
            onChange={(value) => handleFieldChange('documentation.api_docs_url', value)}
            placeholder="https://docs.yourstore.com"
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save API Information
        </Button>
      </div>
    </div>
  );
};

export default StoreSettingsPage;
