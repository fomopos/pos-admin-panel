import React, { useState, useEffect } from 'react';
import {
  PrinterIcon,
  QrCodeIcon,
  XMarkIcon,
  CheckIcon,
  PlayIcon,
  CpuChipIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  Modal,
  Button,
  InputTextField,
  DropdownSearch,
  Widget,
  Alert
} from '../ui';
import {
  NetworkConfigForm,
  BluetoothConfigForm,
  USBConfigForm,
  AIDLConfigForm,
  SerialConfigForm
} from './connection-configs';
import {
  ThermalPrinterConfig as ThermalPrinterConfigComponent,
  KotPrinterConfig as KotPrinterConfigComponent,
  NetworkPrinterConfig as NetworkPrinterConfigComponent,
  BarcodeScannerConfig as BarcodeScannerConfigComponent,
  PaymentTerminalConfig as PaymentTerminalConfigComponent,
  ScaleConfig as ScaleConfigComponent,
  LabelPrinterConfig as LabelPrinterConfigComponent,
  CapabilitiesConfig as CapabilitiesConfigComponent
} from './device-configs';
import { useTenantStore } from '../../tenants/tenantStore';
import { useError } from '../../hooks/useError';
import type {
  HardwareDevice,
  DeviceType,
  ConnectionType,
  NetworkConfig,
  BluetoothConfig,
  USBConfig,
  AIDLConfig,
  SerialConfig,
  KotPrinterConfig,
  BarcodeScannerConfig,
  Capabilities
} from '../../types/hardware-new.types';
import {
  DEVICE_TYPES,
  CONNECTION_TYPES,
  getConnectionTypesForDevice,
  getDeviceModelsByType
} from '../../constants/hardwareOptions';

interface HardwareDeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Partial<HardwareDevice>, terminalId?: string) => void;
  device?: HardwareDevice | null;
  level: 'store' | 'terminal';
  mode: 'create' | 'edit';
}

