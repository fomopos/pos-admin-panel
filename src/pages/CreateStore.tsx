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
import { 
  COUNTRIES, 
  LOCALES, 
  LOCATION_TYPES, 
  STORE_TYPES, 
  CURRENCIES,
  TIMEZONES,
  getStatesForCountryCode,
  getCitiesForStateByCountryCode,
  hasGeographicDataByCountryCode
} from '../constants/dropdownOptions';
import { getDefaultTimezone } from '../utils/timezoneUtils';
import { detectUserCountryCode } from '../utils/locationUtils';

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
  timezone: string;
  
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
      country: detectUserCountryCode(),
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
    timezone: getDefaultTimezone(),
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

  // Dynamic geographic data state
  const [availableStates, setAvailableStates] = useState<DropdownSearchOption[]>([]);
  const [availableCities, setAvailableCities] = useState<DropdownSearchOption[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

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

  // Handle country change - update available states and clear state/city
  const handleCountryChange = async (countryCode: string) => {
    // Update country in form data (store the country code)
    handleInputChange('address.country', countryCode);
    
    // Clear dependent fields
    handleInputChange('address.state', '');
    handleInputChange('address.city', '');
    setAvailableCities([]);
    
    // Load states for the selected country
    if (hasGeographicDataByCountryCode(countryCode)) {
      setIsLoadingStates(true);
      try {
        // Simulate API call delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 300));
        const states = getStatesForCountryCode(countryCode);
        setAvailableStates(states);
      } finally {
        setIsLoadingStates(false);
      }
    } else {
      setAvailableStates([]);
    }
  };

  // Handle state change - update available cities and clear city
  const handleStateChange = async (stateId: string, stateName: string) => {
    // Update state in form data
    handleInputChange('address.state', stateName);
    
    // Clear city
    handleInputChange('address.city', '');
    
    // Load cities for the selected state
    const countryCode = formData.address.country;
    if (hasGeographicDataByCountryCode(countryCode) && stateId) {
      setIsLoadingCities(true);
      try {
        // Simulate API call delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 200));
        const cities = getCitiesForStateByCountryCode(countryCode, stateId);
        setAvailableCities(cities);
      } finally {
        setIsLoadingCities(false);
      }
    } else {
      setAvailableCities([]);
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
    } catch (error: any) {
      console.error('Store creation failed:', error);
      
      // Handle structured API errors with field-specific validation
      if (error?.code && error?.slug && error?.details) {
        // This is our new structured API error
        const fieldErrors: Record<string, string> = {};
        
        // Map API field errors to form field errors
        if (error.details) {
          Object.entries(error.details).forEach(([apiField, message]) => {
            // Map API field names to form field names
            const formField = mapApiFieldToFormField(apiField);
            fieldErrors[formField] = message as string;
          });
        }
        
        // Set field-specific errors and general error message
        setErrors({
          ...fieldErrors,
          submit: error.getDisplayMessage ? error.getDisplayMessage() : error.message
        });
      } else {
        // Fallback for non-structured errors
        setErrors({ 
          submit: error?.message || 'Failed to create store. Please try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to map API field names to form field names
  const mapApiFieldToFormField = (apiField: string): string => {
    const fieldMap: Record<string, string> = {
      'store_name': 'store_name',
      'store_id': 'store_id',
      'description': 'description',
      'location_type': 'location_type',
      'store_type': 'store_type',
      'latitude': 'latitude',
      'longitude': 'longitude',
      'email': 'email',
      'telephone1': 'telephone1',
      'telephone2': 'telephone2',
      'telephone3': 'telephone3',
      'telephone4': 'telephone4',
      'legal_entity_id': 'legal_entity_id',
      'legal_entity_name': 'legal_entity_name',
      'locale': 'locale',
      'currency': 'currency',
      'timezone': 'timezone',
      // Address fields with nested mapping
      'address1': 'address.address1',
      'address2': 'address.address2',
      'address3': 'address.address3',
      'address4': 'address.address4',
      'city': 'address.city',
      'state': 'address.state',
      'district': 'address.district',
      'area': 'address.area',
      'postal_code': 'address.postal_code',
      'country': 'address.country',
      'county': 'address.county',
    };
    
    return fieldMap[apiField] || apiField;
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DropdownSearch
            label="Timezone"
            options={TIMEZONES}
            value={formData.timezone}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('timezone', selectedOption.id);
              }
            }}
            // Enhanced displayValue with timezone icon and name
            displayValue={(option) => {
              if (!option) return "Select timezone";
              return (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              );
            }}
            renderOption={(option) => {
              // Handle separator
              if (option.id === 'separator') {
                return (
                  <div className="px-3 py-1 text-center text-gray-400 text-xs border-t border-gray-200 bg-gray-50">
                    Regional Timezones
                  </div>
                );
              }
              
              return (
                <div className="flex items-center gap-3">
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              );
            }}
            placeholder="Select timezone"
            searchPlaceholder="Search timezones..."
            noOptionsMessage="No timezones found"
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
          {/* Dynamic City Field - shows dropdown if cities are available, otherwise text input */}
          {availableCities.length > 0 ? (
            <DropdownSearch
              label="City"
              required
              options={availableCities}
              value={availableCities.find(city => city.label === formData.address.city)?.id || ''}
              onSelect={(selectedOption) => {
                if (selectedOption) {
                  handleInputChange('address.city', selectedOption.label);
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
                return formData.address.city || "Select a city";
              }}
              renderOption={(option) => (
                <div className="flex items-center gap-3">
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              )}
              placeholder="Select a city"
              searchPlaceholder="Search cities..."
              error={errors['address.city']}
            />
          ) : (
            <InputTextField
              label="City"
              required
              value={formData.address.city}
              onChange={(value) => handleInputChange('address.city', value)}
              placeholder="Enter city"
              error={errors['address.city']}
            />
          )}

          {/* Dynamic State Field - shows dropdown if states are available, otherwise text input */}
          {availableStates.length > 0 ? (
            <DropdownSearch
              label="State/Province"
              required
              options={availableStates}
              value={availableStates.find(state => state.label === formData.address.state)?.id || ''}
              onSelect={(selectedOption) => {
                if (selectedOption) {
                  handleStateChange(selectedOption.id, selectedOption.label);
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
                return formData.address.state || "Select a state";
              }}
              renderOption={(option) => (
                <div className="flex items-center gap-3">
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              )}
              placeholder="Select a state/province"
              searchPlaceholder="Search states..."
              error={errors['address.state']}
            />
          ) : (
            <InputTextField
              label="State/Province"
              required
              value={formData.address.state}
              onChange={(value) => handleInputChange('address.state', value)}
              placeholder="Enter state/province"
              error={errors['address.state']}
            />
          )}

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
                handleCountryChange(option.id); // Store country code
              } else if (!option) {
                handleCountryChange('');
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
              // If no option provided, try to find it by current value (which should be a country code)
              const currentCountry = COUNTRIES.find(
                country => country.id === formData.address.country
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

        {/* Geographic Selection Info */}
        {(availableStates.length > 0 || availableCities.length > 0) && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">Smart Geographic Selection</h4>
                <p className="text-sm text-blue-700">
                  {availableStates.length > 0 && availableCities.length > 0
                    ? `Found ${availableStates.length} states/provinces and ${availableCities.length} cities for ${formData.address.country}. Select from the dropdown options for better accuracy.`
                    : availableStates.length > 0
                    ? `Found ${availableStates.length} states/provinces for ${formData.address.country}. Select a state to view available cities.`
                    : 'Geographic data loaded successfully.'
                  }
                </p>
                {isLoadingStates && (
                  <p className="text-sm text-blue-600 mt-1 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-2"></div>
                    Loading states...
                  </p>
                )}
                {isLoadingCities && (
                  <p className="text-sm text-blue-600 mt-1 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-2"></div>
                    Loading cities...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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