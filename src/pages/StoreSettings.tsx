import React, { useState, useEffect } from 'react';
import {
  BuildingStorefrontIcon,
  PrinterIcon,
  ComputerDesktopIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { 
  Button, 
  PageHeader, 
  Alert, 
  EnhancedTabs,
  ConfirmDialog,
  Loading,
  InputTextField,
  PropertyCheckbox,
  DropdownSearch,
  Widget
} from '../components/ui';
import { useDiscardChangesDialog } from '../hooks/useConfirmDialog';
import { storeServices } from '../services/store';
import type { StoreSettings, StoreDetails } from '../services/types/store.types';
import { 
  COUNTRIES, 
  LOCALES, 
  LOCATION_TYPES, 
  STORE_TYPES, 
  CURRENCIES,
  TIMEZONES
} from '../constants/dropdownOptions';
import { getDefaultTimezone } from '../utils/timezoneUtils';
import { detectUserCountryCode } from '../utils/locationUtils';

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
    { id: 'hardware', name: 'Hardware Configuration', icon: ComputerDesktopIcon }
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
      
      const tenantId = currentTenant?.id;
      const storeId = currentStore?.store_id || '*';

      if (!tenantId) {
        throw new Error('Tenant ID is required but not available');
      }

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
      <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
        <PageHeader 
          title="Store Settings"
          description="Configure and manage all aspects of your point of sale system"
        />
        
        <Widget
          title="No Store Data Found"
          description="Unable to load store settings and details"
          icon={ExclamationTriangleIcon}
          variant="warning"
          className="text-center"
        >
          <div className="py-8">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No store data found</h3>
            <p className="text-sm text-gray-600 mb-6">
              Unable to load store settings and details. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </Widget>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
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
      const convertedData = storeServices.store.convertToStoreInformation(storeDetails);
      
      // Set default country if not present
      if (!convertedData.address?.country) {
        convertedData.address = {
          ...convertedData.address,
          country: detectUserCountryCode()
        };
      }
      
      return convertedData;
    }
    
    const settingsData = settings.store_information;
    
    // Set default country if not present in settings
    if (!settingsData?.address?.country) {
      return {
        ...settingsData,
        address: {
          ...settingsData?.address,
          country: detectUserCountryCode()
        }
      };
    }
    
    return settingsData;
  };

  const [formData, setFormData] = useState(initializeFormData());

  // Update form data when storeDetails changes
  useEffect(() => {
    if (storeDetails) {
      const convertedData = storeServices.store.convertToStoreInformation(storeDetails);
      
      // Set default country if not present
      if (!convertedData.address?.country) {
        convertedData.address = {
          ...convertedData.address,
          country: detectUserCountryCode()
        };
      }
      
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
    <div className="space-y-6">
      {/* Basic Information Widget */}
      <Widget
        title="Store Details"
        description="Configure your store's basic information and settings"
        icon={BuildingStorefrontIcon}
        variant="primary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Store ID"
            value={formData.store_id || ''}
            onChange={(value) => handleInputChange('store_id', value)}
            placeholder="Auto-generated store ID"
            disabled
            helperText="This is auto-generated and cannot be changed"
          />

          <InputTextField
            label="Store Name"
            required
            value={formData.store_name || ''}
            onChange={(value) => handleInputChange('store_name', value)}
            placeholder="Enter store name"
          />

          <DropdownSearch
            label="Location Type"
            options={LOCATION_TYPES}
            value={formData.location_type || 'retail'}
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
          />

          <DropdownSearch
            label="Store Type"
            options={STORE_TYPES}
            value={formData.store_type || 'general'}
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
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of your store"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DropdownSearch
            label="Locale"
            options={LOCALES}
            value={formData.locale || 'en-US'}
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
            value={formData.currency || 'USD'}
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
            disabled={true}
            placeholder="Select currency"
            searchPlaceholder="Search currencies..."
          />

          <DropdownSearch
            label="Timezone"
            options={TIMEZONES}
            value={formData.timezone || getDefaultTimezone()}
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
        </div>
      </Widget>

      {/* Address Information Widget */}
      <Widget
        title="Store Address"
        description="Enter your store's physical location details"
        icon={MapPinIcon}
      >
        <div className="space-y-6">
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

          <DropdownSearch
            label="Country"
            required
            options={COUNTRIES}
            disabled={true}
            value={formData.address?.country || ''}
            onSelect={(selectedOption) => {
              if (selectedOption && selectedOption.id !== 'separator') {
                handleInputChange('address.country', selectedOption.id);
              }
            }}
            displayValue={(option) => {
              if (!option) return "Select country";
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
                    Popular Countries
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
            placeholder="Select country"
            searchPlaceholder="Search countries..."
            noOptionsMessage="No countries found"
          />
        </div>
      </Widget>

      {/* Contact Information Widget */}
      <Widget
        title="Contact Information"
        description="Store contact details and communication preferences"
        icon={PhoneIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Phone Number"
            value={formData.contact_info?.phone || storeDetails?.telephone1 || ''}
            onChange={(value) => handleInputChange('contact_info.phone', value)}
            placeholder="Enter phone number"
          />

          <InputTextField
            label="Email Address"
            value={formData.contact_info?.email || storeDetails?.email || ''}
            onChange={(value) => handleInputChange('contact_info.email', value)}
            placeholder="Enter email address"
          />

          <InputTextField
            label="Website"
            value={formData.contact_info?.website || ''}
            onChange={(value) => handleInputChange('contact_info.website', value)}
            placeholder="Enter website URL"
          />

          <InputTextField
            label="Fax Number"
            value={formData.contact_info?.fax || ''}
            onChange={(value) => handleInputChange('contact_info.fax', value)}
            placeholder="Enter fax number"
          />
        </div>
      </Widget>

      {/* Store Timing Widget */}
      <Widget
        title="Store Timing"
        description="Configure your store's operational hours"
        icon={ClockIcon}
      >
        <div className="space-y-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700">{day}</div>
              <div className="flex-1">
                <InputTextField
                  label=""
                  value={formData.store_timing?.[day.toLowerCase()] || ''}
                  onChange={(value) => handleTimingChange(day.toLowerCase(), value)}
                  placeholder="9:00 AM - 9:00 PM"
                />
              </div>
            </div>
          ))}
        </div>
      </Widget>

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

// Tab Components
const ReceiptSettingsTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState((settings.receipt_settings as any) || {});

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ receipt_settings: formData });
  };

  return (
    <div className="space-y-6">
      <Widget
        title="Receipt Configuration"
        description="Configure receipt printing and display settings"
        icon={PrinterIcon}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label="Receipt Header"
              value={formData?.header || ''}
              onChange={(value) => handleFieldChange('header', value)}
              placeholder="Enter receipt header text"
            />

            <InputTextField
              label="Receipt Footer"
              value={formData?.footer || ''}
              onChange={(value) => handleFieldChange('footer', value)}
              placeholder="Enter receipt footer text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PropertyCheckbox
              title="Show Logo"
              description="Display store logo on receipts"
              checked={formData?.show_logo || false}
              onChange={(checked) => handleFieldChange('show_logo', checked)}
            />

            <PropertyCheckbox
              title="Show Store Info"
              description="Display store information on receipts"
              checked={formData?.show_customer_info || false}
              onChange={(checked) => handleFieldChange('show_customer_info', checked)}
            />
          </div>
        </div>
      </Widget>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8 py-3">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Receipt Settings
        </Button>
      </div>
    </div>
  );
};

