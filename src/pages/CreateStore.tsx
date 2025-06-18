import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Button, PageHeader, EnhancedTabs, Input, InputTextField, DropdownSearch } from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { useTenantStore } from '../tenants/tenantStore';

interface StoreFormData {
  // Basic Information
  store_id?: string;
  store_name: string;
  description: string;
  location_type: string;
  store_type: string;
  
  // Address Information
  address: {
    address1: string;
    address2?: string;
    address3?: string;
    address4?: string;
    city: string;
    state: string;
    district: string;
    area: string;
    postal_code: string;
    country: string;
    county: string;
  };
  
  // Contact Information
  telephone1?: string;
  telephone2?: string;
  telephone3?: string;
  telephone4?: string;
  email?: string;
  
  // Location Details
  latitude?: string;
  longitude?: string;
  locale: string;
  currency: string;
  
  // Legal Entity Information
  legal_entity_id?: string;
  legal_entity_name?: string;
  
  // Store Timing (Day-wise)
  store_timing: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
    Holidays: string;
  };
}

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
  { id: 'INR', label: 'INR - Indian Rupee', icon: '₹' },
  { id: 'JPY', label: 'JPY - Japanese Yen', icon: '¥' },
  { id: 'AUD', label: 'AUD - Australian Dollar', icon: 'A$' },
  { id: 'CAD', label: 'CAD - Canadian Dollar', icon: 'C$' },
  { id: 'CNY', label: 'CNY - Chinese Yuan', icon: '¥' },
  { id: 'AED', label: 'AED - UAE Dirham', icon: 'د.إ' },
  { id: 'CHF', label: 'CHF - Swiss Franc', icon: 'Fr' },
];

// Locale options with flag icons
const LOCALES: DropdownSearchOption[] = [
  { id: 'en-US', label: 'English (US)', icon: '🇺🇸' },
  { id: 'en-GB', label: 'English (UK)', icon: '🇬🇧' },
  { id: 'es-ES', label: 'Spanish (Spain)', icon: '🇪🇸' },
  { id: 'fr-FR', label: 'French (France)', icon: '🇫🇷' },
  { id: 'de-DE', label: 'German (Germany)', icon: '🇩🇪' },
  { id: 'it-IT', label: 'Italian (Italy)', icon: '🇮🇹' },
  { id: 'pt-PT', label: 'Portuguese (Portugal)', icon: '🇵🇹' },
  { id: 'ja-JP', label: 'Japanese (Japan)', icon: '🇯🇵' },
  { id: 'ko-KR', label: 'Korean (South Korea)', icon: '🇰🇷' },
  { id: 'zh-CN', label: 'Chinese (Simplified)', icon: '🇨🇳' },
];

