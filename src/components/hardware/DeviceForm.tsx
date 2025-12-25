/**
 * Hardware Device Form - New API Specification
 * 
 * Modal form for creating and editing hardware devices per the new API spec.
 * Supports all 6 device types and 3 connection types with dynamic configuration forms.
 * 
 * @see src/types/hardware.types.ts
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DevicePhoneMobileIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  InputTextField,
  DropdownSearch,
  Alert,
  Widget
} from '../ui';
import { useError } from '../../hooks/useError';

// Types
import type {
  HardwareDevice,
  CreateHardwareDTO,
  DeviceType,
  ConnectionType,
  NetworkConfig,
  BluetoothConfig,
  USBConfig,
  PrinterConfig,
  ScannerConfig,
  PaymentConfig,
  ScaleConfig,
  DrawerConfig,
  DisplayConfig
} from '../../types/hardware.types';

// Options & helpers
import {
  DEVICE_TYPES,
  CONNECTION_TYPES,
  getConnectionTypesForDevice,
  getDefaultNetworkConfig,
  getDefaultBluetoothConfig,
  getDefaultUSBConfig,
  getDefaultPrinterConfig,
  getDefaultScannerConfig,
  getDefaultPaymentConfig,
  getDefaultScaleConfig,
  getDefaultDrawerConfig,
  getDefaultDisplayConfig,
  isValidIPAddress,
  isValidMACAddress,
  isValidPort
} from '../../constants/hardware.options';

// Connection config forms
import { NetworkConfigForm } from './connection-configs/NetworkConfig';
import { BluetoothConfigForm } from './connection-configs/BluetoothConfig';
import { USBConfigForm } from './connection-configs/USBConfig';

// Device config forms
import { PrinterConfigForm } from './device-configs/PrinterConfig';
import { ScannerConfigForm } from './device-configs/ScannerConfigForm';
import { PaymentConfigForm } from './device-configs/PaymentConfigForm';
import { ScaleConfigForm } from './device-configs/ScaleConfigForm';
import { DrawerConfigForm } from './device-configs/DrawerConfigForm';
import { DisplayConfigForm } from './device-configs/DisplayConfigForm';

// ============================================================================
// TYPES
// ============================================================================

interface DeviceFormProps {
  /** Device to edit (null for new device) */
  device?: HardwareDevice | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Save handler */
  onSave: (device: CreateHardwareDTO) => Promise<void>;
  /** Optional terminal ID for terminal-level devices */
  terminalId?: string;
  /** Configuration level: store or terminal */
  level?: 'store' | 'terminal';
}

interface FormErrors {
  [key: string]: string;
}

interface TestResult {
  success: boolean;
  message: string;
}

// ============================================================================
// FORM STATE TYPE
// ============================================================================