const HardwareConfigTab: React.FC<TabProps> = ({ settings, onSave, onFieldChange }) => {
  const [formData, setFormData] = useState((settings.hardware_config as any) || {});

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    onFieldChange();
  };

  const handleSave = () => {
    onSave({ hardware_config: formData });
  };

  return (
    <div className="space-y-6">
      <Widget
        title="Hardware Configuration"
        description="Configure connected hardware devices and settings"
        icon={ComputerDesktopIcon}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label="Printer Name"
              value={formData?.printer_name || ''}
              onChange={(value) => handleFieldChange('printer_name', value)}
              placeholder="Enter printer name"
            />

            <InputTextField
              label="Cash Drawer"
              value={formData?.cash_drawer_name || ''}
              onChange={(value) => handleFieldChange('cash_drawer_name', value)}
              placeholder="Enter cash drawer name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PropertyCheckbox
              title="Auto Print Receipt"
              description="Automatically print receipts after transactions"
              checked={formData?.auto_print || false}
              onChange={(checked) => handleFieldChange('auto_print', checked)}
            />

            <PropertyCheckbox
              title="Open Cash Drawer"
              description="Automatically open cash drawer after sales"
              checked={formData?.auto_open_drawer || false}
              onChange={(checked) => handleFieldChange('auto_open_drawer', checked)}
            />
          </div>
        </div>
      </Widget>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8 py-3">
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Hardware Config
        </Button>
      </div>
    </div>
  );
};

export default StoreSettingsPage;