// Countries data with flags - Popular countries first, then alphabetical
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
  // Separator line
  { id: 'separator', label: '────────────────────', icon: '' },
  // All countries alphabetically
  { id: 'AF', label: 'Afghanistan', icon: '🇦🇫' },
  { id: 'AL', label: 'Albania', icon: '🇦🇱' },
  { id: 'DZ', label: 'Algeria', icon: '🇩🇿' },
  { id: 'AS', label: 'American Samoa', icon: '🇦🇸' },
  { id: 'AD', label: 'Andorra', icon: '🇦🇩' },
  { id: 'AO', label: 'Angola', icon: '🇦🇴' },
  { id: 'AI', label: 'Anguilla', icon: '🇦🇮' },
  { id: 'AQ', label: 'Antarctica', icon: '🇦🇶' },
  { id: 'AG', label: 'Antigua and Barbuda', icon: '🇦🇬' },
  { id: 'AR', label: 'Argentina', icon: '🇦🇷' },
  { id: 'AM', label: 'Armenia', icon: '🇦🇲' },
  { id: 'AW', label: 'Aruba', icon: '🇦🇼' },
  { id: 'AT', label: 'Austria', icon: '🇦🇹' },
  { id: 'AZ', label: 'Azerbaijan', icon: '🇦🇿' },
  { id: 'BS', label: 'Bahamas', icon: '🇧🇸' },
  { id: 'BH', label: 'Bahrain', icon: '🇧🇭' },
  { id: 'BD', label: 'Bangladesh', icon: '🇧🇩' },
  { id: 'BB', label: 'Barbados', icon: '🇧🇧' },
  { id: 'BY', label: 'Belarus', icon: '🇧🇾' },
  { id: 'BE', label: 'Belgium', icon: '🇧🇪' },
  { id: 'BZ', label: 'Belize', icon: '🇧🇿' },
  { id: 'BJ', label: 'Benin', icon: '🇧🇯' },
  { id: 'BM', label: 'Bermuda', icon: '🇧🇲' },
  { id: 'BT', label: 'Bhutan', icon: '🇧🇹' },
  { id: 'BO', label: 'Bolivia', icon: '🇧🇴' },
  { id: 'BA', label: 'Bosnia and Herzegovina', icon: '🇧🇦' },
  { id: 'BW', label: 'Botswana', icon: '🇧🇼' },
  { id: 'BV', label: 'Bouvet Island', icon: '🇧🇻' },
  { id: 'IO', label: 'British Indian Ocean Territory', icon: '🇮🇴' },
  { id: 'BN', label: 'Brunei Darussalam', icon: '🇧🇳' },
  { id: 'BG', label: 'Bulgaria', icon: '🇧🇬' },
  { id: 'BF', label: 'Burkina Faso', icon: '🇧🇫' },
  { id: 'BI', label: 'Burundi', icon: '🇧🇮' },
  { id: 'CV', label: 'Cabo Verde', icon: '🇨🇻' },
  { id: 'KH', label: 'Cambodia', icon: '🇰🇭' },
  { id: 'CM', label: 'Cameroon', icon: '🇨🇲' },
  { id: 'KY', label: 'Cayman Islands', icon: '🇰🇾' },
  { id: 'CF', label: 'Central African Republic', icon: '🇨🇫' },
  { id: 'TD', label: 'Chad', icon: '🇹🇩' },
  { id: 'CL', label: 'Chile', icon: '🇨🇱' },
  { id: 'CX', label: 'Christmas Island', icon: '🇨🇽' },
  { id: 'CC', label: 'Cocos (Keeling) Islands', icon: '🇨🇨' },
  { id: 'CO', label: 'Colombia', icon: '🇨🇴' },
  { id: 'KM', label: 'Comoros', icon: '🇰🇲' },
  { id: 'CG', label: 'Congo', icon: '🇨🇬' },
  { id: 'CD', label: 'Congo, Democratic Republic of the', icon: '🇨🇩' },
  { id: 'CK', label: 'Cook Islands', icon: '🇨🇰' },
  { id: 'CR', label: 'Costa Rica', icon: '🇨🇷' },
  { id: 'CI', label: 'Côte d\'Ivoire', icon: '🇨🇮' },
  { id: 'HR', label: 'Croatia', icon: '🇭🇷' },
  { id: 'CU', label: 'Cuba', icon: '🇨🇺' },
  { id: 'CW', label: 'Curaçao', icon: '🇨🇼' },
  { id: 'CY', label: 'Cyprus', icon: '🇨🇾' },
  { id: 'CZ', label: 'Czech Republic', icon: '🇨🇿' },
  { id: 'DK', label: 'Denmark', icon: '🇩🇰' },
  { id: 'DJ', label: 'Djibouti', icon: '🇩🇯' },
  { id: 'DM', label: 'Dominica', icon: '🇩🇲' },
  { id: 'DO', label: 'Dominican Republic', icon: '🇩🇴' },
  { id: 'EC', label: 'Ecuador', icon: '🇪🇨' },
  { id: 'EG', label: 'Egypt', icon: '🇪🇬' },
  { id: 'SV', label: 'El Salvador', icon: '🇸🇻' },
  { id: 'GQ', label: 'Equatorial Guinea', icon: '🇬🇶' },
  { id: 'ER', label: 'Eritrea', icon: '🇪🇷' },
  { id: 'EE', label: 'Estonia', icon: '🇪🇪' },
  { id: 'SZ', label: 'Eswatini', icon: '🇸🇿' },
  { id: 'ET', label: 'Ethiopia', icon: '🇪🇹' },
  { id: 'FK', label: 'Falkland Islands (Malvinas)', icon: '🇫🇰' },
  { id: 'FO', label: 'Faroe Islands', icon: '🇫🇴' },
  { id: 'FJ', label: 'Fiji', icon: '🇫🇯' },
  { id: 'FI', label: 'Finland', icon: '🇫🇮' },
  { id: 'GF', label: 'French Guiana', icon: '🇬🇫' },
  { id: 'PF', label: 'French Polynesia', icon: '🇵🇫' },
  { id: 'TF', label: 'French Southern Territories', icon: '🇹🇫' },
  { id: 'GA', label: 'Gabon', icon: '🇬🇦' },
  { id: 'GM', label: 'Gambia', icon: '🇬🇲' },
  { id: 'GE', label: 'Georgia', icon: '🇬🇪' },
  { id: 'GH', label: 'Ghana', icon: '🇬🇭' },
  { id: 'GI', label: 'Gibraltar', icon: '🇬🇮' },
  { id: 'GR', label: 'Greece', icon: '🇬🇷' },
  { id: 'GL', label: 'Greenland', icon: '🇬🇱' },
  { id: 'GD', label: 'Grenada', icon: '🇬🇩' },
  { id: 'GP', label: 'Guadeloupe', icon: '🇬🇵' },
  { id: 'GU', label: 'Guam', icon: '🇬🇺' },
  { id: 'GT', label: 'Guatemala', icon: '🇬🇹' },
  { id: 'GG', label: 'Guernsey', icon: '🇬🇬' },
  { id: 'GN', label: 'Guinea', icon: '🇬🇳' },
  { id: 'GW', label: 'Guinea-Bissau', icon: '🇬🇼' },
  { id: 'GY', label: 'Guyana', icon: '🇬🇾' },
  { id: 'HT', label: 'Haiti', icon: '🇭🇹' },
  { id: 'HM', label: 'Heard Island and McDonald Islands', icon: '🇭🇲' },
  { id: 'VA', label: 'Holy See (Vatican City State)', icon: '🇻🇦' },
  { id: 'HN', label: 'Honduras', icon: '🇭🇳' },
  { id: 'HK', label: 'Hong Kong', icon: '🇭🇰' },
  { id: 'HU', label: 'Hungary', icon: '🇭🇺' },
  { id: 'IS', label: 'Iceland', icon: '🇮🇸' },
  { id: 'ID', label: 'Indonesia', icon: '🇮🇩' },
  { id: 'IR', label: 'Iran, Islamic Republic of', icon: '🇮🇷' },
  { id: 'IQ', label: 'Iraq', icon: '🇮🇶' },
  { id: 'IE', label: 'Ireland', icon: '🇮🇪' },
  { id: 'IM', label: 'Isle of Man', icon: '🇮🇲' },
  { id: 'IL', label: 'Israel', icon: '🇮🇱' },
  { id: 'IT', label: 'Italy', icon: '🇮🇹' },
  { id: 'JM', label: 'Jamaica', icon: '🇯🇲' },
  { id: 'JE', label: 'Jersey', icon: '🇯🇪' },
  { id: 'JO', label: 'Jordan', icon: '🇯🇴' },
  { id: 'KZ', label: 'Kazakhstan', icon: '🇰🇿' },
  { id: 'KE', label: 'Kenya', icon: '🇰🇪' },
  { id: 'KI', label: 'Kiribati', icon: '🇰🇮' },
  { id: 'KP', label: 'Korea, Democratic People\'s Republic of', icon: '🇰🇵' },
  { id: 'KR', label: 'Korea, Republic of', icon: '🇰🇷' },
  { id: 'KW', label: 'Kuwait', icon: '🇰🇼' },
  { id: 'KG', label: 'Kyrgyzstan', icon: '🇰🇬' },
  { id: 'LA', label: 'Lao People\'s Democratic Republic', icon: '🇱🇦' },
  { id: 'LV', label: 'Latvia', icon: '🇱🇻' },
  { id: 'LB', label: 'Lebanon', icon: '🇱🇧' },
  { id: 'LS', label: 'Lesotho', icon: '🇱🇸' },
  { id: 'LR', label: 'Liberia', icon: '🇱🇷' },
  { id: 'LY', label: 'Libya', icon: '🇱🇾' },
  { id: 'LI', label: 'Liechtenstein', icon: '🇱🇮' },
  { id: 'LT', label: 'Lithuania', icon: '🇱🇹' },
  { id: 'LU', label: 'Luxembourg', icon: '🇱🇺' },
  { id: 'MO', label: 'Macao', icon: '🇲🇴' },
  { id: 'MK', label: 'Macedonia, the former Yugoslav Republic of', icon: '🇲🇰' },
  { id: 'MG', label: 'Madagascar', icon: '🇲🇬' },
  { id: 'MW', label: 'Malawi', icon: '🇲🇼' },
  { id: 'MY', label: 'Malaysia', icon: '🇲🇾' },
  { id: 'MV', label: 'Maldives', icon: '🇲🇻' },
  { id: 'ML', label: 'Mali', icon: '🇲🇱' },
  { id: 'MT', label: 'Malta', icon: '🇲🇹' },
  { id: 'MH', label: 'Marshall Islands', icon: '🇲🇭' },
  { id: 'MQ', label: 'Martinique', icon: '🇲🇶' },
  { id: 'MR', label: 'Mauritania', icon: '🇲🇷' },
  { id: 'MU', label: 'Mauritius', icon: '🇲🇺' },
  { id: 'YT', label: 'Mayotte', icon: '🇾🇹' },
  { id: 'MX', label: 'Mexico', icon: '🇲🇽' },
  { id: 'FM', label: 'Micronesia, Federated States of', icon: '🇫🇲' },
  { id: 'MD', label: 'Moldova, Republic of', icon: '🇲🇩' },
  { id: 'MC', label: 'Monaco', icon: '🇲🇨' },
  { id: 'MN', label: 'Mongolia', icon: '🇲🇳' },
  { id: 'ME', label: 'Montenegro', icon: '🇲🇪' },
  { id: 'MS', label: 'Montserrat', icon: '🇲🇸' },
  { id: 'MA', label: 'Morocco', icon: '🇲🇦' },
  { id: 'MZ', label: 'Mozambique', icon: '🇲🇿' },
  { id: 'MM', label: 'Myanmar', icon: '🇲🇲' },
  { id: 'NA', label: 'Namibia', icon: '🇳🇦' },
  { id: 'NR', label: 'Nauru', icon: '🇳🇷' },
  { id: 'NP', label: 'Nepal', icon: '🇳🇵' },
  { id: 'NL', label: 'Netherlands', icon: '🇳🇱' },
  { id: 'NC', label: 'New Caledonia', icon: '🇳🇨' },
  { id: 'NZ', label: 'New Zealand', icon: '🇳🇿' },
  { id: 'NI', label: 'Nicaragua', icon: '🇳🇮' },
  { id: 'NE', label: 'Niger', icon: '🇳🇪' },
  { id: 'NG', label: 'Nigeria', icon: '🇳🇬' },
  { id: 'NU', label: 'Niue', icon: '🇳🇺' },
  { id: 'NF', label: 'Norfolk Island', icon: '🇳🇫' },
  { id: 'MP', label: 'Northern Mariana Islands', icon: '🇲🇵' },
  { id: 'NO', label: 'Norway', icon: '🇳🇴' },
  { id: 'OM', label: 'Oman', icon: '🇴🇲' },
  { id: 'PK', label: 'Pakistan', icon: '🇵🇰' },
  { id: 'PW', label: 'Palau', icon: '🇵🇼' },
  { id: 'PS', label: 'Palestine, State of', icon: '🇵🇸' },
  { id: 'PA', label: 'Panama', icon: '🇵🇦' },
  { id: 'PG', label: 'Papua New Guinea', icon: '🇵🇬' },
  { id: 'PY', label: 'Paraguay', icon: '🇵🇾' },
  { id: 'PE', label: 'Peru', icon: '🇵🇪' },
  { id: 'PH', label: 'Philippines', icon: '🇵🇭' },
  { id: 'PN', label: 'Pitcairn', icon: '🇵🇳' },
  { id: 'PL', label: 'Poland', icon: '🇵🇱' },
  { id: 'PT', label: 'Portugal', icon: '🇵🇹' },
  { id: 'PR', label: 'Puerto Rico', icon: '🇵🇷' },
  { id: 'QA', label: 'Qatar', icon: '🇶🇦' },
  { id: 'RE', label: 'Réunion', icon: '🇷🇪' },
  { id: 'RO', label: 'Romania', icon: '🇷🇴' },
  { id: 'RU', label: 'Russian Federation', icon: '🇷🇺' },
  { id: 'RW', label: 'Rwanda', icon: '🇷🇼' },
  { id: 'BL', label: 'Saint Barthélemy', icon: '🇧🇱' },
  { id: 'SH', label: 'Saint Helena, Ascension and Tristan da Cunha', icon: '🇸🇭' },
  { id: 'KN', label: 'Saint Kitts and Nevis', icon: '🇰🇳' },
  { id: 'LC', label: 'Saint Lucia', icon: '🇱🇨' },
  { id: 'MF', label: 'Saint Martin (French part)', icon: '🇲🇫' },
  { id: 'PM', label: 'Saint Pierre and Miquelon', icon: '🇵🇲' },
  { id: 'VC', label: 'Saint Vincent and the Grenadines', icon: '🇻🇨' },
  { id: 'WS', label: 'Samoa', icon: '🇼🇸' },
  { id: 'SM', label: 'San Marino', icon: '🇸🇲' },
  { id: 'ST', label: 'Sao Tome and Principe', icon: '🇸🇹' },
  { id: 'SA', label: 'Saudi Arabia', icon: '🇸🇦' },
  { id: 'SN', label: 'Senegal', icon: '🇸🇳' },
  { id: 'RS', label: 'Serbia', icon: '🇷🇸' },
  { id: 'SC', label: 'Seychelles', icon: '🇸🇨' },
  { id: 'SL', label: 'Sierra Leone', icon: '🇸🇱' },
  { id: 'SG', label: 'Singapore', icon: '🇸🇬' },
  { id: 'SX', label: 'Sint Maarten (Dutch part)', icon: '🇸🇽' },
  { id: 'SK', label: 'Slovakia', icon: '🇸🇰' },
  { id: 'SI', label: 'Slovenia', icon: '🇸🇮' },
  { id: 'SB', label: 'Solomon Islands', icon: '🇸🇧' },
  { id: 'SO', label: 'Somalia', icon: '🇸🇴' },
  { id: 'ZA', label: 'South Africa', icon: '🇿🇦' },
  { id: 'GS', label: 'South Georgia and the South Sandwich Islands', icon: '🇬🇸' },
  { id: 'SS', label: 'South Sudan', icon: '🇸🇸' },
  { id: 'ES', label: 'Spain', icon: '🇪🇸' },
  { id: 'LK', label: 'Sri Lanka', icon: '🇱🇰' },
  { id: 'SD', label: 'Sudan', icon: '🇸🇩' },
  { id: 'SR', label: 'Suriname', icon: '🇸🇷' },
  { id: 'SJ', label: 'Svalbard and Jan Mayen', icon: '🇸🇯' },
  { id: 'SE', label: 'Sweden', icon: '🇸🇪' },
  { id: 'CH', label: 'Switzerland', icon: '🇨🇭' },
  { id: 'SY', label: 'Syrian Arab Republic', icon: '🇸🇾' },
  { id: 'TW', label: 'Taiwan, Province of China', icon: '🇹🇼' },
  { id: 'TJ', label: 'Tajikistan', icon: '🇹🇯' },
  { id: 'TZ', label: 'Tanzania, United Republic of', icon: '🇹🇿' },
  { id: 'TH', label: 'Thailand', icon: '🇹🇭' },
  { id: 'TL', label: 'Timor-Leste', icon: '🇹🇱' },
  { id: 'TG', label: 'Togo', icon: '🇹🇬' },
  { id: 'TK', label: 'Tokelau', icon: '🇹🇰' },
  { id: 'TO', label: 'Tonga', icon: '🇹🇴' },
  { id: 'TT', label: 'Trinidad and Tobago', icon: '🇹🇹' },
  { id: 'TN', label: 'Tunisia', icon: '🇹🇳' },
  { id: 'TR', label: 'Turkey', icon: '🇹🇷' },
  { id: 'TM', label: 'Turkmenistan', icon: '🇹🇲' },
  { id: 'TC', label: 'Turks and Caicos Islands', icon: '🇹🇨' },
  { id: 'TV', label: 'Tuvalu', icon: '🇹🇻' },
  { id: 'UG', label: 'Uganda', icon: '🇺🇬' },
  { id: 'UA', label: 'Ukraine', icon: '🇺🇦' },
  { id: 'AE', label: 'United Arab Emirates', icon: '🇦🇪' },
  { id: 'UM', label: 'United States Minor Outlying Islands', icon: '🇺🇲' },
  { id: 'UY', label: 'Uruguay', icon: '🇺🇾' },
  { id: 'UZ', label: 'Uzbekistan', icon: '🇺🇿' },
  { id: 'VU', label: 'Vanuatu', icon: '🇻🇺' },
  { id: 'VE', label: 'Venezuela, Bolivarian Republic of', icon: '🇻🇪' },
  { id: 'VN', label: 'Viet Nam', icon: '🇻🇳' },
  { id: 'VG', label: 'Virgin Islands, British', icon: '🇻🇬' },
  { id: 'VI', label: 'Virgin Islands, U.S.', icon: '🇻🇮' },
  { id: 'WF', label: 'Wallis and Futuna', icon: '🇼🇫' },
  { id: 'EH', label: 'Western Sahara', icon: '🇪🇭' },
  { id: 'YE', label: 'Yemen', icon: '🇾🇪' },
  { id: 'ZM', label: 'Zambia', icon: '🇿🇲' },
  { id: 'ZW', label: 'Zimbabwe', icon: '🇿🇼' }
];

