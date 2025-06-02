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
    { id: 'basic', name: 'Basic Information', icon: BuildingStorefrontIcon, color: 'blue' },
    { id: 'address', name: 'Address', icon: MapPinIcon, color: 'emerald' },
    { id: 'contact', name: 'Contact Info', icon: PhoneIcon, color: 'purple' },
    { id: 'legal', name: 'Legal Entity', icon: BuildingOfficeIcon, color: 'amber' },
    { id: 'timing', name: 'Store Timing', icon: ClockIcon, color: 'green' }
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <BuildingStorefrontIcon className="w-4 h-4 text-blue-500" />
              <span>Store Name *</span>
            </div>
          </label>
          <input
            type="text"
            value={formData.store_name}
            onChange={(e) => handleInputChange('store_name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 ${
              errors.store_name ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
            }`}
            placeholder="Enter store name"
          />
          {errors.store_name && (
            <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
              <XMarkIcon className="w-4 h-4" />
              <span>{errors.store_name}</span>
            </p>
          )}
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-emerald-500" />
              <span>Street Address 1 *</span>
            </div>
          </label>
          <input
            type="text"
            value={formData.address.address1}
            onChange={(e) => handleInputChange('address.address1', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 ${
              errors['address.address1'] ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
            }`}
            placeholder="Enter street address"
          />
          {errors['address.address1'] && (
            <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
              <XMarkIcon className="w-4 h-4" />
              <span>{errors['address.address1']}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Street Address 2
            </label>
            <input
              type="text"
              value={formData.address.address2 || ''}
              onChange={(e) => handleInputChange('address.address2', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Street Address 3
            </label>
            <input
              type="text"
              value={formData.address.address3 || ''}
              onChange={(e) => handleInputChange('address.address3', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
              placeholder="Additional address line"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-emerald-500" />
                <span>City *</span>
              </div>
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 ${
                errors['address.city'] ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors['address.city'] && (
              <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{errors['address.city']}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-emerald-500" />
                <span>State/Province *</span>
              </div>
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 ${
                errors['address.state'] ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
              }`}
              placeholder="Enter state"
            />
            {errors['address.state'] && (
              <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{errors['address.state']}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-emerald-500" />
                <span>Postal Code *</span>
              </div>
            </label>
            <input
              type="text"
              value={formData.address.postal_code}
              onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 ${
                errors['address.postal_code'] ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
              }`}
              placeholder="Enter postal code"
            />
            {errors['address.postal_code'] && (
              <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{errors['address.postal_code']}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="w-4 h-4 text-emerald-500" />
                <span>Country *</span>
              </div>
            </label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 ${
                errors['address.country'] ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
              }`}
              placeholder="Enter country"
            />
            {errors['address.country'] && (
              <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{errors['address.country']}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              District
            </label>
            <input
              type="text"
              value={formData.address.district}
              onChange={(e) => handleInputChange('address.district', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
              placeholder="Enter district"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Area
            </label>
            <input
              type="text"
              value={formData.address.area}
              onChange={(e) => handleInputChange('address.area', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
              placeholder="Enter area"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              County
            </label>
            <input
              type="text"
              value={formData.address.county}
              onChange={(e) => handleInputChange('address.county', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
              placeholder="Enter county"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude || ''}
              onChange={(e) => handleInputChange('latitude', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
              placeholder="e.g., 40.7128"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Longitude
            </label>
            <input
              type="text"
              value={formData.longitude || ''}
              onChange={(e) => handleInputChange('longitude', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="w-4 h-4 text-purple-500" />
              <span>Primary Phone</span>
            </div>
          </label>
          <input
            type="tel"
            value={formData.telephone1 || ''}
            onChange={(e) => handleInputChange('telephone1', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
            placeholder="Enter primary phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="w-4 h-4 text-purple-500" />
              <span>Secondary Phone</span>
            </div>
          </label>
          <input
            type="tel"
            value={formData.telephone2 || ''}
            onChange={(e) => handleInputChange('telephone2', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
            placeholder="Enter secondary phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="w-4 h-4 text-purple-500" />
              <span>Alternate Phone 1</span>
            </div>
          </label>
          <input
            type="tel"
            value={formData.telephone3 || ''}
            onChange={(e) => handleInputChange('telephone3', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
            placeholder="Enter alternate phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="w-4 h-4 text-purple-500" />
              <span>Alternate Phone 2</span>
            </div>
          </label>
          <input
            type="tel"
            value={formData.telephone4 || ''}
            onChange={(e) => handleInputChange('telephone4', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
            placeholder="Enter alternate phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="w-4 h-4 text-purple-500" />
            <span>Email Address</span>
          </div>
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300 ${
            errors.email ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 animate-slideIn flex items-center space-x-1">
            <XMarkIcon className="w-4 h-4" />
            <span>{errors.email}</span>
          </p>
        )}
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
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-4 h-4 text-amber-500" />
              <span>Legal Entity ID</span>
            </div>
          </label>
          <input
            type="text"
            value={formData.legal_entity_id || ''}
            onChange={(e) => handleInputChange('legal_entity_id', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
            placeholder="Enter legal entity ID"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-4 h-4 text-amber-500" />
              <span>Legal Entity Name</span>
            </div>
          </label>
          <input
            type="text"
            value={formData.legal_entity_name || ''}
            onChange={(e) => handleInputChange('legal_entity_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
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
                <input
                  type="text"
                  value={formData.store_timing[day as keyof typeof formData.store_timing]}
                  onChange={(e) => handleTimingChange(day, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300"
                  placeholder={day === 'Holidays' ? 'Closed' : '09:00-18:00'}
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
          {/* Modern Header */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 px-4 py-2 rounded-xl"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Stores
                </Button>
                <div className="border-l border-gray-300 pl-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                      <BuildingStorefrontIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        Create New Store
                      </h1>
                      <p className="text-gray-600 mt-1 font-medium">
                        Add a new store to {currentTenant?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <Card className="p-0 bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200/50">
              <nav className="flex space-x-2 overflow-x-auto px-6 py-4">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative whitespace-nowrap px-6 py-3 font-semibold text-sm flex items-center space-x-3 rounded-xl transition-all duration-300 transform ${
                        isActive
                          ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg scale-105`
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:scale-105'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{tab.name}</span>
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                {renderTabContent()}
              </div>

              {/* Modern Form Actions */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-t border-gray-200/50 px-8 py-6">
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
          </Card>

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
        </div>
      </div>
    </div>
  );
};

export default CreateStore;