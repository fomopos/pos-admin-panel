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
  CurrencyDollarIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Button, PageHeader, EnhancedTabs, Input, InputTextField } from '../components/ui';
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-blue-500" />
              <span>Location Type *</span>
            </div>
          </label>
          <div className="relative">
            <select
              value={formData.location_type}
              onChange={(e) => handleInputChange('location_type', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 appearance-none ${
                errors.location_type ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
              }`}
            >
              <option value="retail">Retail</option>
              <option value="warehouse">Warehouse</option>
              <option value="outlet">Outlet</option>
              <option value="kiosk">Kiosk</option>
              <option value="online">Online</option>
              <option value="popup">Pop-up</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.location_type && (
            <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
              <XMarkIcon className="w-4 h-4" />
              <span>{errors.location_type}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <BuildingStorefrontIcon className="w-4 h-4 text-blue-500" />
              <span>Store Type *</span>
            </div>
          </label>
          <div className="relative">
            <select
              value={formData.store_type}
              onChange={(e) => handleInputChange('store_type', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 appearance-none ${
                errors.store_type ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
              }`}
            >
              <option value="general">General Store</option>
              <option value="grocery">Grocery</option>
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="specialty">Specialty Store</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.store_type && (
            <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
              <XMarkIcon className="w-4 h-4" />
              <span>{errors.store_type}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-4 h-4 text-blue-500" />
              <span>Currency</span>
            </div>
          </label>
          <div className="relative">
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 appearance-none"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4 text-blue-500" />
              <span>Locale</span>
            </div>
          </label>
          <div className="relative">
            <select
              value={formData.locale}
              onChange={(e) => handleInputChange('locale', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 appearance-none"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-PT">Portuguese</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Simplified)</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
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
          <InputTextField
            label="Country"
            required
            value={formData.address.country}
            onChange={(value) => handleInputChange('address.country', value)}
            placeholder="Enter country"
            error={errors['address.country']}
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