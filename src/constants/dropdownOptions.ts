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
 * Geographic data structure for dynamic city/state selection
 */
export interface GeographicData {
  states: DropdownSearchOption[];
  cities: Record<string, DropdownSearchOption[]>;
}

/**
 * Geographic data by country - States/Provinces and Cities
 */
export const GEOGRAPHIC_DATA: Record<string, GeographicData> = {
  'United States': {
    states: [
      { id: 'AL', label: 'Alabama', icon: '🏛️' },
      { id: 'AK', label: 'Alaska', icon: '🏔️' },
      { id: 'AZ', label: 'Arizona', icon: '🌵' },
      { id: 'AR', label: 'Arkansas', icon: '🌲' },
      { id: 'CA', label: 'California', icon: '🌴' },
      { id: 'CO', label: 'Colorado', icon: '⛰️' },
      { id: 'CT', label: 'Connecticut', icon: '🏛️' },
      { id: 'DE', label: 'Delaware', icon: '🏛️' },
      { id: 'FL', label: 'Florida', icon: '🌴' },
      { id: 'GA', label: 'Georgia', icon: '🍑' },
      { id: 'HI', label: 'Hawaii', icon: '🌺' },
      { id: 'ID', label: 'Idaho', icon: '🥔' },
      { id: 'IL', label: 'Illinois', icon: '🌾' },
      { id: 'IN', label: 'Indiana', icon: '🏁' },
      { id: 'IA', label: 'Iowa', icon: '🌽' },
      { id: 'KS', label: 'Kansas', icon: '🌾' },
      { id: 'KY', label: 'Kentucky', icon: '🐎' },
      { id: 'LA', label: 'Louisiana', icon: '🎭' },
      { id: 'ME', label: 'Maine', icon: '🦞' },
      { id: 'MD', label: 'Maryland', icon: '🦀' },
      { id: 'MA', label: 'Massachusetts', icon: '🎓' },
      { id: 'MI', label: 'Michigan', icon: '🚗' },
      { id: 'MN', label: 'Minnesota', icon: '❄️' },
      { id: 'MS', label: 'Mississippi', icon: '🎵' },
      { id: 'MO', label: 'Missouri', icon: '🎯' },
      { id: 'MT', label: 'Montana', icon: '🏔️' },
      { id: 'NE', label: 'Nebraska', icon: '🌽' },
      { id: 'NV', label: 'Nevada', icon: '🎰' },
      { id: 'NH', label: 'New Hampshire', icon: '🍁' },
      { id: 'NJ', label: 'New Jersey', icon: '🌊' },
      { id: 'NM', label: 'New Mexico', icon: '🌵' },
      { id: 'NY', label: 'New York', icon: '🗽' },
      { id: 'NC', label: 'North Carolina', icon: '🏛️' },
      { id: 'ND', label: 'North Dakota', icon: '🌾' },
      { id: 'OH', label: 'Ohio', icon: '🏭' },
      { id: 'OK', label: 'Oklahoma', icon: '🛢️' },
      { id: 'OR', label: 'Oregon', icon: '🌲' },
      { id: 'PA', label: 'Pennsylvania', icon: '🔔' },
      { id: 'RI', label: 'Rhode Island', icon: '⚓' },
      { id: 'SC', label: 'South Carolina', icon: '🏛️' },
      { id: 'SD', label: 'South Dakota', icon: '🗿' },
      { id: 'TN', label: 'Tennessee', icon: '🎵' },
      { id: 'TX', label: 'Texas', icon: '🤠' },
      { id: 'UT', label: 'Utah', icon: '🏔️' },
      { id: 'VT', label: 'Vermont', icon: '🍁' },
      { id: 'VA', label: 'Virginia', icon: '🏛️' },
      { id: 'WA', label: 'Washington', icon: '🌲' },
      { id: 'WV', label: 'West Virginia', icon: '⛰️' },
      { id: 'WI', label: 'Wisconsin', icon: '🧀' },
      { id: 'WY', label: 'Wyoming', icon: '🦌' },
    ],
    cities: {
      'CA': [
        { id: 'los-angeles', label: 'Los Angeles', icon: '🌴' },
        { id: 'san-francisco', label: 'San Francisco', icon: '🌉' },
        { id: 'san-diego', label: 'San Diego', icon: '🏄' },
        { id: 'sacramento', label: 'Sacramento', icon: '🏛️' },
        { id: 'san-jose', label: 'San Jose', icon: '💻' },
        { id: 'fresno', label: 'Fresno', icon: '🍇' },
        { id: 'long-beach', label: 'Long Beach', icon: '🏖️' },
        { id: 'oakland', label: 'Oakland', icon: '🌉' },
        { id: 'bakersfield', label: 'Bakersfield', icon: '🛢️' },
        { id: 'anaheim', label: 'Anaheim', icon: '🎢' },
      ],
      'NY': [
        { id: 'new-york-city', label: 'New York City', icon: '🗽' },
        { id: 'buffalo', label: 'Buffalo', icon: '🦬' },
        { id: 'rochester', label: 'Rochester', icon: '📸' },
        { id: 'yonkers', label: 'Yonkers', icon: '🏙️' },
        { id: 'syracuse', label: 'Syracuse', icon: '🏛️' },
        { id: 'albany', label: 'Albany', icon: '🏛️' },
        { id: 'new-rochelle', label: 'New Rochelle', icon: '🏙️' },
        { id: 'mount-vernon', label: 'Mount Vernon', icon: '🏙️' },
        { id: 'schenectady', label: 'Schenectady', icon: '⚡' },
        { id: 'utica', label: 'Utica', icon: '🏭' },
      ],
      'TX': [
        { id: 'houston', label: 'Houston', icon: '🚀' },
        { id: 'san-antonio', label: 'San Antonio', icon: '🤠' },
        { id: 'dallas', label: 'Dallas', icon: '🏙️' },
        { id: 'austin', label: 'Austin', icon: '🎸' },
        { id: 'fort-worth', label: 'Fort Worth', icon: '🤠' },
        { id: 'el-paso', label: 'El Paso', icon: '🌵' },
        { id: 'arlington', label: 'Arlington', icon: '⚾' },
        { id: 'corpus-christi', label: 'Corpus Christi', icon: '🏖️' },
        { id: 'plano', label: 'Plano', icon: '🏙️' },
        { id: 'lubbock', label: 'Lubbock', icon: '🌾' },
      ],
      'FL': [
        { id: 'jacksonville', label: 'Jacksonville', icon: '🏖️' },
        { id: 'miami', label: 'Miami', icon: '🌴' },
        { id: 'tampa', label: 'Tampa', icon: '⚡' },
        { id: 'orlando', label: 'Orlando', icon: '🎢' },
        { id: 'st-petersburg', label: 'St. Petersburg', icon: '🏖️' },
        { id: 'hialeah', label: 'Hialeah', icon: '🌴' },
        { id: 'tallahassee', label: 'Tallahassee', icon: '🏛️' },
        { id: 'fort-lauderdale', label: 'Fort Lauderdale', icon: '🛥️' },
        { id: 'port-st-lucie', label: 'Port St. Lucie', icon: '🏖️' },
        { id: 'cape-coral', label: 'Cape Coral', icon: '🌊' },
      ],
    }
  },
  'Canada': {
    states: [
      { id: 'AB', label: 'Alberta', icon: '🏔️' },
      { id: 'BC', label: 'British Columbia', icon: '🌲' },
      { id: 'MB', label: 'Manitoba', icon: '🌾' },
      { id: 'NB', label: 'New Brunswick', icon: '🦞' },
      { id: 'NL', label: 'Newfoundland and Labrador', icon: '🐋' },
      { id: 'NS', label: 'Nova Scotia', icon: '⚓' },
      { id: 'NT', label: 'Northwest Territories', icon: '❄️' },
      { id: 'NU', label: 'Nunavut', icon: '🐻‍❄️' },
      { id: 'ON', label: 'Ontario', icon: '🍁' },
      { id: 'PE', label: 'Prince Edward Island', icon: '🦞' },
      { id: 'QC', label: 'Quebec', icon: '⚜️' },
      { id: 'SK', label: 'Saskatchewan', icon: '🌾' },
      { id: 'YT', label: 'Yukon', icon: '❄️' },
    ],
    cities: {
      'ON': [
        { id: 'toronto', label: 'Toronto', icon: '🏙️' },
        { id: 'ottawa', label: 'Ottawa', icon: '🏛️' },
        { id: 'mississauga', label: 'Mississauga', icon: '🏙️' },
        { id: 'brampton', label: 'Brampton', icon: '🏙️' },
        { id: 'hamilton', label: 'Hamilton', icon: '🏭' },
        { id: 'london', label: 'London', icon: '🎓' },
        { id: 'markham', label: 'Markham', icon: '🏙️' },
        { id: 'vaughan', label: 'Vaughan', icon: '🏙️' },
        { id: 'kitchener', label: 'Kitchener', icon: '🏭' },
        { id: 'windsor', label: 'Windsor', icon: '🌊' },
      ],
      'BC': [
        { id: 'vancouver', label: 'Vancouver', icon: '🌊' },
        { id: 'surrey', label: 'Surrey', icon: '🏙️' },
        { id: 'burnaby', label: 'Burnaby', icon: '🏙️' },
        { id: 'richmond', label: 'Richmond', icon: '🏙️' },
        { id: 'abbotsford', label: 'Abbotsford', icon: '🌲' },
        { id: 'coquitlam', label: 'Coquitlam', icon: '🏙️' },
        { id: 'victoria', label: 'Victoria', icon: '🏛️' },
        { id: 'kelowna', label: 'Kelowna', icon: '🍷' },
        { id: 'langley', label: 'Langley', icon: '🌲' },
        { id: 'saanich', label: 'Saanich', icon: '🌲' },
      ],
      'QC': [
        { id: 'montreal', label: 'Montreal', icon: '⚜️' },
        { id: 'quebec-city', label: 'Quebec City', icon: '🏰' },
        { id: 'laval', label: 'Laval', icon: '🏙️' },
        { id: 'gatineau', label: 'Gatineau', icon: '🏛️' },
        { id: 'longueuil', label: 'Longueuil', icon: '🏙️' },
        { id: 'sherbrooke', label: 'Sherbrooke', icon: '🎓' },
        { id: 'saguenay', label: 'Saguenay', icon: '🌲' },
        { id: 'levis', label: 'Lévis', icon: '🏰' },
        { id: 'trois-rivieres', label: 'Trois-Rivières', icon: '🌊' },
        { id: 'terrebonne', label: 'Terrebonne', icon: '🏙️' },
      ],
    }
  },
  'United Kingdom': {
    states: [
      { id: 'ENG', label: 'England', icon: '🏴' },
      { id: 'SCT', label: 'Scotland', icon: '🏴' },
      { id: 'WLS', label: 'Wales', icon: '🏴' },
      { id: 'NIR', label: 'Northern Ireland', icon: '🇬🇧' },
    ],
    cities: {
      'ENG': [
        { id: 'london', label: 'London', icon: '🏛️' },
        { id: 'birmingham', label: 'Birmingham', icon: '🏭' },
        { id: 'manchester', label: 'Manchester', icon: '⚽' },
        { id: 'liverpool', label: 'Liverpool', icon: '🎵' },
        { id: 'leeds', label: 'Leeds', icon: '🏭' },
        { id: 'sheffield', label: 'Sheffield', icon: '🔧' },
        { id: 'bristol', label: 'Bristol', icon: '🌉' },
        { id: 'leicester', label: 'Leicester', icon: '🦊' },
        { id: 'coventry', label: 'Coventry', icon: '🏰' },
        { id: 'nottingham', label: 'Nottingham', icon: '🏹' },
      ],
      'SCT': [
        { id: 'glasgow', label: 'Glasgow', icon: '🏴' },
        { id: 'edinburgh', label: 'Edinburgh', icon: '🏰' },
        { id: 'aberdeen', label: 'Aberdeen', icon: '🛢️' },
        { id: 'dundee', label: 'Dundee', icon: '🏴' },
        { id: 'stirling', label: 'Stirling', icon: '🏰' },
        { id: 'perth', label: 'Perth', icon: '🏔️' },
        { id: 'inverness', label: 'Inverness', icon: '🏔️' },
        { id: 'paisley', label: 'Paisley', icon: '🏴' },
      ],
      'WLS': [
        { id: 'cardiff', label: 'Cardiff', icon: '🏰' },
        { id: 'swansea', label: 'Swansea', icon: '🌊' },
        { id: 'newport', label: 'Newport', icon: '🏴' },
        { id: 'bangor', label: 'Bangor', icon: '🎓' },
        { id: 'wrexham', label: 'Wrexham', icon: '🏴' },
        { id: 'merthyr-tydfil', label: 'Merthyr Tydfil', icon: '🏔️' },
      ],
      'NIR': [
        { id: 'belfast', label: 'Belfast', icon: '🚢' },
        { id: 'derry', label: 'Derry', icon: '🏰' },
        { id: 'lisburn', label: 'Lisburn', icon: '🇬🇧' },
        { id: 'newtownabbey', label: 'Newtownabbey', icon: '🇬🇧' },
      ]
    }
  },
  'Australia': {
    states: [
      { id: 'NSW', label: 'New South Wales', icon: '🏛️' },
      { id: 'VIC', label: 'Victoria', icon: '🎭' },
      { id: 'QLD', label: 'Queensland', icon: '🌴' },
      { id: 'WA', label: 'Western Australia', icon: '🦘' },
      { id: 'SA', label: 'South Australia', icon: '🍷' },
      { id: 'TAS', label: 'Tasmania', icon: '🌿' },
      { id: 'ACT', label: 'Australian Capital Territory', icon: '🏛️' },
      { id: 'NT', label: 'Northern Territory', icon: '🐊' },
    ],
    cities: {
      'NSW': [
        { id: 'sydney', label: 'Sydney', icon: '🏛️' },
        { id: 'newcastle', label: 'Newcastle', icon: '🏭' },
        { id: 'wollongong', label: 'Wollongong', icon: '🌊' },
        { id: 'central-coast', label: 'Central Coast', icon: '🏖️' },
        { id: 'maitland', label: 'Maitland', icon: '🏞️' },
        { id: 'albury', label: 'Albury', icon: '🌾' },
      ],
      'VIC': [
        { id: 'melbourne', label: 'Melbourne', icon: '🎭' },
        { id: 'geelong', label: 'Geelong', icon: '🌊' },
        { id: 'ballarat', label: 'Ballarat', icon: '🏞️' },
        { id: 'bendigo', label: 'Bendigo', icon: '🏞️' },
        { id: 'frankston', label: 'Frankston', icon: '🏖️' },
      ],
      'QLD': [
        { id: 'brisbane', label: 'Brisbane', icon: '🌴' },
        { id: 'gold-coast', label: 'Gold Coast', icon: '🏄' },
        { id: 'townsville', label: 'Townsville', icon: '🌴' },
        { id: 'cairns', label: 'Cairns', icon: '🐠' },
        { id: 'toowoomba', label: 'Toowoomba', icon: '🌸' },
      ],
    }
  },
  'India': {
    states: [
      { id: 'AP', label: 'Andhra Pradesh', icon: '🌶️' },
      { id: 'AR', label: 'Arunachal Pradesh', icon: '🏔️' },
      { id: 'AS', label: 'Assam', icon: '🍃' },
      { id: 'BR', label: 'Bihar', icon: '🏛️' },
      { id: 'CT', label: 'Chhattisgarh', icon: '🌾' },
      { id: 'GA', label: 'Goa', icon: '🏖️' },
      { id: 'GJ', label: 'Gujarat', icon: '🦁' },
      { id: 'HR', label: 'Haryana', icon: '🌾' },
      { id: 'HP', label: 'Himachal Pradesh', icon: '🏔️' },
      { id: 'JH', label: 'Jharkhand', icon: '⛏️' },
      { id: 'KA', label: 'Karnataka', icon: '💻' },
      { id: 'KL', label: 'Kerala', icon: '🌴' },
      { id: 'MP', label: 'Madhya Pradesh', icon: '🐅' },
      { id: 'MH', label: 'Maharashtra', icon: '🏙️' },
      { id: 'MN', label: 'Manipur', icon: '🏔️' },
      { id: 'ML', label: 'Meghalaya', icon: '☔' },
      { id: 'MZ', label: 'Mizoram', icon: '🏔️' },
      { id: 'NL', label: 'Nagaland', icon: '🏔️' },
      { id: 'OR', label: 'Odisha', icon: '🏛️' },
      { id: 'PB', label: 'Punjab', icon: '🌾' },
      { id: 'RJ', label: 'Rajasthan', icon: '🐪' },
      { id: 'SK', label: 'Sikkim', icon: '🏔️' },
      { id: 'TN', label: 'Tamil Nadu', icon: '🕺' },
      { id: 'TG', label: 'Telangana', icon: '💻' },
      { id: 'TR', label: 'Tripura', icon: '🌿' },
      { id: 'UP', label: 'Uttar Pradesh', icon: '🕌' },
      { id: 'UT', label: 'Uttarakhand', icon: '🏔️' },
      { id: 'WB', label: 'West Bengal', icon: '🐟' },
      { id: 'DL', label: 'Delhi', icon: '🏛️' },
      { id: 'PY', label: 'Puducherry', icon: '🏖️' },
    ],
    cities: {
      'MH': [
        { id: 'mumbai', label: 'Mumbai', icon: '🏙️' },
        { id: 'pune', label: 'Pune', icon: '🎓' },
        { id: 'nagpur', label: 'Nagpur', icon: '🍊' },
        { id: 'thane', label: 'Thane', icon: '🏙️' },
        { id: 'nashik', label: 'Nashik', icon: '🍇' },
        { id: 'aurangabad', label: 'Aurangabad', icon: '🏛️' },
        { id: 'solapur', label: 'Solapur', icon: '🌾' },
        { id: 'amravati', label: 'Amravati', icon: '🏛️' },
      ],
      'KA': [
        { id: 'bangalore', label: 'Bangalore', icon: '💻' },
        { id: 'mysore', label: 'Mysore', icon: '🏰' },
        { id: 'hubli', label: 'Hubli', icon: '🏭' },
        { id: 'mangalore', label: 'Mangalore', icon: '🌊' },
        { id: 'belgaum', label: 'Belgaum', icon: '🏞️' },
        { id: 'gulbarga', label: 'Gulbarga', icon: '🏛️' },
      ],
      'TN': [
        { id: 'chennai', label: 'Chennai', icon: '🏛️' },
        { id: 'coimbatore', label: 'Coimbatore', icon: '🏭' },
        { id: 'madurai', label: 'Madurai', icon: '🏛️' },
        { id: 'tiruchirappalli', label: 'Tiruchirappalli', icon: '🏛️' },
        { id: 'salem', label: 'Salem', icon: '🏭' },
        { id: 'tirunelveli', label: 'Tirunelveli', icon: '🌾' },
      ],
      'DL': [
        { id: 'new-delhi', label: 'New Delhi', icon: '🏛️' },
        { id: 'delhi', label: 'Delhi', icon: '🏛️' },
        { id: 'gurgaon', label: 'Gurgaon', icon: '🏙️' },
        { id: 'noida', label: 'Noida', icon: '🏙️' },
        { id: 'faridabad', label: 'Faridabad', icon: '🏭' },
      ],
    }
  },
};