interface FormData {
  id: string;
  name: string;
  type: DeviceType | '';
  connection_type: ConnectionType | '';
  terminal_id?: string;
  enabled: boolean;
  // Connection configs
  network_config?: NetworkConfig;
  bluetooth_config?: BluetoothConfig;
  usb_config?: USBConfig;
  // Device configs
  printer_config?: PrinterConfig;
  scanner_config?: ScannerConfig;
  payment_config?: PaymentConfig;
  scale_config?: ScaleConfig;
  drawer_config?: DrawerConfig;
  display_config?: DisplayConfig;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DeviceForm: React.FC<DeviceFormProps> = ({
  device,
  isOpen,
  onClose,
  onSave,
  terminalId,
  level = 'store'
}) => {
  const { t } = useTranslation();
  const { showError, showValidationError, showSuccess } = useError();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    type: '',
    connection_type: '',
    terminal_id: terminalId,
    enabled: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [activeSection, setActiveSection] = useState<'basic' | 'connection' | 'device'>('basic');

  const isEditMode = !!device;

  // ============================================================================
  // INITIALIZE FORM
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      if (device) {
        // Edit mode - populate from device
        setFormData({
          id: device.id,
          name: device.name || '',
          type: device.type,
          connection_type: device.connection_type,
          terminal_id: device.terminal_id,
          enabled: device.enabled ?? true,
          network_config: device.network_config,
          bluetooth_config: device.bluetooth_config,
          usb_config: device.usb_config,
          printer_config: device.printer_config,
          scanner_config: device.scanner_config,
          payment_config: device.payment_config,
          scale_config: device.scale_config,
          drawer_config: device.drawer_config,
          display_config: device.display_config
        });
      } else {
        // New device - reset form
        setFormData({
          id: `device_${Date.now()}`,
          name: '',
          type: '',
          connection_type: '',
          terminal_id: terminalId,
          enabled: true
        });
      }
      setErrors({});
      setTestResult(null);
      setActiveSection('basic');
    }
  }, [isOpen, device, terminalId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle device type change - reset related configs
   */
  const handleDeviceTypeChange = useCallback((newType: DeviceType | '') => {
    setFormData(prev => {
      const updated: FormData = {
        ...prev,
        type: newType,
        // Reset all device configs
        printer_config: undefined,
        scanner_config: undefined,
        payment_config: undefined,
        scale_config: undefined,
        drawer_config: undefined,
        display_config: undefined
      };

      // Set default device config based on type
      if (newType === 'printer') {
        updated.printer_config = getDefaultPrinterConfig('thermal');
      } else if (newType === 'scanner') {
        updated.scanner_config = getDefaultScannerConfig();
      } else if (newType === 'payment_terminal') {
        updated.payment_config = getDefaultPaymentConfig();
      } else if (newType === 'scale') {
        updated.scale_config = getDefaultScaleConfig();
      } else if (newType === 'cash_drawer') {
        updated.drawer_config = getDefaultDrawerConfig();
      } else if (newType === 'display') {
        updated.display_config = getDefaultDisplayConfig();
      }

      // Reset connection type if not valid for new device type
      if (newType) {
        const validConnections = getConnectionTypesForDevice(newType);
        if (!validConnections.find(c => c.value === prev.connection_type)) {
          updated.connection_type = '';
          updated.network_config = undefined;
          updated.bluetooth_config = undefined;
          updated.usb_config = undefined;
        }
      }

      return updated;
    });

    // Clear device config errors
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.includes('_config') && !key.includes('network') && !key.includes('bluetooth') && !key.includes('usb')) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, []);

  /**
   * Handle connection type change - reset connection config
   */
  const handleConnectionTypeChange = useCallback((newConnectionType: ConnectionType | '') => {
    setFormData(prev => {
      const updated: FormData = {
        ...prev,
        connection_type: newConnectionType,
        // Reset all connection configs
        network_config: undefined,
        bluetooth_config: undefined,
        usb_config: undefined
      };

      // Set default connection config based on type
      if (newConnectionType === 'network') {
        updated.network_config = getDefaultNetworkConfig();
      } else if (newConnectionType === 'bluetooth') {
        updated.bluetooth_config = getDefaultBluetoothConfig();
      } else if (newConnectionType === 'usb') {
        updated.usb_config = getDefaultUSBConfig();
      }

      return updated;
    });

    // Clear connection config errors
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.includes('network_config') || key.includes('bluetooth_config') || key.includes('usb_config')) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, []);

  /**
   * Handle basic field changes
   */
  const handleFieldChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Handle bluetooth config changes
   */
  const handleBluetoothConfigChange = useCallback((config: BluetoothConfig) => {
    setFormData(prev => ({
      ...prev,
      bluetooth_config: config
    }));
  }, []);

  /**
   * Handle USB config changes
   */
  const handleUSBConfigChange = useCallback((config: USBConfig) => {
    setFormData(prev => ({
      ...prev,
      usb_config: config
    }));
  }, []);

  /**
   * Handle printer config changes
   */
  const handlePrinterConfigChange = useCallback((config: PrinterConfig) => {
    setFormData(prev => ({
      ...prev,
      printer_config: config
    }));
  }, []);

  /**
   * Handle scanner config changes
   */
  const handleScannerConfigChange = useCallback((config: ScannerConfig) => {
    setFormData(prev => ({
      ...prev,
      scanner_config: config
    }));
  }, []);

  /**
   * Handle payment config changes
   */
  const handlePaymentConfigChange = useCallback((config: PaymentConfig) => {
    setFormData(prev => ({
      ...prev,
      payment_config: config
    }));
  }, []);

  /**
   * Handle scale config changes
   */
  const handleScaleConfigChange = useCallback((config: ScaleConfig) => {
    setFormData(prev => ({
      ...prev,
      scale_config: config
    }));
  }, []);

  /**
   * Handle drawer config changes
   */
  const handleDrawerConfigChange = useCallback((config: DrawerConfig) => {
    setFormData(prev => ({
      ...prev,
      drawer_config: config
    }));
  }, []);

  /**
   * Handle display config changes
   */
  const handleDisplayConfigChange = useCallback((config: DisplayConfig) => {
    setFormData(prev => ({
      ...prev,
      display_config: config
    }));
  }, []);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.id.trim()) {
      newErrors.id = t('hardware.validation.idRequired', 'Device ID is required');
    }

    if (!formData.type) {
      newErrors.type = t('hardware.validation.typeRequired', 'Device type is required');
    }

    if (!formData.connection_type) {
      newErrors.connection_type = t('hardware.validation.connectionRequired', 'Connection type is required');
    }

    // Connection config validation
    if (formData.connection_type === 'network') {
      if (!formData.network_config?.ip_address) {
        newErrors['network_config.ip_address'] = t('hardware.validation.ipRequired', 'IP address is required');
      } else if (!isValidIPAddress(formData.network_config.ip_address)) {
        newErrors['network_config.ip_address'] = t('hardware.validation.ipInvalid', 'Invalid IP address format');
      }

      if (!formData.network_config?.port) {
        newErrors['network_config.port'] = t('hardware.validation.portRequired', 'Port is required');
      } else if (!isValidPort(formData.network_config.port)) {
        newErrors['network_config.port'] = t('hardware.validation.portInvalid', 'Port must be between 1 and 65535');
      }
    }

    if (formData.connection_type === 'bluetooth') {
      if (!formData.bluetooth_config?.mac_address) {
        newErrors['bluetooth_config.mac_address'] = t('hardware.validation.macRequired', 'MAC address is required');
      } else if (!isValidMACAddress(formData.bluetooth_config.mac_address)) {
        newErrors['bluetooth_config.mac_address'] = t('hardware.validation.macInvalid', 'Invalid MAC address format (XX:XX:XX:XX:XX:XX)');
      }
    }

    if (formData.connection_type === 'usb') {
      if (!formData.usb_config?.vendor_id) {
        newErrors['usb_config.vendor_id'] = t('hardware.validation.vendorIdRequired', 'Vendor ID is required');
      }
      if (!formData.usb_config?.product_id) {
        newErrors['usb_config.product_id'] = t('hardware.validation.productIdRequired', 'Product ID is required');
      }
    }

    // Device config validation
    if (formData.type === 'printer') {
      if (!formData.printer_config?.mode) {
        newErrors['printer_config.mode'] = t('hardware.validation.printerModeRequired', 'Printer mode is required');
      }
    }

    if (formData.type === 'payment_terminal') {
      if (!formData.payment_config?.provider) {
        newErrors['payment_config.provider'] = t('hardware.validation.providerRequired', 'Payment provider is required');
      }
    }

    if (formData.type === 'scale') {
      if (!formData.scale_config?.unit) {
        newErrors['scale_config.unit'] = t('hardware.validation.unitRequired', 'Weight unit is required');
      }
    }

    setErrors(newErrors);

    // Show validation error toast if there are errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).slice(0, 3);
      showValidationError(
        `Please fix: ${errorMessages.join(', ')}${Object.keys(newErrors).length > 3 ? '...' : ''}`,
        'form_validation',
        null,
        'required'
      );
      return false;
    }

    return true;
  }, [formData, t, showValidationError]);

  // ============================================================================
  // SAVE
  // ============================================================================

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Build the DTO
      const dto: CreateHardwareDTO = {
        id: formData.id.trim(),
        name: formData.name.trim() || undefined,
        type: formData.type as DeviceType,
        connection_type: formData.connection_type as ConnectionType,
        terminal_id: level === 'terminal' ? terminalId : undefined,
        enabled: formData.enabled
      };

      // Add connection config
      if (formData.connection_type === 'network' && formData.network_config) {
        dto.network_config = formData.network_config;
      } else if (formData.connection_type === 'bluetooth' && formData.bluetooth_config) {
        dto.bluetooth_config = formData.bluetooth_config;
      } else if (formData.connection_type === 'usb' && formData.usb_config) {
        dto.usb_config = formData.usb_config;
      }

      // Add device config
      if (formData.type === 'printer' && formData.printer_config) {
        dto.printer_config = formData.printer_config;
      } else if (formData.type === 'scanner' && formData.scanner_config) {
        dto.scanner_config = formData.scanner_config;
      } else if (formData.type === 'payment_terminal' && formData.payment_config) {
        dto.payment_config = formData.payment_config;
      } else if (formData.type === 'scale' && formData.scale_config) {
        dto.scale_config = formData.scale_config;
      } else if (formData.type === 'cash_drawer' && formData.drawer_config) {
        dto.drawer_config = formData.drawer_config;
      } else if (formData.type === 'display' && formData.display_config) {
        dto.display_config = formData.display_config;
      }

      await onSave(dto);
      showSuccess(isEditMode ? t('hardware.deviceUpdated', 'Device updated successfully') : t('hardware.deviceCreated', 'Device created successfully'));
      onClose();
    } catch (error: any) {
      console.error('Failed to save device:', error);
      showError(error?.message || t('hardware.saveFailed', 'Failed to save device'));
      setErrors({ general: error?.message || 'Failed to save device' });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // TEST CONNECTION
  // ============================================================================

  const handleTest = async () => {
    if (!formData.type || !formData.connection_type) {
      setTestResult({ success: false, message: t('hardware.testConfigureFirst', 'Please configure device type and connection first') });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Simulate device test (would be real API call in production)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result
      const success = Math.random() > 0.3;
      setTestResult({
        success,
        message: success 
          ? t('hardware.testSuccess', 'Device test successful')
          : t('hardware.testFailed', 'Device not responding. Please check connection settings.')
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: t('hardware.testError', 'Test failed: ') + (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER: CONNECTION CONFIG
  // ============================================================================

  const renderConnectionConfig = () => {
    if (!formData.connection_type) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <SignalIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {t('hardware.selectConnectionType', 'Please select a connection type above to configure connection settings.')}
          </p>
        </div>
      );
    }

    switch (formData.connection_type) {
      case 'network':
        return (
          <NetworkConfigForm
            config={formData.network_config || getDefaultNetworkConfig()}
            onChange={(config) => setFormData(prev => ({ ...prev, network_config: config }))}
            errors={errors}
          />
        );
      case 'bluetooth':
        return (
          <BluetoothConfigForm
            config={formData.bluetooth_config || getDefaultBluetoothConfig()}
            onChange={handleBluetoothConfigChange}
            errors={errors}
          />
        );
      case 'usb':
        return (
          <USBConfigForm
            config={formData.usb_config || getDefaultUSBConfig()}
            onChange={handleUSBConfigChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER: DEVICE CONFIG
  // ============================================================================

  const renderDeviceConfig = () => {
    if (!formData.type) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {t('hardware.selectDeviceType', 'Please select a device type to configure device-specific settings.')}
          </p>
        </div>
      );
    }

    switch (formData.type) {
      case 'printer':
        return (
          <PrinterConfigForm
            config={formData.printer_config || getDefaultPrinterConfig('thermal')}
            onChange={handlePrinterConfigChange}
            errors={errors}
          />
        );
      case 'scanner':
        return (
          <ScannerConfigForm
            config={formData.scanner_config || getDefaultScannerConfig()}
            onChange={handleScannerConfigChange}
            errors={errors}
          />
        );
      case 'payment_terminal':
        return (
          <PaymentConfigForm
            config={formData.payment_config || getDefaultPaymentConfig()}
            onChange={handlePaymentConfigChange}
            errors={errors}
          />
        );
      case 'scale':
        return (
          <ScaleConfigForm
            config={formData.scale_config || getDefaultScaleConfig()}
            onChange={handleScaleConfigChange}
            errors={errors}
          />
        );
      case 'cash_drawer':
        return (
          <DrawerConfigForm
            config={formData.drawer_config || getDefaultDrawerConfig()}
            onChange={handleDrawerConfigChange}
            errors={errors}
          />
        );
      case 'display':
        return (
          <DisplayConfigForm
            config={formData.display_config || getDefaultDisplayConfig()}
            onChange={handleDisplayConfigChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER: SECTIONS
  // ============================================================================

  const sections = [
    { id: 'basic', label: t('hardware.tabs.basic', 'Basic Info'), icon: DevicePhoneMobileIcon },
    { id: 'connection', label: t('hardware.tabs.connection', 'Connection'), icon: SignalIcon },
    { id: 'device', label: t('hardware.tabs.device', 'Device Config'), icon: CpuChipIcon }
  ] as const;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl">
          <Widget
            title={isEditMode ? t('hardware.editDevice', 'Edit Device') : t('hardware.addDevice', 'Add New Device')}
            description={isEditMode 
              ? t('hardware.editDeviceDesc', 'Update the configuration for this hardware device')
              : t('hardware.addDeviceDesc', 'Configure a new hardware device for your POS system')
            }
            icon={DevicePhoneMobileIcon}
            variant={isEditMode ? 'primary' : 'success'}
            className='overflow-visible'
            size='lg'
          >
            <div className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <Alert variant="error">{errors.general}</Alert>
              )}

              {/* Test Result */}
              {testResult && (
                <Alert variant={testResult.success ? 'success' : 'error'}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5" />
                    )}
                    {testResult.message}
                  </div>
                </Alert>
              )}

              {/* Level indicator */}
              {level === 'terminal' && terminalId && (
                <Alert variant="info">
                  {t('hardware.terminalLevel', 'This device will be assigned to terminal')}: <strong>{terminalId}</strong>
                </Alert>
              )}

              {/* Section Navigation */}
              <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8" aria-label="Sections">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors
                        ${isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
              </div>

              {/* Section Content */}
              <div className="min-h-[500px]">
                {/* Basic Info Section */}
                {activeSection === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Device ID */}
                      <InputTextField
                        label={t('hardware.deviceId', 'Device ID')}
                        value={formData.id}
                        onChange={(value) => handleFieldChange('id', value)}
                        placeholder="e.g., printer_001"
                        error={errors.id}
                        disabled={isEditMode}
                        required
                        helperText={isEditMode ? t('hardware.idNotEditable', 'ID cannot be changed after creation') : undefined}
                      />

                      {/* Device Name */}
                      <InputTextField
                        label={t('hardware.deviceName', 'Device Name')}
                        value={formData.name}
                        onChange={(value) => handleFieldChange('name', value)}
                        placeholder="e.g., Main Receipt Printer"
                        helperText={t('hardware.nameHelpText', 'Optional friendly name for the device')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Device Type */}
                      <DropdownSearch
                        label={t('hardware.deviceType', 'Device Type')}
                        options={DEVICE_TYPES.map(dt => ({
                          id: dt.id,
                          label: `${dt.icon} ${dt.label}`,
                          description: dt.description
                        }))}
                        value={formData.type}
                        onSelect={(option) => handleDeviceTypeChange((option?.id || '') as DeviceType | '')}
                        placeholder={t('hardware.selectDeviceType', 'Select device type')}
                        error={errors.type}
                        required
                      />

                      {/* Connection Type */}
                      <DropdownSearch
                        label={t('hardware.connectionType', 'Connection Type')}
                        options={
                          formData.type
                            ? getConnectionTypesForDevice(formData.type as DeviceType).map(ct => ({
                                id: ct.id,
                                label: `${ct.icon} ${ct.label}`,
                                description: ct.description
                              }))
                            : CONNECTION_TYPES.map(ct => ({
                                id: ct.id,
                                label: `${ct.icon} ${ct.label}`,
                                description: ct.description
                              }))
                        }
                        value={formData.connection_type}
                        onSelect={(option) => handleConnectionTypeChange((option?.id || '') as ConnectionType | '')}
                        placeholder={t('hardware.selectConnectionType', 'Select connection type')}
                        error={errors.connection_type}
                        required
                        disabled={!formData.type}
                      />
                    </div>

                    {/* Enabled Toggle */}
                    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <input
                        type="checkbox"
                        id="device-enabled"
                        checked={formData.enabled}
                        onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <label htmlFor="device-enabled" className="flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {t('hardware.enabled', 'Device Enabled')}
                        </span>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {t('hardware.enabledDescription', 'When disabled, the device will not be used by the POS system')}
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Connection Config Section */}
                {activeSection === 'connection' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        {t('hardware.connectionSettings', 'Connection Settings')}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {t('hardware.connectionSettingsDesc', 'Configure how the POS system connects to this device.')}
                      </p>
                    </div>
                    {renderConnectionConfig()}
                  </div>
                )}

                {/* Device Config Section */}
                {activeSection === 'device' && (
                  <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-900 mb-1">
                        {t('hardware.deviceSettings', 'Device Settings')}
                      </h4>
                      <p className="text-sm text-purple-700">
                        {t('hardware.deviceSettingsDesc', 'Configure device-specific options and behavior.')}
                      </p>
                    </div>
                    {renderDeviceConfig()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isLoading || !formData.type || !formData.connection_type}
                >
                  <SignalIcon className="h-4 w-4 mr-2" />
                  {t('hardware.testConnection', 'Test Connection')}
                </Button>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                  </Button>
                </div>
              </div>
            </div>
          </Widget>
        </div>
      </div>
    </div>
  );
};

export default DeviceForm;