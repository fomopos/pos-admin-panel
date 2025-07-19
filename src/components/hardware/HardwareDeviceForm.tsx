import React, { useState, useEffect } from 'react';
import {
  PrinterIcon,
  QrCodeIcon,
  XMarkIcon,
  CheckIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import {
  Modal,
  Button,
  InputTextField,
  DropdownSearch,
  PropertyCheckbox,
  Widget,
  Alert
} from '../ui';
import {
  NetworkPrinterConfig as NetworkPrinterConfigComponent,
  ThermalPrinterConfig as ThermalPrinterConfigComponent,
  KitchenPrinterConfig as KitchenPrinterConfigComponent,
  ScannerConfig as ScannerConfigComponent
} from './device-configs';
import { useTenantStore } from '../../tenants/tenantStore';
import { useError } from '../../hooks/useError';
import type {
  HardwareDevice
} from '../../types/hardware';
import {
  DEVICE_TYPES,
  CONNECTION_TYPES
} from '../../types/hardware-api';
import type {
  ThermalPrinterConfig,
  KotPrinterConfig,
  NetworkPrinterConfig,
  BarcodeScannerConfig,
  HardwareOption
} from '../../types/hardware-api';

interface HardwareDeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: HardwareDevice, terminalId?: string) => void;
  device?: HardwareDevice | null;
  level: 'store' | 'terminal';
  mode: 'create' | 'edit';
}