/**
 * Helper function to get states/provinces for a country
 */
export const getStatesForCountry = (countryName: string): DropdownSearchOption[] => {
  const countryData = GEOGRAPHIC_DATA[countryName];
  return countryData?.states || [];
};

/**
 * Helper function to get cities for a country and state
 */
export const getCitiesForState = (countryName: string, stateId: string): DropdownSearchOption[] => {
  const countryData = GEOGRAPHIC_DATA[countryName];
  return countryData?.cities[stateId] || [];
};

/**
 * Helper function to check if a country has geographic data
 */
export const hasGeographicData = (countryName: string): boolean => {
  return countryName in GEOGRAPHIC_DATA;
};

/**
 * Comprehensive timezone options for store operations
 */
export const TIMEZONES: DropdownSearchOption[] = [
  // Popular timezones first
  { id: 'America/New_York', label: 'Eastern Time (US & Canada)', icon: '🇺🇸' },
  { id: 'America/Chicago', label: 'Central Time (US & Canada)', icon: '🇺🇸' },
  { id: 'America/Denver', label: 'Mountain Time (US & Canada)', icon: '🇺🇸' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', icon: '🇺🇸' },
  { id: 'Europe/London', label: 'Greenwich Mean Time (London)', icon: '🇬🇧' },
  { id: 'Europe/Paris', label: 'Central European Time (Paris)', icon: '🇫🇷' },
  { id: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)', icon: '🇦🇪' },
  { id: 'Asia/Kolkata', label: 'India Standard Time (Mumbai)', icon: '🇮🇳' },
  { id: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)', icon: '🇯🇵' },
  { id: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)', icon: '🇨🇳' },
  { id: 'separator', label: '─────────────────────────────', icon: '' },
  
  // Americas
  { id: 'America/Anchorage', label: 'Alaska Time', icon: '🇺🇸' },
  { id: 'America/Phoenix', label: 'Arizona Time', icon: '🇺🇸' },
  { id: 'America/Toronto', label: 'Eastern Time (Toronto)', icon: '🇨🇦' },
  { id: 'America/Vancouver', label: 'Pacific Time (Vancouver)', icon: '🇨🇦' },
  { id: 'America/Montreal', label: 'Eastern Time (Montreal)', icon: '🇨🇦' },
  { id: 'America/Winnipeg', label: 'Central Time (Winnipeg)', icon: '🇨🇦' },
  { id: 'America/Edmonton', label: 'Mountain Time (Edmonton)', icon: '🇨🇦' },
  { id: 'America/Halifax', label: 'Atlantic Time (Halifax)', icon: '🇨🇦' },
  { id: 'America/Mexico_City', label: 'Central Time (Mexico City)', icon: '🇲🇽' },
  { id: 'America/Sao_Paulo', label: 'Brasília Time (São Paulo)', icon: '🇧🇷' },
  { id: 'America/Buenos_Aires', label: 'Argentina Time (Buenos Aires)', icon: '🇦🇷' },
  { id: 'America/Lima', label: 'Peru Time (Lima)', icon: '🇵🇪' },
  { id: 'America/Santiago', label: 'Chile Time (Santiago)', icon: '🇨🇱' },
  { id: 'America/Bogota', label: 'Colombia Time (Bogotá)', icon: '🇨🇴' },
  { id: 'America/Caracas', label: 'Venezuela Time (Caracas)', icon: '🇻🇪' },
  
  // Europe
  { id: 'Europe/Berlin', label: 'Central European Time (Berlin)', icon: '🇩🇪' },
  { id: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)', icon: '🇳🇱' },
  { id: 'Europe/Brussels', label: 'Central European Time (Brussels)', icon: '🇧🇪' },
  { id: 'Europe/Vienna', label: 'Central European Time (Vienna)', icon: '🇦🇹' },
  { id: 'Europe/Zurich', label: 'Central European Time (Zurich)', icon: '🇨🇭' },
  { id: 'Europe/Rome', label: 'Central European Time (Rome)', icon: '🇮🇹' },
  { id: 'Europe/Madrid', label: 'Central European Time (Madrid)', icon: '🇪🇸' },
  { id: 'Europe/Stockholm', label: 'Central European Time (Stockholm)', icon: '🇸🇪' },
  { id: 'Europe/Oslo', label: 'Central European Time (Oslo)', icon: '🇳🇴' },
  { id: 'Europe/Copenhagen', label: 'Central European Time (Copenhagen)', icon: '🇩🇰' },
  { id: 'Europe/Helsinki', label: 'Eastern European Time (Helsinki)', icon: '🇫🇮' },
  { id: 'Europe/Athens', label: 'Eastern European Time (Athens)', icon: '🇬🇷' },
  { id: 'Europe/Warsaw', label: 'Central European Time (Warsaw)', icon: '🇵🇱' },
  { id: 'Europe/Prague', label: 'Central European Time (Prague)', icon: '🇨🇿' },
  { id: 'Europe/Budapest', label: 'Central European Time (Budapest)', icon: '🇭🇺' },
  { id: 'Europe/Dublin', label: 'Greenwich Mean Time (Dublin)', icon: '🇮🇪' },
  { id: 'Europe/Lisbon', label: 'Western European Time (Lisbon)', icon: '🇵🇹' },
  { id: 'Europe/Moscow', label: 'Moscow Standard Time', icon: '🇷🇺' },
  { id: 'Europe/Istanbul', label: 'Turkey Time (Istanbul)', icon: '🇹🇷' },
  
  // Asia
  { id: 'Asia/Hong_Kong', label: 'Hong Kong Time', icon: '🇭🇰' },
  { id: 'Asia/Singapore', label: 'Singapore Time', icon: '🇸🇬' },
  { id: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)', icon: '🇹🇭' },
  { id: 'Asia/Jakarta', label: 'Western Indonesia Time (Jakarta)', icon: '🇮🇩' },
  { id: 'Asia/Manila', label: 'Philippines Time (Manila)', icon: '🇵🇭' },
  { id: 'Asia/Kuala_Lumpur', label: 'Malaysia Time (Kuala Lumpur)', icon: '🇲🇾' },
  { id: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)', icon: '🇰🇷' },
  { id: 'Asia/Taipei', label: 'Taiwan Time (Taipei)', icon: '🇹🇼' },
  { id: 'Asia/Ho_Chi_Minh', label: 'Indochina Time (Ho Chi Minh)', icon: '🇻🇳' },
  { id: 'Asia/Yangon', label: 'Myanmar Time (Yangon)', icon: '🇲🇲' },
  { id: 'Asia/Dhaka', label: 'Bangladesh Time (Dhaka)', icon: '🇧🇩' },
  { id: 'Asia/Karachi', label: 'Pakistan Time (Karachi)', icon: '🇵🇰' },
  { id: 'Asia/Kabul', label: 'Afghanistan Time (Kabul)', icon: '🇦🇫' },
  { id: 'Asia/Tehran', label: 'Iran Time (Tehran)', icon: '🇮🇷' },
  { id: 'Asia/Baghdad', label: 'Arabia Standard Time (Baghdad)', icon: '🇮🇶' },
  { id: 'Asia/Kuwait', label: 'Arabia Standard Time (Kuwait)', icon: '🇰🇼' },
  { id: 'Asia/Riyadh', label: 'Arabia Standard Time (Riyadh)', icon: '🇸🇦' },
  { id: 'Asia/Qatar', label: 'Arabia Standard Time (Qatar)', icon: '🇶🇦' },
  { id: 'Asia/Bahrain', label: 'Arabia Standard Time (Bahrain)', icon: '🇧🇭' },
  { id: 'Asia/Muscat', label: 'Gulf Standard Time (Muscat)', icon: '🇴🇲' },
  { id: 'Asia/Baku', label: 'Azerbaijan Time (Baku)', icon: '🇦🇿' },
  { id: 'Asia/Yerevan', label: 'Armenia Time (Yerevan)', icon: '🇦🇲' },
  { id: 'Asia/Tbilisi', label: 'Georgia Time (Tbilisi)', icon: '🇬🇪' },
  { id: 'Asia/Almaty', label: 'Almaty Time (Kazakhstan)', icon: '🇰🇿' },
  { id: 'Asia/Tashkent', label: 'Uzbekistan Time (Tashkent)', icon: '🇺🇿' },
  { id: 'Asia/Colombo', label: 'Sri Lanka Time (Colombo)', icon: '🇱🇰' },
  { id: 'Asia/Kathmandu', label: 'Nepal Time (Kathmandu)', icon: '🇳🇵' },
  
  // Australia & Oceania
  { id: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)', icon: '🇦🇺' },
  { id: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)', icon: '🇦🇺' },
  { id: 'Australia/Brisbane', label: 'Australian Eastern Time (Brisbane)', icon: '🇦🇺' },
  { id: 'Australia/Perth', label: 'Australian Western Time (Perth)', icon: '🇦🇺' },
  { id: 'Australia/Adelaide', label: 'Australian Central Time (Adelaide)', icon: '🇦🇺' },
  { id: 'Australia/Darwin', label: 'Australian Central Time (Darwin)', icon: '🇦🇺' },
  { id: 'Australia/Hobart', label: 'Australian Eastern Time (Hobart)', icon: '🇦🇺' },
  { id: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)', icon: '🇳🇿' },
  { id: 'Pacific/Wellington', label: 'New Zealand Time (Wellington)', icon: '🇳🇿' },
  { id: 'Pacific/Fiji', label: 'Fiji Time', icon: '🇫🇯' },
  { id: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)', icon: '🇺🇸' },
  { id: 'Pacific/Guam', label: 'Chamorro Time (Guam)', icon: '🇬🇺' },
  
  // Africa
  { id: 'Africa/Cairo', label: 'Eastern European Time (Cairo)', icon: '🇪🇬' },
  { id: 'Africa/Lagos', label: 'West Africa Time (Lagos)', icon: '🇳🇬' },
  { id: 'Africa/Johannesburg', label: 'South Africa Time (Johannesburg)', icon: '🇿🇦' },
  { id: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)', icon: '🇰🇪' },
  { id: 'Africa/Casablanca', label: 'Western European Time (Casablanca)', icon: '🇲🇦' },
  { id: 'Africa/Algiers', label: 'Central European Time (Algiers)', icon: '🇩🇿' },
  { id: 'Africa/Tunis', label: 'Central European Time (Tunis)', icon: '🇹🇳' },
  { id: 'Africa/Accra', label: 'Greenwich Mean Time (Accra)', icon: '🇬🇭' },
  { id: 'Africa/Abidjan', label: 'Greenwich Mean Time (Abidjan)', icon: '🇨🇮' },
  { id: 'Africa/Dakar', label: 'Greenwich Mean Time (Dakar)', icon: '🇸🇳' },
  { id: 'Africa/Addis_Ababa', label: 'East Africa Time (Addis Ababa)', icon: '🇪🇹' },
  { id: 'Africa/Kampala', label: 'East Africa Time (Kampala)', icon: '🇺🇬' },
  { id: 'Africa/Dar_es_Salaam', label: 'East Africa Time (Dar es Salaam)', icon: '🇹🇿' },
  { id: 'Africa/Khartoum', label: 'Central Africa Time (Khartoum)', icon: '🇸🇩' },
  { id: 'Africa/Kinshasa', label: 'West Africa Time (Kinshasa)', icon: '🇨🇩' },
  { id: 'Africa/Luanda', label: 'West Africa Time (Luanda)', icon: '🇦🇴' },
  { id: 'Africa/Maputo', label: 'Central Africa Time (Maputo)', icon: '🇲🇿' },
  { id: 'Africa/Windhoek', label: 'Central Africa Time (Windhoek)', icon: '🇳🇦' },
  { id: 'Africa/Gaborone', label: 'Central Africa Time (Gaborone)', icon: '🇧🇼' },
  { id: 'Africa/Harare', label: 'Central Africa Time (Harare)', icon: '🇿🇼' },
  { id: 'Africa/Lusaka', label: 'Central Africa Time (Lusaka)', icon: '🇿🇲' },
];

/**
 * Helper function to get timezone offset display
 */
export const getTimezoneOffset = (timezoneId: string): string => {
  try {
    const now = new Date();
    const timezone = Intl.DateTimeFormat('en', {
      timeZone: timezoneId,
      timeZoneName: 'short'
    }).formatToParts(now);
    
    const offsetPart = timezone.find(part => part.type === 'timeZoneName');
    return offsetPart?.value || '';
  } catch {
    // Fallback offset mappings for common timezones
    const offsetMap: Record<string, string> = {
      'America/New_York': 'UTC-5/-4',
      'America/Chicago': 'UTC-6/-5',
      'America/Denver': 'UTC-7/-6',
      'America/Los_Angeles': 'UTC-8/-7',
      'Europe/London': 'UTC+0/+1',
      'Europe/Paris': 'UTC+1/+2',
      'Asia/Dubai': 'UTC+4',
      'Asia/Kolkata': 'UTC+5:30',
      'Asia/Tokyo': 'UTC+9',
      'Asia/Shanghai': 'UTC+8',
      'Australia/Sydney': 'UTC+10/+11',
    };
    
    return offsetMap[timezoneId] || 'UTC';
  }
};

/**
 * Helper function to format timezone for display
 */
export const formatTimezoneDisplay = (timezone: DropdownSearchOption): string => {
  if (!timezone || timezone.id === 'separator') return '';
  
  const offset = getTimezoneOffset(timezone.id);
  return `${timezone.label} (${offset})`;
};

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
  { id: 'retail', label: 'Retail Store', icon: '🏪' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'quick_service', label: 'Quick Service', icon: '🍔' },
  { id: 'cafe', label: 'Café', icon: '☕' },
  { id: 'bar', label: 'Bar / Pub', icon: '🍻' },
  { id: 'bakery', label: 'Bakery', icon: '🥐' },
  { id: 'food_truck', label: 'Food Truck', icon: '🚚' },
  { id: 'canteen', label: 'Canteen', icon: '🥗' },
  { id: 'cloud_kitchen', label: 'Cloud Kitchen', icon: '📦' },
  { id: 'kiosk', label: 'Kiosk', icon: '🛍️' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'salon', label: 'Salon / Spa', icon: '💇' },
  { id: 'laundromat', label: 'Laundromat', icon: '🧺' },
  { id: 'repair_shop', label: 'Repair Shop', icon: '🛠️' },
  { id: 'clinic', label: 'Clinic', icon: '🏥' },
  { id: 'cinema', label: 'Cinema / Theater', icon: '🎬' },
  { id: 'theme_park', label: 'Theme Park', icon: '🎢' },
  { id: 'hotel', label: 'Hotel / Resort', icon: '🏨' },
  { id: 'airport_kiosk', label: 'Airport Kiosk', icon: '✈️' },
  { id: 'school_canteen', label: 'School Canteen', icon: '🏫' },
  { id: 'campus_store', label: 'Campus Store', icon: '🎓' },
  { id: 'popup', label: 'Pop-up Store', icon: '⏰' },
  { id: 'online', label: 'Online Store', icon: '💻' },
  { id: 'warehouse', label: 'Warehouse', icon: '🏭' },
  { id: 'outlet', label: 'Outlet', icon: '🏬' },
];

