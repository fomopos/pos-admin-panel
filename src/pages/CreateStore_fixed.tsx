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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTenantStore } from '../tenants/tenantStore';

interface StoreFormData {
  // Basic Information
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

    // Basic Information Validation
    if (!formData.store_name.trim()) {
      newErrors.store_name = 'Store name is required';
    }

    // Address Validation
    if (!formData.address.address1.trim()) {
      newErrors['address.address1'] = 'Street address is required';
    }
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }

      await createStore(currentTenant.id, formData);
      setSuccessMessage('Store created successfully!');
      
      if (onSave) {
        onSave();
      } else {
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create store' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <BuildingStorefrontIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Store Details</h3>
          <p className="text-sm text-gray-600">Basic information about your store</p>
        </div>
      </div>
      
      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Name */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Store Name *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={formData.store_name}
              onChange={(e) => handleInputChange('store_name', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400 ${
                errors.store_name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200'
              }`}
              placeholder="Enter your store name"
            />
            {errors.store_name && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <XMarkIcon className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.store_name && (
            <p className="text-sm text-red-600 font-medium animate-slideIn">{errors.store_name}</p>
          )}
        </div>

        {/* Location Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Location Type
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-lg">📍</span>
            </div>
            <select
              value={formData.location_type}
              onChange={(e) => handleInputChange('location_type', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400 appearance-none cursor-pointer"
            >
              <option value="retail">🏬 Retail Store</option>
              <option value="warehouse">🏭 Warehouse</option>
              <option value="online">💻 Online Only</option>
              <option value="mobile">🚚 Mobile/Pop-up</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Store Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Store Type
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-lg">🏪</span>
            </div>
            <select
              value={formData.store_type}
              onChange={(e) => handleInputChange('store_type', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400 appearance-none cursor-pointer ${
                errors.store_type 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200'
              }`}
            >
              <option value="general">🏪 General Store</option>
              <option value="grocery">🛒 Grocery</option>
              <option value="clothing">👕 Clothing</option>
              <option value="electronics">📱 Electronics</option>
              <option value="pharmacy">💊 Pharmacy</option>
              <option value="restaurant">🍽️ Restaurant</option>
              <option value="cafe">☕ Cafe</option>
              <option value="specialty">⭐ Specialty Store</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {errors.store_type && (
            <p className="text-sm text-red-600 font-medium animate-slideIn">{errors.store_type}</p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Currency
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-lg">💰</span>
            </div>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400 appearance-none cursor-pointer"
            >
              <option value="USD">🇺🇸 USD - US Dollar</option>
              <option value="EUR">🇪🇺 EUR - Euro</option>
              <option value="GBP">🇬🇧 GBP - British Pound</option>
              <option value="INR">🇮🇳 INR - Indian Rupee</option>
              <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
              <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
              <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Description - Full Width */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Store Description
        </label>
        <div className="relative">
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400 resize-none"
            rows={4}
            placeholder="Describe your store and what makes it special..."
          />
        </div>
      </div>

      {/* Locale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Locale
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-lg">🌍</span>
            </div>
            <select
              value={formData.locale}
              onChange={(e) => handleInputChange('locale', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400 appearance-none cursor-pointer"
            >
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="en-GB">🇬🇧 English (UK)</option>
              <option value="es-ES">🇪🇸 Spanish</option>
              <option value="fr-FR">🇫🇷 French</option>
              <option value="de-DE">🇩🇪 German</option>
              <option value="it-IT">🇮🇹 Italian</option>
              <option value="pt-PT">🇵🇹 Portuguese</option>
              <option value="ja-JP">🇯🇵 Japanese</option>
              <option value="ko-KR">🇰🇷 Korean</option>
              <option value="zh-CN">🇨🇳 Chinese (Simplified)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddressInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <MapPinIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Store Address</h3>
          <p className="text-sm text-gray-600">Physical location and address details</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Primary Address */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Street Address 1 *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              value={formData.address.address1}
              onChange={(e) => handleInputChange('address.address1', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400 ${
                errors['address.address1'] 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200'
              }`}
              placeholder="Enter your street address"
            />
            {errors['address.address1'] && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <XMarkIcon className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors['address.address1'] && (
            <p className="text-sm text-red-600 font-medium animate-slideIn">{errors['address.address1']}</p>
          )}
        </div>

        {/* Additional Address Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Street Address 2
            </label>
            <input
              type="text"
              value={formData.address.address2 || ''}
              onChange={(e) => handleInputChange('address.address2', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Street Address 3
            </label>
            <input
              type="text"
              value={formData.address.address3 || ''}
              onChange={(e) => handleInputChange('address.address3', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400"
              placeholder="Additional address line"
            />
          </div>
        </div>

        {/* City, State, District */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400 ${
                errors['address.city'] ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter city"
            />
            {errors['address.city'] && (
              <p className="text-sm text-red-600 font-medium animate-slideIn">{errors['address.city']}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              State *
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400 ${
                errors['address.state'] ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter state"
            />
            {errors['address.state'] && (
              <p className="text-sm text-red-600 font-medium animate-slideIn">{errors['address.state']}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              District
            </label>
            <input
              type="text"
              value={formData.address.district}
              onChange={(e) => handleInputChange('address.district', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400"
              placeholder="Enter district"
            />
          </div>
        </div>

        {/* Postal Code, Country, County */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.address.postal_code}
              onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400"
              placeholder="Enter postal code"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400 ${
                errors['address.country'] ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter country"
            />
            {errors['address.country'] && (
              <p className="text-sm text-red-600 font-medium animate-slideIn">{errors['address.country']}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              County
            </label>
            <input
              type="text"
              value={formData.address.county}
              onChange={(e) => handleInputChange('address.county', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400"
              placeholder="Enter county"
            />
          </div>
        </div>

        {/* Location Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude || ''}
              onChange={(e) => handleInputChange('latitude', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400"
              placeholder="e.g., 40.7128"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Longitude
            </label>
            <input
              type="text"
              value={formData.longitude || ''}
              onChange={(e) => handleInputChange('longitude', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400"
              placeholder="e.g., -74.0060"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <PhoneIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
          <p className="text-sm text-gray-600">Phone numbers and email for your store</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Primary Phone
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            </div>
            <input
              type="tel"
              value={formData.telephone1 || ''}
              onChange={(e) => handleInputChange('telephone1', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-400"
              placeholder="Enter primary phone number"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Secondary Phone
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            </div>
            <input
              type="tel"
              value={formData.telephone2 || ''}
              onChange={(e) => handleInputChange('telephone2', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-400"
              placeholder="Enter secondary phone number"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Additional Phone 1
          </label>
          <input
            type="tel"
            value={formData.telephone3 || ''}
            onChange={(e) => handleInputChange('telephone3', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-400"
            placeholder="Additional phone number"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Additional Phone 2
          </label>
          <input
            type="tel"
            value={formData.telephone4 || ''}
            onChange={(e) => handleInputChange('telephone4', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-400"
            placeholder="Additional phone number"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-lg">📧</span>
          </div>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-400"
            placeholder="Enter store email address"
          />
        </div>
      </div>
    </div>
  );

  const renderLegalEntityInformation = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
          <BuildingOfficeIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Legal Entity</h3>
          <p className="text-sm text-gray-600">Legal registration and entity information</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Legal Entity ID
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              value={formData.legal_entity_id || ''}
              onChange={(e) => handleInputChange('legal_entity_id', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:border-gray-400"
              placeholder="Enter legal entity ID"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Legal Entity Name
          </label>
          <input
            type="text"
            value={formData.legal_entity_name || ''}
            onChange={(e) => handleInputChange('legal_entity_name', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:border-gray-400"
            placeholder="Enter legal entity name"
          />
        </div>
      </div>
    </div>
  );

  const renderStoreTiming = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holidays'];

    return (
      <div className="space-y-8">
        {/* Section Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <ClockIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Store Timing</h3>
            <p className="text-sm text-gray-600">Operating hours for each day of the week</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  {day}
                </label>
              </div>
              <div className="md:col-span-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={formData.store_timing[day as keyof typeof formData.store_timing]}
                    onChange={(e) => handleTimingChange(day, e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-400"
                    placeholder="e.g., 09:00-18:00 or Closed"
                  />
                </div>
              </div>
            </div>
          ))}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm"></div>
          
          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="group flex items-center space-x-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:scale-105"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-white group-hover:text-blue-100 transition-colors" />
                  <span className="text-white font-medium group-hover:text-blue-100 transition-colors">
                    Back To Stores
                  </span>
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
                    <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Create New Store</h1>
                    <p className="text-blue-100 mt-1">Set up your store with all the essential details</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'} transition-colors`} />
                  <span className="font-semibold">{tab.name}</span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
            <div className="p-8">
              {/* Content Section */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8">
                {renderTabContent()}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Fill in all required fields to create your store
                </div>
                
                <div className="flex items-center space-x-6">
                  <Button
                    type="button"
                    onClick={handleBack}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium hover:scale-105"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Store...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="h-5 w-5" />
                        <span>Create Store</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-slideIn">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 mb-1">Success!</h3>
                      <p className="text-green-800 font-medium">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-slideIn">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-1">Error</h3>
                      <p className="text-red-800 font-medium">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CreateStore;