const HardwareDeviceForm: React.FC<HardwareDeviceFormProps> = ({
  isOpen,
  onClose,
  onSave,
  device,
  level,
  mode
}) => {
  const { currentStore } = useTenantStore();
  const { showError, showValidationError } = useError();
  const [formData, setFormData] = useState<Partial<HardwareDevice>>({
    name: '',
    type: 'receipt_printer',
    enabled: true,
    connection_type: 'network'
  });
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
  const [apiDeviceType, setApiDeviceType] = useState<string>(''); // Track the actual API device type
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Get terminal options for dropdown
  const getTerminalOptions = (): HardwareOption[] => {
    if (!currentStore?.terminals) return [];
    
    return Object.values(currentStore.terminals).map(terminal => ({
      id: terminal.terminal_id,
      label: `${terminal.name} (${terminal.terminal_id})`,
      value: terminal.terminal_id,
      description: `${terminal.platform} - ${terminal.model} - ${terminal.status}`,
      icon: terminal.status === 'active' ? '🟢' : '🔴'
    }));
  };

  // Device type options from API spec
  const deviceTypeOptions: HardwareOption[] = DEVICE_TYPES;

  // Map API device types to UI device types for form logic
  const getUIDeviceType = (apiDeviceType: string): string => {
    // Most device types map directly now
    const mappings: Record<string, string> = {
      'thermal_printer': 'thermal_printer',
      'kitchen_printer': 'kitchen_printer', 
      'network_printer': 'network_printer',
      'scanner': 'scanner',
      'cash_drawer': 'cash_drawer',
      'label_printer': 'label_printer'
    };
    return mappings[apiDeviceType] || apiDeviceType;
  };

  // Helper function to get options based on device type
  const getOptionsForDeviceType = () => {
    const characterEncodingOptions: HardwareOption[] = [
      { id: 'utf8', label: 'UTF-8', value: 'utf8' },
      { id: 'ascii', label: 'ASCII', value: 'ascii' }
    ];

    const scanModeOptions: HardwareOption[] = [
      { id: 'manual', label: 'Manual', value: 'manual' },
      { id: 'automatic', label: 'Automatic', value: 'automatic' }
    ];

    return {
      characterEncodingOptions,
      scanModeOptions
    };
  };

  const { characterEncodingOptions } = getOptionsForDeviceType();

  useEffect(() => {
    if (device && mode === 'edit') {
      setFormData(device);
    } else {
      setFormData({
        name: '',
        type: 'receipt_printer',
        enabled: true,
        connection_type: 'network'
      });
    }
    
    // Reset terminal selection for new devices or when switching levels
    if (level === 'terminal' && mode === 'create') {
      setSelectedTerminalId('');
    }
    
    setErrors({});
    setTestResult(null);
  }, [device, mode, isOpen, level]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeviceTypeChange = (typeValue: string) => {
    // Store the actual API device type  
    const selectedApiType = typeValue;
    setApiDeviceType(selectedApiType);
    // Map to UI device type for form logic
    const uiDeviceType = getUIDeviceType(selectedApiType);
    
    // Reset form data when device type changes
    const baseData = {
      name: formData.name || '',
      type: uiDeviceType as HardwareDevice['type'], // Use UI device type for form
      enabled: formData.enabled ?? true,
      connection_type: 'network' as const
    };

    // Add type-specific default values based on UI type
    switch (uiDeviceType) {
      case 'receipt_printer':
        // Handle thermal_printer and label_printer
        if (selectedApiType === 'thermal_printer' || selectedApiType === 'label_printer') {
          setFormData({
            ...baseData,
            paper_size: 'thermal_80mm',
            auto_print: true,
            print_copies: 1,
            cut_paper: true,
            open_drawer: false,
            character_encoding: 'utf8',
            test_mode: false
          } as any);
        } else if (selectedApiType === 'network_printer') {
          setFormData({
            ...baseData,
            paper_size: 'A4' as any,
            paper_orientation: 'portrait',
            print_quality: 'normal',
            color_mode: 'monochrome',
            duplex_printing: false,
            print_copies: 1,
            character_encoding: 'utf8',
            supported_formats: ['PDF', 'TXT'],
            max_resolution: '1200x1200 dpi',
            tray_capacity: 250,
            auto_paper_detection: true
          } as any);
        }
        break;
      case 'kitchen_printer':
        setFormData({
          ...baseData,
          paper_size: 'thermal_80mm',
          print_header: true,
          print_timestamp: true,
          print_order_number: true,
          print_table_info: true,
          auto_cut: true,
          character_encoding: 'utf8',
          kitchen_sections: ['hot_kitchen']
        } as Partial<KotPrinterConfig>);
        break;
      case 'scanner':
        setFormData({
          ...baseData,
          connection_type: 'usb',
          prefix: '',
          suffix: '\r\n',
          min_length: 8,
          max_length: 20,
          scan_mode: 'manual' as any, // Using 'any' to avoid type conflict with old HardwareDevice type
          beep_on_scan: true,
          decode_types: ['CODE128', 'EAN13', 'UPC']
        });
        break;
      case 'cash_drawer':
        // Cash drawer only needs basic device properties, no additional config in API
        setFormData(baseData);
        break;
      default:
        setFormData(baseData);
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Device name is required';
      showValidationError('Device name is required', 'name', formData.name);
    }

    if (!formData.type) {
      newErrors.type = 'Device type is required';
      showValidationError('Device type is required', 'type', formData.type);
    }

    if (!formData.connection_type) {
      newErrors.connection_type = 'Connection type is required';
      showValidationError('Connection type is required', 'connection_type', formData.connection_type);
    }

    // Terminal selection validation for terminal level
    if (level === 'terminal' && !selectedTerminalId) {
      newErrors.terminal = 'Please select a terminal for this device';
      showValidationError('Please select a terminal for this device', 'terminal', selectedTerminalId);
    }

    // Network connection validation
    if (formData.connection_type === 'network') {
      if (formData.type === 'receipt_printer' || formData.type === 'kitchen_printer') {
        const config = formData as Partial<ThermalPrinterConfig | KotPrinterConfig>;
        if (!config.ip_address?.trim()) {
          newErrors.ip_address = 'IP address is required for network connection';
          showValidationError('IP address is required for network connection', 'ip_address', config.ip_address);
        }
        if (!config.port || config.port <= 0) {
          newErrors.port = 'Valid port number is required';
          showValidationError('Valid port number is required', 'port', config.port);
        }
      }
    }

    // Scanner-specific validation
    if (formData.type === 'scanner') {
      const scannerConfig = formData as Partial<BarcodeScannerConfig>;
      if (!scannerConfig.min_length || scannerConfig.min_length < 1) {
        newErrors.min_length = 'Minimum length must be at least 1';
        showValidationError('Minimum length must be at least 1', 'min_length', scannerConfig.min_length);
      }
      if (!scannerConfig.max_length || scannerConfig.max_length < scannerConfig.min_length!) {
        newErrors.max_length = 'Maximum length must be greater than minimum length';
        showValidationError('Maximum length must be greater than minimum length', 'max_length', scannerConfig.max_length);
      }
    }

    // Kitchen printer specific validation
    if (formData.type === 'kitchen_printer') {
      const kitchenConfig = formData as Partial<KotPrinterConfig>;
      if (!kitchenConfig.kitchen_sections || kitchenConfig.kitchen_sections.length === 0) {
        newErrors.kitchen_sections = 'At least one kitchen section must be selected';
        showValidationError('At least one kitchen section must be selected', 'kitchen_sections', kitchenConfig.kitchen_sections);
      }
    }

    setErrors(newErrors);
    
    // Show validation error summary if there are errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors);
      showValidationError(
        `Please fix the following errors before saving the device: ${errorMessages.join(', ')}`,
        'form_validation',
        null,
        'required'
      );
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Clear any previous errors
      setErrors({});
      
      const deviceData: HardwareDevice = {
        id: device?.id || `${formData.type}_${Date.now()}`,
        ...formData
      } as HardwareDevice;

      // Pass terminal ID for terminal level devices
      onSave(deviceData, level === 'terminal' ? selectedTerminalId : undefined);
      onClose();
    } catch (error: any) {
      console.error('Failed to save device:', error);
      
      // Use error framework for API error display
      showError(error?.message || 'Failed to save device. Please try again.');
      
      // Also set local error for backward compatibility
      setErrors({ general: error?.message || 'Failed to save device. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!formData.name) {
      setTestResult({ success: false, message: 'Please save the device configuration first' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Simulate device test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test result based on connection type
      const success = Math.random() > 0.3; // 70% success rate for demo
      setTestResult({
        success,
        message: success 
          ? `${formData.type?.replace('_', ' ')} test successful`
          : 'Device not responding. Please check connection settings.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeviceSpecificFields = () => {
    const config = formData;
    const commonProps = {
      onFieldChange: handleInputChange,
      errors,
      characterEncodingOptions
    };

    // Handle API device type mapping
    switch (apiDeviceType || formData.type) {
      case 'thermal_printer':
        return (
          <ThermalPrinterConfigComponent
            config={config as Partial<ThermalPrinterConfig>}
            connectionType={formData.connection_type || 'network'}
            {...commonProps}
          />
        );

      case 'kitchen_printer':
        return (
          <KitchenPrinterConfigComponent
            config={config as Partial<KotPrinterConfig>}
            connectionType={formData.connection_type || 'network'}
            {...commonProps}
          />
        );

      case 'network_printer':
        return (
          <NetworkPrinterConfigComponent
            config={config as Partial<NetworkPrinterConfig>}
            {...commonProps}
          />
        );

      case 'scanner':
        return (
          <ScannerConfigComponent
            config={config as Partial<BarcodeScannerConfig>}
            {...commonProps}
          />
        );

      case 'cash_drawer':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Cash drawer devices only require basic connection settings. 
                No additional configuration is needed according to the API specification.
              </p>
            </div>
          </div>
        );

      case 'label_printer':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Label printer configuration will be available soon. 
                For now, only basic connection settings are required.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Device Type</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Please select a device type above to configure device-specific settings and options.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'create' ? 'Add' : 'Edit'} Hardware Device - ${level === 'store' ? 'Store Level' : 'Terminal Level'}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={isLoading || !formData.name}
            className="flex items-center space-x-2"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Test Device</span>
          </Button>

          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
              onClick={(e) => { e.preventDefault(); handleSave(); }}
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Add Device' : 'Save Changes'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* Error Alert */}
        {errors.general && (
          <Alert variant="error">
            {errors.general}
          </Alert>
        )}

        {/* Test Result Alert */}
        {testResult && (
          <Alert variant={testResult.success ? "success" : "error"}>
            {testResult.message}
          </Alert>
        )}

        {/* Basic Information */}
        <Widget
          title="Basic Information"
          description="Configure the basic device settings"
          icon={PrinterIcon}
          className='overflow-visible'
        >
          <div className="space-y-6">
            {/* Terminal Selection for Terminal Level */}
            {level === 'terminal' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-orange-900 mb-2">Terminal Assignment</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Select which terminal this hardware device will be assigned to.
                </p>
                <DropdownSearch
                  label="Select Terminal"
                  options={getTerminalOptions()}
                  value={selectedTerminalId}
                  onSelect={(option) => {
                    setSelectedTerminalId(option?.id || '');
                    if (errors.terminal) {
                      setErrors(prev => ({ ...prev, terminal: '' }));
                    }
                  }}
                  placeholder="Choose a terminal"
                  required
                  error={errors.terminal}
                  displayValue={(option) => option ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{option.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </div>
                  ) : 'Choose a terminal'}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Device Name"
                value={formData.name || ''}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="Enter device name"
                required
                error={errors.name}
              />

              <DropdownSearch
                label="Device Type"
                options={deviceTypeOptions}
                value={formData.type || ''}
                onSelect={(option) => {
                  if (option) {
                    // Use the API device type value directly
                    handleDeviceTypeChange(option.id);
                  }
                }}
                placeholder="Select device type"
                required
                error={errors.type}
                displayValue={(option: any) => option ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                ) : 'Select device type'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DropdownSearch
                label="Connection Type"
                options={CONNECTION_TYPES}
                value={formData.connection_type || ''}
                onSelect={(option) => option && handleInputChange('connection_type', option.id)}
                placeholder="Select connection type"
                required
                error={errors.connection_type}
                displayValue={(option) => option ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                ) : 'Select connection type'}
              />

              <div>
                <PropertyCheckbox
                  title="Enable Device"
                  description="Device is active and available for use"
                  checked={formData.enabled ?? true}
                  onChange={(checked) => handleInputChange('enabled', checked)}
                />
              </div>
            </div>
          </div>
        </Widget>

        {/* Device-Specific Configuration */}
        <Widget
          title="Device Configuration"
          description={formData.type 
            ? `Configure ${formData.type.replace('_', ' ')} specific settings`
            : "Select a device type to configure specific settings"
          }
          icon={formData.type 
            ? (formData.type === 'scanner' ? QrCodeIcon : PrinterIcon)
            : PrinterIcon
          }
          className='overflow-visible'
        >
          {renderDeviceSpecificFields()}
        </Widget>
      </form>
    </Modal>
  );
};

export default HardwareDeviceForm;