/**
 * Store types with icons
 */
export const STORE_TYPES: DropdownSearchOption[] = [
  { id: 'general', label: 'General Store', icon: '🏪' },
  { id: 'grocery', label: 'Grocery Store', icon: '🛒' },
  { id: 'clothing', label: 'Clothing & Apparel', icon: '👕' },
  { id: 'electronics', label: 'Electronics Store', icon: '📱' },
  { id: 'pharmacy', label: 'Pharmacy / Drugstore', icon: '💊' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'cafe', label: 'Café / Coffee Shop', icon: '☕' },
  { id: 'bar', label: 'Bar / Pub / Lounge', icon: '🍺' },
  { id: 'bakery', label: 'Bakery / Patisserie', icon: '🥐' },
  { id: 'juice_bar', label: 'Juice / Smoothie Bar', icon: '🥤' },
  { id: 'ice_cream_parlor', label: 'Ice Cream Shop', icon: '🍨' },
  { id: 'salon', label: 'Salon / Beauty', icon: '💇' },
  { id: 'spa', label: 'Spa & Wellness', icon: '💆' },
  { id: 'laundry', label: 'Laundry / Dry Cleaner', icon: '🧺' },
  { id: 'repair', label: 'Repair & Services', icon: '🔧' },
  { id: 'clinic', label: 'Clinic / Dental / Optical', icon: '🏥' },
  { id: 'bookstore', label: 'Bookstore / Stationery', icon: '📚' },
  { id: 'toy_store', label: 'Toy & Kids Store', icon: '🧸' },
  { id: 'home_decor', label: 'Home Decor / Furniture', icon: '🛋️' },
  { id: 'jewelry', label: 'Jewelry Store', icon: '💍' },
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