// Make props optional for standalone route usage
interface CreateStoreProps {
  onBack?: () => void;
  onSave?: () => void;
}

const CreateStore: React.FC<CreateStoreProps> = ({ onBack, onSave }) => {
  const navigate = useNavigate();
  const { currentTenant, createStore } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<StoreFormData>({
    store_id: '',
    store_name: '',
    description: '',
    location_type: 'retail',
    store_type: 'general',
    address: {
      address1: '',
      address2: '',
      address3: '',
      address4: '',
      city: '',
      state: '',
      district: '',
      area: '',
      postal_code: '',
      country: '',
      county: ''
    },
    telephone1: '',
    telephone2: '',
    telephone3: '',
    telephone4: '',
    email: '',
    latitude: '',
    longitude: '',
    locale: 'en-US',
    currency: 'USD',
    legal_entity_id: '',
    legal_entity_name: '',
    store_timing: {
      Monday: '09:00-18:00',
      Tuesday: '09:00-18:00',
      Wednesday: '09:00-18:00',
      Thursday: '09:00-18:00',
      Friday: '09:00-18:00',
      Saturday: '09:00-18:00',
      Sunday: '10:00-17:00',
      Holidays: 'Closed'
    }
  });

  const tabs = [
    { id: 'basic', name: 'Basic Information', icon: BuildingStorefrontIcon },
    { id: 'address', name: 'Address', icon: MapPinIcon },
    { id: 'contact', name: 'Contact Info', icon: PhoneIcon },
    { id: 'legal', name: 'Legal Entity', icon: BuildingOfficeIcon },
    { id: 'timing', name: 'Store Timing', icon: ClockIcon }
  ];

  // Handle navigation when used as standalone route
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate back to tenant/store selection when used as standalone route
      navigate('/tenant-store-selection');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      // Navigate to dashboard when used as standalone route
      navigate('/dashboard');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      const result = { ...prev };
      let current: any = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return result;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTimingChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      store_timing: {
        ...prev.store_timing,
        [day]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic Information validation

    if (!formData.store_id?.trim()) {
      newErrors.store_id = 'Store ID is optional but should not be empty if provided';
    }

    if (!formData.store_name?.trim()) {
      newErrors.store_name = 'Store name is required';
    }
    
    if (!formData.location_type) {
      newErrors.location_type = 'Location type is required';
    }
    
    if (!formData.store_type) {
      newErrors.store_type = 'Store type is required';
    }

    // Address validation
    if (!formData.address.address1?.trim()) {
      newErrors['address.address1'] = 'Street address is required';
    }
    
    if (!formData.address.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state?.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.postal_code?.trim()) {
      newErrors['address.postal_code'] = 'Postal code is required';
    }
    
    if (!formData.address.country?.trim()) {
      newErrors['address.country'] = 'Country is required';
    }

    // Contact validation (optional but format check)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentTenant) return;

    try {
      setIsLoading(true);
      
      // Call the store creation API
      await createStore(currentTenant.id, formData);
      
      setSuccessMessage('Store created successfully!');
      setTimeout(() => {
        handleSave();
      }, 1500);
    } catch (error) {
      setErrors({ submit: 'Failed to create store. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
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
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <BuildingStorefrontIcon className="w-4 h-4 text-blue-500" />
                <span>Store ID</span>
              </div>
            </label>
          </div>
          <Input
            type="text"
            value={formData.store_id || ''}
            onChange={(e) => handleInputChange('store_id', e.target.value)}
            placeholder="Enter store ID (optional)"
            error={errors.store_id}
            className="rounded-xl"
          />
        </div>

        <div>
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <BuildingStorefrontIcon className="w-4 h-4 text-blue-500" />
                <span>Store Name *</span>
              </div>
            </label>
          </div>
          <Input
            type="text"
            value={formData.store_name}
            onChange={(e) => handleInputChange('store_name', e.target.value)}
            placeholder="Enter store name"
            error={errors.store_name}
            className="rounded-xl"
          />
        </div>

        <div>
          <DropdownSearch
            label="Location Type"
            required
            options={LOCATION_TYPES}
            value={formData.location_type}
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
            error={errors.location_type}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <DropdownSearch
            label="Store Type"
            required
            options={STORE_TYPES}
            value={formData.store_type}
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
            error={errors.store_type}
          />
        </div>

        <div>
          <DropdownSearch
            label="Currency"
            options={CURRENCIES}
            value={formData.currency}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('currency', selectedOption.id);
              }
            }}
            // Enhanced displayValue that renders a component with currency symbol and code
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
          rows={4}
          placeholder="Describe your store, its purpose, and unique features..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DropdownSearch
            label="Locale"
            options={LOCALES}
            value={formData.locale}
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
      </div>
    </div>
  );

  const renderAddressInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
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
        <div>
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-emerald-500" />
                <span>Street Address 1 *</span>
              </div>
            </label>
          </div>
          <Input
            type="text"
            value={formData.address.address1}
            onChange={(e) => handleInputChange('address.address1', e.target.value)}
            placeholder="Enter street address"
            error={errors['address.address1']}
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Street Address 2"
              type="text"
              value={formData.address.address2 || ''}
              onChange={(e) => handleInputChange('address.address2', e.target.value)}
              placeholder="Apartment, suite, etc."
              className="rounded-xl"
            />
          </div>

          <div>
            <Input
              label="Street Address 3"
              type="text"
              value={formData.address.address3 || ''}
              onChange={(e) => handleInputChange('address.address3', e.target.value)}
              placeholder="Additional address line"
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputTextField
            label="City"
            required
            value={formData.address.city}
            onChange={(value) => handleInputChange('address.city', value)}
            placeholder="Enter city"
            error={errors['address.city']}
          />

          <InputTextField
            label="State/Province"
            required
            value={formData.address.state}
            onChange={(value) => handleInputChange('address.state', value)}
            placeholder="Enter state"
            error={errors['address.state']}
          />

          <InputTextField
            label="Postal Code"
            required
            value={formData.address.postal_code}
            onChange={(value) => handleInputChange('address.postal_code', value)}
            placeholder="Enter postal code"
            error={errors['address.postal_code']}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
          <DropdownSearch
            label="Country"
            required
            value={formData.address.country}
            placeholder="Select a country"
            searchPlaceholder="Search countries..."
            options={COUNTRIES}
            onSelect={(option) => {
              // Prevent selecting the separator
              if (option && option.id !== 'separator') {
                handleInputChange('address.country', option.label);
              } else if (!option) {
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
                country => country.label === formData.address.country || 
                          country.id === formData.address.country
              );
              if (currentCountry) {
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentCountry.icon}</span>
                    <span className="font-medium">{currentCountry.label}</span>
                  </div>
                );
              }
              return formData.address.country || "Select a country";
            }}
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
            error={errors['address.country']}
            allowClear
            clearLabel="Clear selection"
          />
          </div>

          <div>
            <InputTextField
              label="District"
              value={formData.address.district}
              onChange={(value) => handleInputChange('address.district', value)}
              placeholder="Enter district"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Area"
            value={formData.address.area}
            onChange={(value) => handleInputChange('address.area', value)}
            placeholder="Enter area"
          />

          <InputTextField
            label="County"
            value={formData.address.county}
            onChange={(value) => handleInputChange('address.county', value)}
            placeholder="Enter county"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Latitude"
            value={formData.latitude || ''}
            onChange={(value) => handleInputChange('latitude', value)}
            placeholder="e.g., 40.7128"
          />

          <InputTextField
            label="Longitude"
            value={formData.longitude || ''}
            onChange={(value) => handleInputChange('longitude', value)}
            placeholder="e.g., -74.0060"
          />
        </div>
      </div>
    </div>
  );

  const renderContactInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
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
        <div>
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-purple-500" />
                <span>Primary Phone</span>
              </div>
            </label>
          </div>
          <Input
            type="tel"
            value={formData.telephone1 || ''}
            onChange={(e) => handleInputChange('telephone1', e.target.value)}
            placeholder="Enter primary phone number"
            className="rounded-xl"
          />
        </div>

        <div>
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-purple-500" />
                <span>Secondary Phone</span>
              </div>
            </label>
          </div>
          <Input
            type="tel"
            value={formData.telephone2 || ''}
            onChange={(e) => handleInputChange('telephone2', e.target.value)}
            placeholder="Enter secondary phone number"
            className="rounded-xl"
          />
        </div>

        <InputTextField
          label="Alternate Phone 1"
          type="tel"
          value={formData.telephone3 || ''}
          onChange={(value) => handleInputChange('telephone3', value)}
          placeholder="Enter alternate phone number"
        />

        <InputTextField
          label="Alternate Phone 2"
          type="tel"
          value={formData.telephone4 || ''}
          onChange={(value) => handleInputChange('telephone4', value)}
          placeholder="Enter alternate phone number"
        />
      </div>

      <div>
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4 text-purple-500" />
              <span>Email Address</span>
            </div>
          </label>
        </div>
        <Input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter email address"
          error={errors.email}
          className="rounded-xl"
        />
      </div>
    </div>
  );

  const renderLegalEntityInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl">
            <BuildingOfficeIcon className="w-6 h-6 text-white" />
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
          value={formData.legal_entity_id || ''}
          onChange={(value) => handleInputChange('legal_entity_id', value)}
          placeholder="Enter legal entity ID"
        />

        <InputTextField
          label="Legal Entity Name"
          value={formData.legal_entity_name || ''}
          onChange={(value) => handleInputChange('legal_entity_name', value)}
          placeholder="Enter legal entity name"
        />
      </div>
    </div>
  );

  const renderStoreTiming = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holidays'];
    
    return (
      <div className="space-y-8">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Store Operating Hours
              </h3>
              <p className="text-green-600 mt-1">Set your store's weekly operating schedule</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-700">{day}</span>
              </div>
              <div className="md:col-span-2">
                <InputTextField
                  label=""
                  value={formData.store_timing[day as keyof typeof formData.store_timing]}
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
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInformation();
      case 'address':
        return renderAddressInformation();
      case 'contact':
        return renderContactInformation();
      case 'legal':
        return renderLegalEntityInformation();
      case 'timing':
        return renderStoreTiming();
      default:
        return renderBasicInformation();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Header */}
          <PageHeader
            title="Create New Store"
            description={`Add a new store to ${currentTenant?.name}`}
            className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-8"
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 px-4 py-2 rounded-xl"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Stores
            </Button>
          </PageHeader>

          {/* Modern Success/Error Messages */}
          {successMessage && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-lg rounded-2xl p-6 animate-slideIn">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-lg font-semibold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">{successMessage}</p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 shadow-lg rounded-2xl p-6 animate-slideIn">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <XMarkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold bg-gradient-to-r from-red-700 to-rose-700 bg-clip-text text-transparent">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Tab Navigation */}
          <form onSubmit={handleSubmit}>
            <EnhancedTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl"
              allowOverflow={true}
            >
              {renderTabContent()}
            </EnhancedTabs>

              {/* Modern Form Actions */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200/50 rounded-2xl px-8 py-6 mt-6">
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center min-w-[180px] px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Creating Store...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-5 w-5 mr-3" />
                        Create Store
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;