interface HardwareOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
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
  
  // Form state with new type structure
  const [formData, setFormData] = useState<Partial<HardwareDevice>>({
    name: '',
    device_type: 'thermal_printer',
    connection_type: 'network',
    status: 'connected',
    description: '',
    location: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    firmware_version: ''
  });
  
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
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

  // Get connection type options based on selected device type
  const getConnectionTypeOptions = (): HardwareOption[] => {
    if (!formData.device_type) return CONNECTION_TYPES;
    return getConnectionTypesForDevice(formData.device_type);
  };

  // Get device model options based on selected device type
  const getDeviceModelOptions = (): HardwareOption[] => {
    if (!formData.device_type) return [];
    return getDeviceModelsByType(formData.device_type);
  };

  useEffect(() => {
    if (device && mode === 'edit') {
      setFormData(device);
      if (device.terminal_id) {
        setSelectedTerminalId(device.terminal_id);
      }
    } else {
      // Default values for new device
      setFormData({
        name: '',
        device_type: 'thermal_printer',
        connection_type: 'network',
        status: 'connected',
        description: '',
        location: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        firmware_version: '',
        connection_config: {},
        device_config: {},
        capabilities: {
          can_print: false,
          can_scan: false,
          can_accept_payment: false,
          can_weigh: false,
          can_open_drawer: false
        }
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

  const handleConnectionConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      connection_config: {
        ...prev.connection_config,
        [field]: value
      }
    }));
    // Clear error when user changes value
    const errorKey = `connection_config.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleDeviceConfigChange = (config: any) => {
    setFormData(prev => ({
      ...prev,
      device_config: config
    }));
  };

  const handleCapabilitiesChange = (config: Capabilities) => {
    setFormData(prev => ({
      ...prev,
      capabilities: config
    }));
  };

  const handleDeviceTypeChange = (deviceType: DeviceType) => {
    // Get compatible connection types for this device
    const compatibleConnections = getConnectionTypesForDevice(deviceType);
    const defaultConnection = compatibleConnections[0]?.id as ConnectionType || 'network';

    // Reset form with new device type and default connection
    setFormData(prev => ({
      ...prev,
      device_type: deviceType,
      connection_type: defaultConnection,
      device_subtype: undefined,
      connection_config: {},
      device_config: {},
      capabilities: {
        can_print: deviceType.includes('printer'),
        can_scan: deviceType === 'barcode_scanner',
        can_accept_payment: deviceType === 'payment_terminal',
        can_weigh: deviceType === 'scale',
        can_open_drawer: deviceType === 'cash_drawer'
      }
    }));
  };

  const handleConnectionTypeChange = (connectionType: ConnectionType) => {
    setFormData(prev => ({
      ...prev,
      connection_type: connectionType,
      connection_config: {} // Reset connection config when type changes
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic field validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Device name is required';
    }

    if (!formData.device_type) {
      newErrors.device_type = 'Device type is required';
    }

    if (!formData.connection_type) {
      newErrors.connection_type = 'Connection type is required';
    }

    // Terminal selection validation for terminal level
    if (level === 'terminal' && !selectedTerminalId) {
      newErrors.terminal = 'Please select a terminal for this device';
    }

    // Connection config validation based on connection type
    if (formData.connection_type === 'network') {
      const config = formData.connection_config as NetworkConfig;
      if (!config?.ip_address?.trim()) {
        newErrors['connection_config.ip_address'] = 'IP address is required for network connection';
      }
      if (!config?.port || config.port <= 0 || config.port > 65535) {
        newErrors['connection_config.port'] = 'Valid port number (1-65535) is required';
      }
    } else if (formData.connection_type === 'bluetooth') {
      const config = formData.connection_config as BluetoothConfig;
      if (!config?.mac_address?.trim()) {
        newErrors['connection_config.mac_address'] = 'MAC address is required for Bluetooth connection';
      }
    } else if (formData.connection_type === 'usb') {
      const config = formData.connection_config as USBConfig;
      if (!config?.vendor_id) {
        newErrors['connection_config.vendor_id'] = 'Vendor ID is required for USB connection';
      }
      if (!config?.product_id) {
        newErrors['connection_config.product_id'] = 'Product ID is required for USB connection';
      }
    } else if (formData.connection_type === 'serial') {
      const config = formData.connection_config as SerialConfig;
      if (!config?.baud_rate || config.baud_rate <= 0) {
        newErrors['connection_config.baud_rate'] = 'Baud rate is required for serial connection';
      }
    } else if (formData.connection_type === 'aidl') {
      const config = formData.connection_config as AIDLConfig;
      if (!config?.package_name?.trim()) {
        newErrors['connection_config.package_name'] = 'Package name is required for AIDL connection';
      }
      if (!config?.service_name?.trim()) {
        newErrors['connection_config.service_name'] = 'Service name is required for AIDL connection';
      }
    }

    // Device-specific config validation
    if (formData.device_type === 'kot_printer') {
      const config = formData.device_config as KotPrinterConfig;
      if (!config?.kitchen_sections || config.kitchen_sections.length === 0) {
        newErrors['device_config.kitchen_sections'] = 'At least one kitchen section must be selected';
      }
    } else if (formData.device_type === 'barcode_scanner') {
      const config = formData.device_config as BarcodeScannerConfig;
      if (config?.min_length && config?.max_length && config.max_length < config.min_length) {
        newErrors['device_config.max_length'] = 'Maximum length must be greater than minimum length';
      }
    }

    setErrors(newErrors);
    
    // Show validation error summary if there are errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).slice(0, 3); // Show first 3 errors
      showValidationError(
        `Please fix validation errors: ${errorMessages.join(', ')}${Object.keys(newErrors).length > 3 ? '...' : ''}`,
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
      
      // Prepare device data
      const deviceData: Partial<HardwareDevice> = {
        ...formData,
        terminal_id: level === 'terminal' ? selectedTerminalId : undefined,
        updated_at: new Date().toISOString()
      };

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
          ? `${formData.device_type?.replace('_', ' ')} test successful`
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

  // Wrapper for connection config onChange - converts full config to field changes
  const handleConnectionConfigUpdate = (config: any) => {
    setFormData(prev => ({
      ...prev,
      connection_config: config
    }));
  };

  // Render connection config form based on connection type
  const renderConnectionConfig = () => {
    if (!formData.connection_type) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Please select a connection type to configure connection settings.
          </p>
        </div>
      );
    }

    const commonPropsNetwork = {
      config: (formData.connection_config || {}) as any,
      onFieldChange: handleConnectionConfigChange,
      errors
    };

    const commonPropsOthers = {
      config: (formData.connection_config || {}) as any,
      onChange: handleConnectionConfigUpdate,
      errors
    };

    switch (formData.connection_type) {
      case 'network':
        return <NetworkConfigForm {...commonPropsNetwork} />;
      case 'bluetooth':
        return <BluetoothConfigForm {...commonPropsOthers} />;
      case 'usb':
        return <USBConfigForm {...commonPropsOthers} />;
      case 'serial':
        return <SerialConfigForm {...commonPropsOthers} />;
      case 'aidl':
        return <AIDLConfigForm {...commonPropsOthers} />;
      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Connection type "{formData.connection_type}" does not require additional configuration.
            </p>
          </div>
        );
    }
  };

  // Render device config form based on device type
  const renderDeviceConfig = () => {
    if (!formData.device_type) {
      return (
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
      );
    }

    const commonProps = {
      config: (formData.device_config || {}) as any,
      onChange: handleDeviceConfigChange,
      errors
    };

    switch (formData.device_type) {
      case 'thermal_printer':
        return <ThermalPrinterConfigComponent {...commonProps} />;
      
      case 'kot_printer':
        return <KotPrinterConfigComponent {...commonProps} />;
      
      case 'network_printer':
        return <NetworkPrinterConfigComponent {...commonProps} />;
      
      case 'barcode_scanner':
        return <BarcodeScannerConfigComponent {...commonProps} />;
      
      case 'payment_terminal':
        return <PaymentTerminalConfigComponent {...commonProps} />;
      
      case 'scale':
        return <ScaleConfigComponent {...commonProps} />;
      
      case 'label_printer':
        return <LabelPrinterConfigComponent {...commonProps} />;
      
      case 'cash_drawer':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Cash drawer devices only require basic connection settings. 
              No additional device configuration is needed.
            </p>
          </div>
        );

      default:
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700">
              Device type "{formData.device_type}" does not have specific configuration options yet.
            </p>
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
          icon={CpuChipIcon}
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
                placeholder="Enter device name (e.g., 'Receipt Printer 1')"
                required
                error={errors.name}
              />

              <DropdownSearch
                label="Device Type"
                options={DEVICE_TYPES}
                value={formData.device_type || ''}
                onSelect={(option) => {
                  if (option) {
                    handleDeviceTypeChange(option.id as DeviceType);
                  }
                }}
                placeholder="Select device type"
                required
                error={errors.device_type}
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
                options={getConnectionTypeOptions()}
                value={formData.connection_type || ''}
                onSelect={(option) => option && handleConnectionTypeChange(option.id as ConnectionType)}
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

              <DropdownSearch
                label="Device Model (Optional)"
                options={getDeviceModelOptions()}
                value={formData.model || ''}
                onSelect={(option) => option && handleInputChange('model', option.id)}
                placeholder="Select device model"
                error={errors.model}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Manufacturer (Optional)"
                value={formData.manufacturer || ''}
                onChange={(value) => handleInputChange('manufacturer', value)}
                placeholder="e.g., Epson, Star, Zebra"
              />

              <InputTextField
                label="Serial Number (Optional)"
                value={formData.serial_number || ''}
                onChange={(value) => handleInputChange('serial_number', value)}
                placeholder="Device serial number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Location (Optional)"
                value={formData.location || ''}
                onChange={(value) => handleInputChange('location', value)}
                placeholder="e.g., Front Counter, Kitchen"
              />

              <InputTextField
                label="Firmware Version (Optional)"
                value={formData.firmware_version || ''}
                onChange={(value) => handleInputChange('firmware_version', value)}
                placeholder="e.g., 1.2.3"
              />
            </div>

            <InputTextField
              label="Description (Optional)"
              value={formData.description || ''}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Additional notes about this device"
            />
          </div>
        </Widget>

        {/* Connection Configuration */}
        <Widget
          title="Connection Configuration"
          description={formData.connection_type 
            ? `Configure ${formData.connection_type} connection settings`
            : "Select a connection type to configure connection settings"
          }
          icon={SignalIcon}
          className='overflow-visible'
        >
          {renderConnectionConfig()}
        </Widget>

        {/* Device-Specific Configuration */}
        <Widget
          title="Device Configuration"
          description={formData.device_type 
            ? `Configure ${formData.device_type.replace('_', ' ')} specific settings`
            : "Select a device type to configure specific settings"
          }
          icon={formData.device_type 
            ? (formData.device_type === 'barcode_scanner' ? QrCodeIcon : PrinterIcon)
            : PrinterIcon
          }
          className='overflow-visible'
        >
          {renderDeviceConfig()}
        </Widget>

        {/* Device Capabilities */}
        <Widget
          title="Device Capabilities"
          description="Define what this device can do"
          icon={CpuChipIcon}
          className='overflow-visible'
        >
          <CapabilitiesConfigComponent
            config={(formData.capabilities || {}) as Capabilities}
            onChange={handleCapabilitiesChange}
            errors={errors}
          />
        </Widget>
      </form>
    </Modal>
  );
};

export default HardwareDeviceForm;
