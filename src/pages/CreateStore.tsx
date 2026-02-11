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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button, PageHeader, EnhancedTabs, InputTextField, InputTextArea, DropdownSearch, Widget } from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { useTenantStore } from '../tenants/tenantStore';
import { storeBillingService, PLAN_PRICES, PLAN_LABELS, PLAN_DESCRIPTIONS } from '../services/billing/storeBillingService';
import type { BillingPlan } from '../services/billing/storeBillingService';
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
import { useError } from '../hooks/useError';

interface StoreFormData {
  // Basic Information
  store_id?: string;
  store_name: string;
  description: string;
  location_type: string;
  store_type: string;
  billing_plan: BillingPlan;
  
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
  const { currentTenant, fetchStoresForTenant } = useTenantStore();
  const { showError, showSuccess, showValidationError } = useError();
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
    billing_plan: 'free',
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

  // Helper function to check if a tab has errors
  const getTabErrorStatus = (tabId: string): boolean => {
    const errorFields = Object.keys(errors);
    
    switch (tabId) {
      case 'basic':
        return ['store_id', 'store_name', 'location_type', 'store_type'].some(field => errorFields.includes(field));
      case 'address':
        return ['address.address1', 'address.city', 'address.state', 'address.postal_code', 'address.country'].some(field => errorFields.includes(field));
      case 'contact':
        return ['email', 'telephone1', 'telephone2', 'telephone3', 'telephone4'].some(field => errorFields.includes(field));
      case 'legal':
        return ['legal_entity_id', 'legal_entity_name'].some(field => errorFields.includes(field));
      case 'timing':
        return ['store_timing.Monday', 'store_timing.Tuesday', 'store_timing.Wednesday', 'store_timing.Thursday', 'store_timing.Friday', 'store_timing.Saturday', 'store_timing.Sunday', 'store_timing.Holidays'].some(field => errorFields.includes(field));
      default:
        return false;
    }
  };

