import React, { useState, useEffect } from 'react';
import {
  BuildingStorefrontIcon,
  GlobeAltIcon,
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { 
  Button, 
  Card, 
  PageHeader, 
  Alert, 
  EnhancedTabs 
} from '../components/ui';
import { storeServices } from '../services/store';
import type { StoreSettings } from '../services/types/store.types';

interface StoreSettingsState {
  settings: StoreSettings | null;
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
    isLoading: true,
    activeTab: 'information',
    showForm: false,
    formType: '',
    editingItem: null,
    errors: {},
    hasUnsavedChanges: false
  });

  // Fetch store settings
  useEffect(() => {
    const fetchSettings = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Use the store settings service
        const settings = await storeServices.settings.getMockStoreSettings();
        setState(prev => ({ ...prev, settings, isLoading: false }));
      } catch (error) {
        console.error('Failed to fetch store settings:', error);
        setState(prev => ({ ...prev, settings: null, isLoading: false }));
      }
    };

    fetchSettings();
  }, [currentTenant]);

  const tabs = [
    { id: 'information', name: 'Store Information', icon: BuildingStorefrontIcon },
    { id: 'regional', name: 'Regional Settings', icon: GlobeAltIcon },
    { id: 'receipt', name: 'Receipt Settings', icon: PrinterIcon },
    { id: 'hardware', name: 'Hardware Configuration', icon: ComputerDesktopIcon },
    { id: 'operational', name: 'Operational Settings', icon: CogIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'security', name: 'Security Settings', icon: ShieldCheckIcon }
  ];

  const handleTabChange = (tabId: string) => {
    if (state.hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to switch tabs?')) {
        return;
      }
    }
    setState(prev => ({ ...prev, activeTab: tabId, hasUnsavedChanges: false, errors: {} }));
  };

  const handleSave = async (section: string, data: any) => {
    try {
      setState(prev => ({ ...prev, errors: {} }));
      
      let updatedSettings: StoreSettings;
      const tenantId = currentTenant?.id || '272e';
      const storeId = currentStore?.store_id || '*';

      switch (section) {
        case 'information':
          updatedSettings = await storeServices.settings.updateStoreInformation(tenantId, storeId, data);
          break;
        case 'regional':
          updatedSettings = await storeServices.settings.updateRegionalSettings(tenantId, storeId, data);
          break;
        case 'receipt':
          updatedSettings = await storeServices.settings.updateReceiptSettings(tenantId, storeId, data);
          break;
        case 'hardware':
          updatedSettings = await storeServices.settings.updateHardwareConfig(tenantId, storeId, data);
          break;
        case 'operational':
          updatedSettings = await storeServices.settings.updateOperationalSettings(tenantId, storeId, data);
          break;
        case 'users':
          updatedSettings = await storeServices.settings.updateUserManagement(tenantId, storeId, data);
          break;
        case 'integrations':
          updatedSettings = await storeServices.settings.updateIntegrationSettings(tenantId, storeId, data);
          break;
        case 'security':
          updatedSettings = await storeServices.settings.updateSecuritySettings(tenantId, storeId, data);
          break;
        default:
          throw new Error('Invalid settings section');
      }

      setState(prev => ({ 
        ...prev, 
        settings: updatedSettings,
        hasUnsavedChanges: false 
      }));
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state.settings) {
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
          <h3 className="text-lg font-medium text-slate-900 mb-2">No store settings found</h3>
          <p className="text-sm text-slate-500 mb-6">
            Get started by configuring your store settings.
          </p>
          <Button onClick={() => setState(prev => ({ ...prev, showForm: true, formType: 'create' }))}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Configure Store Settings
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
      >
        {state.activeTab === 'information' && (
          <StoreInformationTab 
            settings={state.settings}
            onSave={(data) => handleSave('information', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}

        {state.activeTab === 'regional' && (
          <RegionalSettingsTab 
            settings={state.settings}
            onSave={(data) => handleSave('regional', data)}
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

        {state.activeTab === 'security' && (
          <SecuritySettingsTab 
            settings={state.settings}
            onSave={(data) => handleSave('security', data)}
            onFieldChange={() => setState(prev => ({ ...prev, hasUnsavedChanges: true }))}
          />
        )}
      </EnhancedTabs>
    </div>
  );
};

// Store Information Tab Component
interface TabProps {
  settings: StoreSettings;
  onSave: (data: any) => void;
  onFieldChange: () => void;
}

const StoreInformationTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.store_information);

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

  const handleBusinessHoursChange = (index: number, field: string, value: any) => {
    const updatedHours = [...formData.business_hours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setFormData(prev => ({ ...prev, business_hours: updatedHours }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ store_information: formData });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={formData.store_name}
              onChange={(e) => handleFieldChange('store_name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter store name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => handleFieldChange('business_name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              value={formData.registration_number || ''}
              onChange={(e) => handleFieldChange('registration_number', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter registration number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tax Number
            </label>
            <input
              type="text"
              value={formData.tax_number || ''}
              onChange={(e) => handleFieldChange('tax_number', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tax number"
            />
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Street Address 1
            </label>
            <input
              type="text"
              value={formData.address.street1}
              onChange={(e) => handleFieldChange('address.street1', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter street address"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Street Address 2
            </label>
            <input
              type="text"
              value={formData.address.street2 || ''}
              onChange={(e) => handleFieldChange('address.street2', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleFieldChange('address.city', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleFieldChange('address.state', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter state/province"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.address.postal_code}
              onChange={(e) => handleFieldChange('address.postal_code', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter postal code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleFieldChange('address.country', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter country"
            />
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <PhoneIcon className="h-5 w-5 mr-2" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.contact_info.phone}
              onChange={(e) => handleFieldChange('contact_info.phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.contact_info.email}
              onChange={(e) => handleFieldChange('contact_info.email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.contact_info.website || ''}
              onChange={(e) => handleFieldChange('contact_info.website', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter website URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fax Number
            </label>
            <input
              type="tel"
              value={formData.contact_info.fax || ''}
              onChange={(e) => handleFieldChange('contact_info.fax', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter fax number"
            />
          </div>
        </div>
      </Card>

      {/* Business Hours */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" />
          Business Hours
        </h3>
        <div className="space-y-4">
          {formData.business_hours.map((hours, index) => (
            <div key={hours.day} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="text-sm font-medium text-slate-700">{hours.day}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hours.is_open}
                  onChange={(e) => handleBusinessHoursChange(index, 'is_open', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-600">Open</span>
              </div>
              {hours.is_open && (
                <>
                  <div>
                    <input
                      type="time"
                      value={hours.open_time}
                      onChange={(e) => handleBusinessHoursChange(index, 'open_time', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <span className="text-slate-500">to</span>
                  <div>
                    <input
                      type="time"
                      value={hours.close_time}
                      onChange={(e) => handleBusinessHoursChange(index, 'close_time', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Store Information
        </Button>
      </div>
    </div>
  );
};

// Regional Settings Tab Component (simplified for now)
const RegionalSettingsTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState(settings.regional_settings);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
  ];

  const timezones = [
    { code: 'America/New_York', name: 'Eastern Time (US)' },
    { code: 'America/Chicago', name: 'Central Time (US)' },
    { code: 'America/Los_Angeles', name: 'Pacific Time (US)' },
    { code: 'Europe/London', name: 'Greenwich Mean Time' },
    { code: 'Asia/Dubai', name: 'Gulf Standard Time' }
  ];

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ regional_settings: formData });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
          Currency Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleFieldChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Currency Position
            </label>
            <select
              value={formData.currency_position}
              onChange={(e) => handleFieldChange('currency_position', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="before">Before amount ($100.00)</option>
              <option value="after">After amount (100.00$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Decimal Places
            </label>
            <select
              value={formData.decimal_places}
              onChange={(e) => handleFieldChange('decimal_places', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>0 (100)</option>
              <option value={1}>1 (100.0)</option>
              <option value={2}>2 (100.00)</option>
              <option value={3}>3 (100.000)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleFieldChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timezones.map((timezone) => (
                <option key={timezone.code} value={timezone.code}>
                  {timezone.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.tax_inclusive_pricing}
              onChange={(e) => handleFieldChange('tax_inclusive_pricing', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">
              Tax-inclusive pricing (prices include tax)
            </span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Regional Settings
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLogo"
              checked={formData.show_logo}
              onChange={(e) => handleFieldChange('show_logo', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="showLogo" className="ml-2 text-sm text-slate-700">
              Show Logo
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showBarcode"
              checked={formData.show_barcode}
              onChange={(e) => handleFieldChange('show_barcode', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="showBarcode" className="ml-2 text-sm text-slate-700">
              Show Barcode
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showQrCode"
              checked={formData.show_qr_code}
              onChange={(e) => handleFieldChange('show_qr_code', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="showQrCode" className="ml-2 text-sm text-slate-700">
              Show QR Code
            </label>
          </div>
        </div>
      </Card>

      {/* Receipt Content Options */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Receipt Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showCustomerInfo"
              checked={formData.show_customer_info}
              onChange={(e) => handleFieldChange('show_customer_info', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="showCustomerInfo" className="ml-2 text-sm text-slate-700">
              Show Customer Info
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showTaxBreakdown"
              checked={formData.show_tax_breakdown}
              onChange={(e) => handleFieldChange('show_tax_breakdown', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="showTaxBreakdown" className="ml-2 text-sm text-slate-700">
              Show Tax Breakdown
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPaymentDetails"
              checked={formData.show_payment_details}
              onChange={(e) => handleFieldChange('show_payment_details', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="showPaymentDetails" className="ml-2 text-sm text-slate-700">
              Show Payment Details
            </label>
          </div>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoPrint"
              checked={formData.auto_print}
              onChange={(e) => handleFieldChange('auto_print', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="autoPrint" className="ml-2 text-sm text-slate-700">
              Auto Print Receipt After Sale
            </label>
          </div>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="barcodeEnabled"
              checked={formData.barcode_scanner.enabled}
              onChange={(e) => handleBarcodeFieldChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="barcodeEnabled" className="ml-2 text-sm text-slate-700">
              Enable Barcode Scanner
            </label>
          </div>

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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="printerEnabled"
              checked={formData.receipt_printer.enabled}
              onChange={(e) => handlePrinterFieldChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="printerEnabled" className="ml-2 text-sm text-slate-700">
              Enable Receipt Printer
            </label>
          </div>

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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="cashDrawerEnabled"
              checked={formData.cash_drawer.enabled}
              onChange={(e) => handleCashDrawerFieldChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="cashDrawerEnabled" className="ml-2 text-sm text-slate-700">
              Enable Cash Drawer
            </label>
          </div>

          {formData.cash_drawer.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoOpen"
                  checked={formData.cash_drawer.auto_open}
                  onChange={(e) => handleCashDrawerFieldChange('auto_open', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="autoOpen" className="ml-2 text-sm text-slate-700">
                  Auto Open Drawer
                </label>
              </div>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="displayEnabled"
              checked={formData.customer_display.enabled}
              onChange={(e) => handleDisplayFieldChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="displayEnabled" className="ml-2 text-sm text-slate-700">
              Enable Customer Display
            </label>
          </div>

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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="outOfStockNotifications"
              checked={formData.inventory_alerts.out_of_stock_notifications}
              onChange={(e) => handleInventoryFieldChange('out_of_stock_notifications', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="outOfStockNotifications" className="ml-2 text-sm text-slate-700">
              Out of Stock Notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="negativeInventory"
              checked={formData.inventory_alerts.negative_inventory_allowed}
              onChange={(e) => handleInventoryFieldChange('negative_inventory_allowed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="negativeInventory" className="ml-2 text-sm text-slate-700">
              Allow Negative Inventory
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoReorder"
              checked={formData.inventory_alerts.auto_reorder}
              onChange={(e) => handleInventoryFieldChange('auto_reorder', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="autoReorder" className="ml-2 text-sm text-slate-700">
              Auto Reorder
            </label>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Restocking Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.return_policy.restocking_fee_percentage || ''}
              onChange={(e) => handleReturnFieldChange('restocking_fee_percentage', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="returnsAllowed"
              checked={formData.return_policy.returns_allowed}
              onChange={(e) => handleReturnFieldChange('returns_allowed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="returnsAllowed" className="ml-2 text-sm text-slate-700">
              Allow Returns
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireReceipt"
              checked={formData.return_policy.require_receipt}
              onChange={(e) => handleReturnFieldChange('require_receipt', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="requireReceipt" className="ml-2 text-sm text-slate-700">
              Require Receipt
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="partialReturns"
              checked={formData.return_policy.partial_returns_allowed}
              onChange={(e) => handleReturnFieldChange('partial_returns_allowed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="partialReturns" className="ml-2 text-sm text-slate-700">
              Allow Partial Returns
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="exchangeAllowed"
              checked={formData.return_policy.exchange_allowed}
              onChange={(e) => handleReturnFieldChange('exchange_allowed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="exchangeAllowed" className="ml-2 text-sm text-slate-700">
              Allow Exchanges
            </label>
          </div>
        </div>
      </Card>

      {/* Discount Settings */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Discount Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount_settings.max_discount_percentage}
              onChange={(e) => handleDiscountFieldChange('max_discount_percentage', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="25.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Approval Threshold (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount_settings.approval_threshold_percentage}
              onChange={(e) => handleDiscountFieldChange('approval_threshold_percentage', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Employee Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount_settings.employee_discount_percentage || ''}
              onChange={(e) => handleDiscountFieldChange('employee_discount_percentage', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="15.00"
              disabled={!formData.discount_settings.employee_discount_allowed}
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="managerApproval"
              checked={formData.discount_settings.manager_approval_required}
              onChange={(e) => handleDiscountFieldChange('manager_approval_required', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="managerApproval" className="ml-2 text-sm text-slate-700">
              Manager Approval Required
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="employeeDiscount"
              checked={formData.discount_settings.employee_discount_allowed}
              onChange={(e) => handleDiscountFieldChange('employee_discount_allowed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="employeeDiscount" className="ml-2 text-sm text-slate-700">
              Employee Discount Allowed
            </label>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Minimum Sale Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.transaction_settings.minimum_sale_amount || ''}
              onChange={(e) => handleTransactionFieldChange('minimum_sale_amount', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum Sale Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.transaction_settings.maximum_sale_amount || ''}
              onChange={(e) => handleTransactionFieldChange('maximum_sale_amount', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10000.00"
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="voidApproval"
              checked={formData.transaction_settings.void_requires_approval}
              onChange={(e) => handleTransactionFieldChange('void_requires_approval', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="voidApproval" className="ml-2 text-sm text-slate-700">
              Void Requires Approval
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="refundApproval"
              checked={formData.transaction_settings.refund_requires_approval}
              onChange={(e) => handleTransactionFieldChange('refund_requires_approval', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="refundApproval" className="ml-2 text-sm text-slate-700">
              Refund Requires Approval
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="priceOverride"
              checked={formData.transaction_settings.price_override_allowed}
              onChange={(e) => handleTransactionFieldChange('price_override_allowed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="priceOverride" className="ml-2 text-sm text-slate-700">
              Allow Price Override
            </label>
          </div>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoLogoutIdle"
              checked={formData.session_settings.auto_logout_on_idle}
              onChange={(e) => handleSessionSettingsChange('auto_logout_on_idle', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="autoLogoutIdle" className="ml-2 text-sm text-slate-700">
              Auto Logout on Idle
            </label>
          </div>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="accountingEnabled"
              checked={formData.accounting_software.enabled}
              onChange={(e) => handleAccountingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="accountingEnabled" className="ml-2 text-sm text-slate-700">
              Enable Accounting Integration
            </label>
          </div>

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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={formData.accounting_software.auto_sync}
                    onChange={(e) => handleAccountingChange('auto_sync', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="autoSync" className="ml-2 text-sm text-slate-700">
                    Enable Auto Sync
                  </label>
                </div>
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cloudBackup"
                  checked={formData.data_backup.cloud_backup_enabled}
                  onChange={(e) => handleDataBackupChange('cloud_backup_enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="cloudBackup" className="ml-2 text-sm text-slate-700">
                  Enable Cloud Backup
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Audit Logs</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="auditEnabled"
              checked={formData.audit_logs.enabled}
              onChange={(e) => handleAuditLogsChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="auditEnabled" className="ml-2 text-sm text-slate-700">
              Enable Audit Logging
            </label>
          </div>

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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pciCompliance"
              checked={formData.compliance.pci_compliance_enabled}
              onChange={(e) => handleComplianceChange('pci_compliance_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="pciCompliance" className="ml-2 text-sm text-slate-700">
              PCI Compliance
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="gdprCompliance"
              checked={formData.compliance.gdpr_compliance_enabled}
              onChange={(e) => handleComplianceChange('gdpr_compliance_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="gdprCompliance" className="ml-2 text-sm text-slate-700">
              GDPR Compliance
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="dataEncryption"
              checked={formData.compliance.data_encryption_enabled}
              onChange={(e) => handleComplianceChange('data_encryption_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="dataEncryption" className="ml-2 text-sm text-slate-700">
              Data Encryption
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="accessLogging"
              checked={formData.compliance.access_logging_enabled}
              onChange={(e) => handleComplianceChange('access_logging_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="accessLogging" className="ml-2 text-sm text-slate-700">
              Access Logging
            </label>
          </div>
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
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorAuth"
                checked={formData.security_policies.two_factor_authentication_required}
                onChange={(e) => handleSecurityPoliciesChange('two_factor_authentication_required', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-slate-700">
                Require Two-Factor Authentication
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ipWhitelist"
                checked={formData.security_policies.ip_whitelist_enabled}
                onChange={(e) => handleSecurityPoliciesChange('ip_whitelist_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="ipWhitelist" className="ml-2 text-sm text-slate-700">
                Enable IP Whitelist
              </label>
            </div>
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

export default StoreSettingsPage;
