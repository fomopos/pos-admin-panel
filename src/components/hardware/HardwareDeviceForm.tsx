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
  MultipleDropdownSearch,
  Widget,
  Alert
} from '../ui';
import { hardwareConfigService } from '../../services/hardware/hardwareConfigService';
import { useTenantStore } from '../../tenants/tenantStore';
import type {
  HardwareDevice,
  ReceiptPrinterConfig,
  KitchenPrinterConfig,
  ScannerConfig,
  HardwareOption
} from '../../types/hardware';

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
  const [formData, setFormData] = useState<Partial<HardwareDevice>>({
    name: '',
    type: 'receipt_printer',
    enabled: true,
    connection_type: 'network'
  });
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const hardwareOptions = hardwareConfigService.getHardwareOptions();

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

  // Device type options
  const deviceTypeOptions: HardwareOption[] = [
    {
      id: 'receipt_printer',
      label: 'Receipt Printer',
      value: 'receipt_printer',
      icon: '🖨️',
      description: 'Main receipt printer for customer receipts'
    },
    {
      id: 'kitchen_printer',
      label: 'Kitchen KOT Printer',
      value: 'kitchen_printer',
      icon: '👨‍🍳',
      description: 'Kitchen order ticket printer'
    },
    {
      id: 'scanner',
      label: 'Barcode Scanner',
      value: 'scanner',
      icon: '📱',
      description: 'Barcode and QR code scanner'
    }
  ];

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
    const newType = typeValue as HardwareDevice['type'];
    
    // Reset form data when device type changes
    const baseData = {
      name: formData.name || '',
      type: newType,
      enabled: formData.enabled ?? true,
      connection_type: 'network' as const
    };

    // Add type-specific default values
    switch (newType) {
      case 'receipt_printer':
        setFormData({
          ...baseData,
          paper_size: 'thermal_80mm',
          auto_print: true,
          print_copies: 1,
          cut_paper: true,
          open_drawer: false,
          character_encoding: 'utf8',
          test_mode: false
        } as Partial<ReceiptPrinterConfig>);
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
        } as Partial<KitchenPrinterConfig>);
        break;
      case 'scanner':
        setFormData({
          ...baseData,
          connection_type: 'usb',
          prefix: '',
          suffix: '\r\n',
          min_length: 8,
          max_length: 20,
          scan_mode: 'manual',
          beep_on_scan: true,
          decode_types: ['CODE128', 'EAN13', 'UPC']
        } as Partial<ScannerConfig>);
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Device name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Device type is required';
    }

    if (!formData.connection_type) {
      newErrors.connection_type = 'Connection type is required';
    }

    // Terminal selection validation for terminal level
    if (level === 'terminal' && !selectedTerminalId) {
      newErrors.terminal = 'Please select a terminal for this device';
    }

    // Network connection validation
    if (formData.connection_type === 'network') {
      if (formData.type === 'receipt_printer' || formData.type === 'kitchen_printer') {
        const config = formData as Partial<ReceiptPrinterConfig | KitchenPrinterConfig>;
        if (!config.ip_address?.trim()) {
          newErrors.ip_address = 'IP address is required for network connection';
        }
        if (!config.port || config.port <= 0) {
          newErrors.port = 'Valid port number is required';
        }
      }
    }

    // Scanner-specific validation
    if (formData.type === 'scanner') {
      const scannerConfig = formData as Partial<ScannerConfig>;
      if (!scannerConfig.min_length || scannerConfig.min_length < 1) {
        newErrors.min_length = 'Minimum length must be at least 1';
      }
      if (!scannerConfig.max_length || scannerConfig.max_length < scannerConfig.min_length!) {
        newErrors.max_length = 'Maximum length must be greater than minimum length';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const deviceData: HardwareDevice = {
        id: device?.id || `${formData.type}_${Date.now()}`,
        ...formData
      } as HardwareDevice;

      // Pass terminal ID for terminal level devices
      onSave(deviceData, level === 'terminal' ? selectedTerminalId : undefined);
      onClose();
    } catch (error) {
      console.error('Failed to save device:', error);
      setErrors({ general: 'Failed to save device. Please try again.' });
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
    switch (formData.type) {
      case 'receipt_printer':
      case 'kitchen_printer':
        const printerConfig = formData as Partial<ReceiptPrinterConfig | KitchenPrinterConfig>;
        return (
          <div className="space-y-6">
            {/* Printer Model */}
            <DropdownSearch
              label="Printer Model"
              options={hardwareOptions.printer_models}
              value={printerConfig.printer_model || ''}
              onSelect={(option) => option && handleInputChange('printer_model', option.id)}
              placeholder="Select printer model"
              displayValue={(option) => option ? (
                <div className="flex items-center gap-2">
                  <span>{option.label}</span>
                </div>
              ) : 'Select printer model'}
            />

            {/* Paper Size */}
            <DropdownSearch
              label="Paper Size"
              options={hardwareOptions.paper_sizes}
              value={printerConfig.paper_size || 'thermal_80mm'}
              onSelect={(option) => option && handleInputChange('paper_size', option.id)}
              placeholder="Select paper size"
              required
            />

            {/* Network Settings */}
            {formData.connection_type === 'network' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputTextField
                  label="IP Address"
                  value={printerConfig.ip_address || ''}
                  onChange={(value) => handleInputChange('ip_address', value)}
                  placeholder="192.168.1.100"
                  required
                  error={errors.ip_address}
                />
                <InputTextField
                  label="Port"
                  type="number"
                  value={printerConfig.port?.toString() || '9100'}
                  onChange={(value) => handleInputChange('port', parseInt(value) || 9100)}
                  placeholder="9100"
                  required
                  error={errors.port}
                />
              </div>
            )}

            {/* Character Encoding */}
            <DropdownSearch
              label="Character Encoding"
              options={hardwareOptions.character_encodings}
              value={printerConfig.character_encoding || 'utf8'}
              onSelect={(option) => option && handleInputChange('character_encoding', option.id)}
              placeholder="Select character encoding"
              required
            />

            {/* Printer Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.type === 'receipt_printer' && (
                <>
                  <PropertyCheckbox
                    title="Auto Print"
                    description="Automatically print receipts after transactions"
                    checked={(printerConfig as Partial<ReceiptPrinterConfig>).auto_print ?? true}
                    onChange={(checked) => handleInputChange('auto_print', checked)}
                  />
                  <PropertyCheckbox
                    title="Cut Paper"
                    description="Automatically cut paper after printing"
                    checked={(printerConfig as Partial<ReceiptPrinterConfig>).cut_paper ?? true}
                    onChange={(checked) => handleInputChange('cut_paper', checked)}
                  />
                  <PropertyCheckbox
                    title="Open Drawer"
                    description="Open cash drawer after printing"
                    checked={(printerConfig as Partial<ReceiptPrinterConfig>).open_drawer ?? false}
                    onChange={(checked) => handleInputChange('open_drawer', checked)}
                  />
                </>
              )}

              {formData.type === 'kitchen_printer' && (
                <>
                  <PropertyCheckbox
                    title="Print Header"
                    description="Include header information on KOT"
                    checked={(printerConfig as Partial<KitchenPrinterConfig>).print_header ?? true}
                    onChange={(checked) => handleInputChange('print_header', checked)}
                  />
                  <PropertyCheckbox
                    title="Print Timestamp"
                    description="Include timestamp on KOT"
                    checked={(printerConfig as Partial<KitchenPrinterConfig>).print_timestamp ?? true}
                    onChange={(checked) => handleInputChange('print_timestamp', checked)}
                  />
                  <PropertyCheckbox
                    title="Print Order Number"
                    description="Include order number on KOT"
                    checked={(printerConfig as Partial<KitchenPrinterConfig>).print_order_number ?? true}
                    onChange={(checked) => handleInputChange('print_order_number', checked)}
                  />
                  <PropertyCheckbox
                    title="Auto Cut"
                    description="Automatically cut paper after printing"
                    checked={(printerConfig as Partial<KitchenPrinterConfig>).auto_cut ?? true}
                    onChange={(checked) => handleInputChange('auto_cut', checked)}
                  />
                </>
              )}
            </div>

            {/* Kitchen Sections (for kitchen printer only) */}
            {formData.type === 'kitchen_printer' && (
              <MultipleDropdownSearch
                label="Kitchen Sections"
                values={(printerConfig as Partial<KitchenPrinterConfig>).kitchen_sections || []}
                options={hardwareOptions.kitchen_sections}
                onSelect={(selectedValues) => handleInputChange('kitchen_sections', selectedValues)}
                placeholder="Select kitchen sections"
                searchPlaceholder="Search sections..."
                allowSelectAll={true}
                selectAllLabel="Select All Sections"
                clearAllLabel="Clear All Sections"
                maxSelectedDisplay={3}
                required
              />
            )}
          </div>
        );

      case 'scanner':
        const scannerConfig = formData as Partial<ScannerConfig>;
        return (
          <div className="space-y-6">
            {/* Scanner Model */}
            <DropdownSearch
              label="Scanner Model"
              options={hardwareOptions.scanner_models}
              value={scannerConfig.scanner_model || ''}
              onSelect={(option) => option && handleInputChange('scanner_model', option.id)}
              placeholder="Select scanner model"
            />

            {/* Scan Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputTextField
                label="Prefix"
                value={scannerConfig.prefix || ''}
                onChange={(value) => handleInputChange('prefix', value)}
                placeholder="Optional prefix"
              />
              <InputTextField
                label="Suffix"
                value={scannerConfig.suffix || ''}
                onChange={(value) => handleInputChange('suffix', value)}
                placeholder="\\r\\n"
              />
              <DropdownSearch
                label="Scan Mode"
                options={hardwareOptions.scan_modes}
                value={scannerConfig.scan_mode || 'manual'}
                onSelect={(option) => option && handleInputChange('scan_mode', option.id)}
                placeholder="Select scan mode"
                required
              />
            </div>

            {/* Length Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Minimum Length"
                type="number"
                value={scannerConfig.min_length?.toString() || '8'}
                onChange={(value) => handleInputChange('min_length', parseInt(value) || 8)}
                placeholder="8"
                required
                error={errors.min_length}
              />
              <InputTextField
                label="Maximum Length"
                type="number"
                value={scannerConfig.max_length?.toString() || '20'}
                onChange={(value) => handleInputChange('max_length', parseInt(value) || 20)}
                placeholder="20"
                required
                error={errors.max_length}
              />
            </div>

            {/* Scanner Options */}
            <PropertyCheckbox
              title="Beep on Scan"
              description="Play sound when barcode is scanned"
              checked={scannerConfig.beep_on_scan ?? true}
              onChange={(checked) => handleInputChange('beep_on_scan', checked)}
            />
          </div>
        );

      default:
        return null;
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
                onSelect={(option) => option && handleDeviceTypeChange(option.id)}
                placeholder="Select device type"
                required
                error={errors.type}
                displayValue={(option) => option ? (
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
                options={hardwareOptions.connection_types}
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

              <div className="flex items-end">
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
        {formData.type && (
          <Widget
            title="Device Configuration"
            description={`Configure ${formData.type.replace('_', ' ')} specific settings`}
            icon={formData.type === 'scanner' ? QrCodeIcon : PrinterIcon}
            className='overflow-visible'
          >
            {renderDeviceSpecificFields()}
          </Widget>
        )}
      </form>
    </Modal>
  );
};

export default HardwareDeviceForm;