  const tabs = [
    { 
      id: 'basic', 
      name: 'Basic Information', 
      icon: BuildingStorefrontIcon,
      hasError: getTabErrorStatus('basic')
    },
    { 
      id: 'address', 
      name: 'Address', 
      icon: MapPinIcon,
      hasError: getTabErrorStatus('address')
    },
    { 
      id: 'contact', 
      name: 'Contact Info', 
      icon: PhoneIcon,
      hasError: getTabErrorStatus('contact')
    },
    { 
      id: 'legal', 
      name: 'Legal Entity', 
      icon: BuildingOfficeIcon,
      hasError: getTabErrorStatus('legal')
    },
    { 
      id: 'timing', 
      name: 'Store Timing', 
      icon: ClockIcon,
      hasError: getTabErrorStatus('timing')
    }
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
    
    // If there are errors, show global error feedback
    if (Object.keys(newErrors).length > 0) {
      // Determine which tabs have errors
      const tabsWithErrors = getTabsWithErrors(newErrors);
      
      // Show validation error with details about which tabs need attention
      showValidationError(
        `Please fix the following errors before creating the store: ${tabsWithErrors.join(', ')}`,
        'form_validation',
        null,
        'required'
      );
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to determine which tabs have validation errors
  const getTabsWithErrors = (validationErrors: Record<string, string>): string[] => {
    const tabsWithErrors: string[] = [];
    const errorFields = Object.keys(validationErrors);

    // Check for basic information errors
    const basicFields = ['store_id', 'store_name', 'location_type', 'store_type'];
    if (basicFields.some(field => errorFields.includes(field))) {
      tabsWithErrors.push('Basic Information');
    }

    // Check for address errors
    const addressFields = ['address.address1', 'address.city', 'address.state', 'address.postal_code', 'address.country'];
    if (addressFields.some(field => errorFields.includes(field))) {
      tabsWithErrors.push('Address');
    }

    // Check for contact errors
    const contactFields = ['email', 'telephone1', 'telephone2', 'telephone3', 'telephone4'];
    if (contactFields.some(field => errorFields.includes(field))) {
      tabsWithErrors.push('Contact Info');
    }

    // Check for legal entity errors
    const legalFields = ['legal_entity_id', 'legal_entity_name'];
    if (legalFields.some(field => errorFields.includes(field))) {
      tabsWithErrors.push('Legal Entity');
    }

    // Check for timing errors
    const timingFields = ['store_timing.Monday', 'store_timing.Tuesday', 'store_timing.Wednesday', 'store_timing.Thursday', 'store_timing.Friday', 'store_timing.Saturday', 'store_timing.Sunday', 'store_timing.Holidays'];
    if (timingFields.some(field => errorFields.includes(field))) {
      tabsWithErrors.push('Store Timing');
    }

    return tabsWithErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentTenant) return;

    try {
      setIsLoading(true);
      
      // Helper function to convert empty strings to null
      const toNullIfEmpty = (value: string | undefined): string | null => {
        if (!value || value.trim() === '') return null;
        return value.trim();
      };

      // Build the API payload including billing_plan
      const apiStoreData = {
        tenant_id: currentTenant.id,
        store_id: toNullIfEmpty(formData.store_id),
        store_name: formData.store_name?.trim() || 'New Store',
        billing_plan: formData.billing_plan,
        description: toNullIfEmpty(formData.description),
        location_type: formData.location_type || 'retail',
        store_type: formData.store_type || 'general',
        address: {
          address1: toNullIfEmpty(formData.address.address1),
          address2: toNullIfEmpty(formData.address.address2),
          address3: toNullIfEmpty(formData.address.address3),
          address4: toNullIfEmpty(formData.address.address4),
          city: toNullIfEmpty(formData.address.city),
          state: toNullIfEmpty(formData.address.state),
          district: toNullIfEmpty(formData.address.district),
          area: toNullIfEmpty(formData.address.area),
          postal_code: toNullIfEmpty(formData.address.postal_code),
          country: formData.address.country?.trim() || '',
          county: toNullIfEmpty(formData.address.county),
        },
        locale: formData.locale || 'en-US',
        currency: formData.currency || 'USD',
        latitude: toNullIfEmpty(formData.latitude),
        longitude: toNullIfEmpty(formData.longitude),
        telephone1: toNullIfEmpty(formData.telephone1),
        telephone2: toNullIfEmpty(formData.telephone2),
        telephone3: toNullIfEmpty(formData.telephone3),
        telephone4: toNullIfEmpty(formData.telephone4),
        email: toNullIfEmpty(formData.email),
        legal_entity_id: toNullIfEmpty(formData.legal_entity_id),
        legal_entity_name: toNullIfEmpty(formData.legal_entity_name),
        timezone: formData.timezone || undefined,
        store_timing: formData.store_timing,
      };

      // Use storeBillingService to handle 201 vs 402
      const result = await storeBillingService.createStoreWithBilling(apiStoreData);

      if (result.checkoutRequired && result.checkoutUrl) {
        // 402 — store was created but needs Stripe Checkout
        // Add store to local state before redirecting
        await fetchStoresForTenant(currentTenant.id);
        showSuccess('Store created! Redirecting to payment setup...');
        // Redirect to Stripe Checkout (per MD: full-page redirect)
        storeBillingService.redirectToCheckout(result.checkoutUrl);
        return; // Don't proceed — page will navigate away
      }

      // 201 — store created successfully, refresh store list
      await fetchStoresForTenant(currentTenant.id);
      showSuccess('Store created successfully!');
      
      setSuccessMessage(null);
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
        
        // Set field-specific errors
        setErrors(fieldErrors);
        
        // Use error framework for API error display
        showError(error);
      } else {
        // Fallback for non-structured errors - use error framework
        const errorMessage = error?.message || 'Failed to create store. Please try again.';
        showError(errorMessage);
        
        // Also set local submit error for backward compatibility
        setErrors({ 
          submit: errorMessage
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
    <Widget
      title="Store Details"
      description="Configure your store's basic information and settings"
      icon={BuildingStorefrontIcon}
      variant="primary"
      className='overflow-visible'
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InputTextField
            label="Store ID"
            value={formData.store_id || ''}
            onChange={(value) => handleInputChange('store_id', value)}
            placeholder="Enter store ID (optional)"
            error={errors.store_id}
          />

          <InputTextField
            label="Store Name"
            required
            value={formData.store_name}
            onChange={(value) => handleInputChange('store_name', value)}
            placeholder="Enter store name"
            error={errors.store_name}
          />

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

        {/* Billing Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Billing Plan</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['free', 'starter', 'pro'] as BillingPlan[]).map((plan) => {
              const isSelected = formData.billing_plan === plan;
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => handleInputChange('billing_plan', plan)}
                  className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                      {PLAN_LABELS[plan]}
                    </span>
                    {isSelected && (
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{PLAN_DESCRIPTIONS[plan]}</p>
                  <p className={`text-lg font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                    {PLAN_PRICES[plan] === 0 ? 'Free' : `$${PLAN_PRICES[plan]}/mo`}
                  </p>
                  {plan !== 'free' && (
                    <p className="text-xs text-gray-400 mt-1">per store / month</p>
                  )}
                </button>
              );
            })}
          </div>
          {errors.billing_plan && (
            <p className="mt-2 text-sm text-red-600">{errors.billing_plan}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DropdownSearch
            label="Locale"
            options={LOCALES}
            value={formData.locale}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('locale', selectedOption.id);
              }
            }}
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

          <DropdownSearch
            label="Currency"
            options={CURRENCIES}
            value={formData.currency}
            onSelect={(selectedOption) => {
              if (selectedOption) {
                handleInputChange('currency', selectedOption.id);
              }
            }}
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

        <DropdownSearch
          label="Timezone"
          options={TIMEZONES}
          value={formData.timezone}
          onSelect={(selectedOption) => {
            if (selectedOption) {
              handleInputChange('timezone', selectedOption.id);
            }
          }}
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

        <InputTextArea
          label="Description"
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe your store, its purpose, and unique features..."
          rows={3}
          helperText="Provide details about your store's purpose and unique features"
        />
      </div>
    </Widget>
  );

  const renderAddressInformation = () => (
    <Widget
      title="Store Address"
      description="Enter your store's physical location details"
      icon={MapPinIcon}
      variant="success"
      className='overflow-visible'
    >
      <div className="space-y-4">
        <InputTextField
          label="Street Address 1"
          required
          value={formData.address.address1}
          onChange={(value) => handleInputChange('address.address1', value)}
          placeholder="Enter street address"
          error={errors['address.address1']}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InputTextField
            label="Street Address 2"
            value={formData.address.address2 || ''}
            onChange={(value) => handleInputChange('address.address2', value)}
            placeholder="Apartment, suite, etc."
          />

          <InputTextField
            label="Street Address 3"
            value={formData.address.address3 || ''}
            onChange={(value) => handleInputChange('address.address3', value)}
            placeholder="Additional address line"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dynamic City Field */}
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

          {/* Dynamic State Field */}
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
          <DropdownSearch
            label="Country"
            required
            value={formData.address.country}
            placeholder="Select a country"
            searchPlaceholder="Search countries..."
            options={COUNTRIES}
            onSelect={(option) => {
              if (option && option.id !== 'separator') {
                handleCountryChange(option.id);
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

          <InputTextField
            label="District"
            value={formData.address.district}
            onChange={(value) => handleInputChange('address.district', value)}
            placeholder="Enter district"
          />
        </div>

        {/* Geographic Selection Info */}
        {(availableStates.length > 0 || availableCities.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
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
            helperText="Optional: GPS coordinates for precise location"
          />

          <InputTextField
            label="Longitude"
            value={formData.longitude || ''}
            onChange={(value) => handleInputChange('longitude', value)}
            placeholder="e.g., -74.0060"
            helperText="Optional: GPS coordinates for precise location"
          />
        </div>
      </div>
    </Widget>
  );

  const renderContactInformation = () => (
    <Widget
      title="Contact Information"
      description="Add contact details for customer communication"
      icon={PhoneIcon}
      variant="warning"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InputTextField
            label="Primary Phone"
            type="tel"
            value={formData.telephone1 || ''}
            onChange={(value) => handleInputChange('telephone1', value)}
            placeholder="Enter primary phone number"
          />

          <InputTextField
            label="Secondary Phone"
            type="tel"
            value={formData.telephone2 || ''}
            onChange={(value) => handleInputChange('telephone2', value)}
            placeholder="Enter secondary phone number"
          />

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

        <InputTextField
          label="Email Address"
          type="email"
          value={formData.email || ''}
          onChange={(value) => handleInputChange('email', value)}
          placeholder="Enter email address"
          error={errors.email}
          helperText="Used for order confirmations and customer communication"
        />
      </div>
    </Widget>
  );

  const renderLegalEntityInformation = () => (
    <Widget
      title="Legal Entity Information"
      description="Configure legal entity details for compliance"
      icon={BuildingOfficeIcon}
      variant="warning"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InputTextField
          label="Legal Entity ID"
          value={formData.legal_entity_id || ''}
          onChange={(value) => handleInputChange('legal_entity_id', value)}
          placeholder="Enter legal entity ID"
          helperText="Optional: Business registration or tax ID"
        />

        <InputTextField
          label="Legal Entity Name"
          value={formData.legal_entity_name || ''}
          onChange={(value) => handleInputChange('legal_entity_name', value)}
          placeholder="Enter legal entity name"
          helperText="Optional: Official business name"
        />
      </div>
    </Widget>
  );

  const renderStoreTiming = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holidays'];
    
    return (
      <Widget
        title="Store Operating Hours"
        description="Set your store's weekly operating schedule"
        icon={ClockIcon}
        variant="success"
      >
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors duration-200">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">{day}</span>
              </div>
              <div className="md:col-span-2">
                <InputTextField
                  label=""
                  value={formData.store_timing[day as keyof typeof formData.store_timing]}
                  onChange={(value) => handleTimingChange(day, value)}
                  placeholder={day === 'Holidays' ? 'Closed' : '09:00-18:00'}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Format Guide</h4>
              <p className="text-sm text-gray-600">
                Use 24-hour format (e.g., "09:00-18:00") or "Closed" for non-operating days.
                Separate multiple time slots with commas (e.g., "09:00-12:00,14:00-18:00").
              </p>
            </div>
          </div>
        </div>
      </Widget>
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
    <div className="bg-gray-50 min-h-screen py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Create New Store"
            description={`Add a new store to ${currentTenant?.name}`}
          >
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Stores
            </Button>
          </PageHeader>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <p className="ml-3 text-green-700 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <XMarkIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && !errors.submit && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-amber-800 font-medium mb-2">
                    Please fix the following errors before creating the store
                  </h3>
                  <div className="text-sm text-amber-700 space-y-1">
                    {getTabsWithErrors(errors).map((tabName, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span>Issues found in <strong>{tabName}</strong> tab</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-amber-600">
                    Click on the highlighted tabs above to review and fix the errors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <EnhancedTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              allowOverflow={true}
            >
              {renderTabContent()}
            </EnhancedTabs>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? 'Creating Store...' : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Create Store
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;