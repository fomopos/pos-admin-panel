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
  XMarkIcon
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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Name *
          </label>
          <input
            type="text"
            value={formData.store_name}
            onChange={(e) => handleInputChange('store_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.store_name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter store name"
          />
          {errors.store_name && (
            <p className="mt-1 text-sm text-red-600">{errors.store_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Type *
          </label>
          <select
            value={formData.location_type}
            onChange={(e) => handleInputChange('location_type', e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.location_type ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="retail">Retail</option>
            <option value="warehouse">Warehouse</option>
            <option value="outlet">Outlet</option>
            <option value="kiosk">Kiosk</option>
            <option value="online">Online</option>
            <option value="popup">Pop-up</option>
          </select>
          {errors.location_type && (
            <p className="mt-1 text-sm text-red-600">{errors.location_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Type *
          </label>
          <select
            value={formData.store_type}
            onChange={(e) => handleInputChange('store_type', e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.store_type ? 'border-red-300' : 'border-gray-300'
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
          {errors.store_type && (
            <p className="mt-1 text-sm text-red-600">{errors.store_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Enter store description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Locale
          </label>
          <select
            value={formData.locale}
            onChange={(e) => handleInputChange('locale', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>
      </div>
    </div>
  );

  const renderAddressInformation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Address</h3>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address 1 *
          </label>
          <input
            type="text"
            value={formData.address.address1}
            onChange={(e) => handleInputChange('address.address1', e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors['address.address1'] ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter street address"
          />
          {errors['address.address1'] && (
            <p className="mt-1 text-sm text-red-600">{errors['address.address1']}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address 2
            </label>
            <input
              type="text"
              value={formData.address.address2 || ''}
              onChange={(e) => handleInputChange('address.address2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address 3
            </label>
            <input
              type="text"
              value={formData.address.address3 || ''}
              onChange={(e) => handleInputChange('address.address3', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional address line"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors['address.city'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors['address.city'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Province *
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors['address.state'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter state"
            />
            {errors['address.state'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              value={formData.address.postal_code}
              onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors['address.postal_code'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter postal code"
            />
            {errors['address.postal_code'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.postal_code']}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors['address.country'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter country"
            />
            {errors['address.country'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District
            </label>
            <input
              type="text"
              value={formData.address.district}
              onChange={(e) => handleInputChange('address.district', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter district"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
            <input
              type="text"
              value={formData.address.area}
              onChange={(e) => handleInputChange('address.area', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter area"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              County
            </label>
            <input
              type="text"
              value={formData.address.county}
              onChange={(e) => handleInputChange('address.county', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter county"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude || ''}
              onChange={(e) => handleInputChange('latitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 40.7128"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="text"
              value={formData.longitude || ''}
              onChange={(e) => handleInputChange('longitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., -74.0060"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactInformation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Phone
          </label>
          <input
            type="tel"
            value={formData.telephone1 || ''}
            onChange={(e) => handleInputChange('telephone1', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter primary phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Phone
          </label>
          <input
            type="tel"
            value={formData.telephone2 || ''}
            onChange={(e) => handleInputChange('telephone2', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter secondary phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternate Phone 1
          </label>
          <input
            type="tel"
            value={formData.telephone3 || ''}
            onChange={(e) => handleInputChange('telephone3', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter alternate phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternate Phone 2
          </label>
          <input
            type="tel"
            value={formData.telephone4 || ''}
            onChange={(e) => handleInputChange('telephone4', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter alternate phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
    </div>
  );

  const renderLegalEntityInformation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Entity Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Entity ID
          </label>
          <input
            type="text"
            value={formData.legal_entity_id || ''}
            onChange={(e) => handleInputChange('legal_entity_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter legal entity ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Entity Name
          </label>
          <input
            type="text"
            value={formData.legal_entity_name || ''}
            onChange={(e) => handleInputChange('legal_entity_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter legal entity name"
          />
        </div>
      </div>
    </div>
  );

  const renderStoreTiming = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holidays'];
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Operating Hours</h3>
        
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="font-medium text-gray-700">
                {day}
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={formData.store_timing[day as keyof typeof formData.store_timing]}
                  onChange={(e) => handleTimingChange(day, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={day === 'Holidays' ? 'Closed' : '09:00-18:00'}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Format Guide:</strong> Use 24-hour format (e.g., "09:00-18:00") or "Closed" for non-operating days.
            Separate multiple time slots with commas (e.g., "09:00-12:00,14:00-18:00").
          </p>
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
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Stores
                </Button>
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Create New Store</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Add a new store to {currentTenant?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <Card className="p-0 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto px-6">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                {renderTabContent()}
              </div>

              {/* Form Actions */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
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
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Create Store
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-white border border-green-200 shadow-sm rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="bg-white border border-red-200 shadow-sm rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <XMarkIcon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-800">{errors.submit}</p>
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
