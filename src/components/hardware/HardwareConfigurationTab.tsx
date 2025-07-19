import React, { useState, useEffect } from 'react';
import {
  ComputerDesktopIcon,
  PlusIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  Widget,
  Button,
  Alert,
  EnhancedTabs,
  DropdownSearch
} from '../ui';
import HardwareDeviceCard from './HardwareDeviceCard';
import HardwareDeviceForm from './HardwareDeviceForm';
import { hardwareApiService } from '../../services/hardware/hardwareApiService';
import { useTenantStore } from '../../tenants/tenantStore';
import { useError } from '../../hooks/useError';
import type { 
  HardwareDevice, 
  HardwareOption,
  ReceiptPrinterConfig,
  KitchenPrinterConfig,
  ScannerConfig,
  CashDrawerConfig
} from '../../types/hardware';
import type {
  HardwareDevice as ApiHardwareDevice,
  CreateHardwareDeviceRequest,
  DeviceStatus,
  ConnectionType,
  CharacterEncoding,
  KitchenSection,
  ScanMode,
  BarcodeDecodeType
} from '../../types/hardware-api';

interface HardwareConfigurationTabProps {
  settings: any;
  onFieldChange: () => void;
}

// Combined configuration interface for easier state management
interface CombinedHardwareConfig {
  store_level: HardwareDevice[];
  terminal_level: { [terminalId: string]: HardwareDevice[] };
}

// Helper function to convert API device to UI device type
const convertApiDeviceToUIDevice = (apiDevice: ApiHardwareDevice): HardwareDevice => {
  const baseDevice = {
    id: apiDevice.hardware_id, // Map hardware_id to id for UI compatibility
    name: apiDevice.name,
    enabled: apiDevice.enabled,
    status: apiDevice.status as any,
    last_connected: apiDevice.last_connected,
    created_at: apiDevice.created_at,
    updated_at: apiDevice.updated_at,
  };

  // Convert based on device type
  switch (apiDevice.type) {
    case 'thermal_printer':
      return {
        ...baseDevice,
        type: 'receipt_printer',
        connection_type: apiDevice.connection_type as any,
        printer_model: apiDevice.thermal_printer?.printer_model,
        ip_address: apiDevice.thermal_printer?.ip_address,
        port: apiDevice.thermal_printer?.port,
        paper_size: (apiDevice.thermal_printer?.paper_size || 'thermal_80mm') as any,
        auto_print: apiDevice.thermal_printer?.auto_print || true,
        print_copies: apiDevice.thermal_printer?.print_copies || 1,
        cut_paper: apiDevice.thermal_printer?.cut_paper || true,
        open_drawer: apiDevice.thermal_printer?.open_drawer || false,
        character_encoding: (apiDevice.thermal_printer?.character_encoding || 'utf8') as any,
        test_mode: apiDevice.test_mode,
      } as ReceiptPrinterConfig;
    
    case 'kitchen_printer':
      return {
        ...baseDevice,
        type: 'kitchen_printer',
        connection_type: apiDevice.connection_type as any,
        printer_model: apiDevice.kot_printer?.printer_model,
        ip_address: apiDevice.kot_printer?.ip_address,
        port: apiDevice.kot_printer?.port,
        paper_size: (apiDevice.kot_printer?.paper_size || 'thermal_80mm') as any,
        print_header: apiDevice.kot_printer?.print_header || true,
        print_timestamp: apiDevice.kot_printer?.print_timestamp || true,
        print_order_number: apiDevice.kot_printer?.print_order_number || true,
        print_table_info: apiDevice.kot_printer?.print_table_info || true,
        auto_cut: apiDevice.kot_printer?.auto_cut || true,
        character_encoding: (apiDevice.kot_printer?.character_encoding || 'utf8') as any,
        kitchen_sections: apiDevice.kot_printer?.kitchen_sections || ['hot_kitchen'],
      } as KitchenPrinterConfig;
    
    case 'scanner':
      return {
        ...baseDevice,
        type: 'scanner',
        connection_type: apiDevice.connection_type as any,
        scanner_model: apiDevice.barcode_scanner?.scanner_model,
        prefix: apiDevice.barcode_scanner?.prefix,
        suffix: apiDevice.barcode_scanner?.suffix,
        min_length: apiDevice.barcode_scanner?.min_length || 3,
        max_length: apiDevice.barcode_scanner?.max_length || 20,
        scan_mode: (apiDevice.barcode_scanner?.scan_mode || 'manual') as any,
        beep_on_scan: apiDevice.barcode_scanner?.beep_on_scan || true,
        decode_types: apiDevice.barcode_scanner?.decode_types || ['CODE128'],
      } as ScannerConfig;
    
    case 'cash_drawer':
      return {
        ...baseDevice,
        type: 'cash_drawer',
        connection_type: apiDevice.connection_type as any,
        auto_open: false,
        trigger_event: 'sale_complete' as any,
        open_duration: 500,
      } as CashDrawerConfig;
    
    default:
      // Fallback to receipt printer for unknown types
      return {
        ...baseDevice,
        type: 'receipt_printer',
        connection_type: apiDevice.connection_type as any,
        paper_size: 'thermal_80mm' as any,
        auto_print: true,
        print_copies: 1,
        cut_paper: true,
        open_drawer: false,
        character_encoding: 'utf8' as any,
        test_mode: false,
      } as ReceiptPrinterConfig;
  }
};

const HardwareConfigurationTab: React.FC<HardwareConfigurationTabProps> = ({
  onFieldChange
}) => {
  const { currentStore } = useTenantStore();
  const { showError, showSuccess } = useError();
  const [hardwareConfig, setHardwareConfig] = useState<CombinedHardwareConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<'store' | 'terminal'>('store');
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<HardwareDevice | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to convert UI device to API device type for creation
  const convertUIDeviceToCreateRequest = (uiDevice: HardwareDevice, terminalId?: string): CreateHardwareDeviceRequest => {
    // Map status (handle unknown -> disconnected mapping)
    const apiStatus = (uiDevice.status === 'unknown' ? 'disconnected' : uiDevice.status) || 'disconnected';
    
    // Map connection types (handle serial -> usb mapping)
    const connectionType = uiDevice.connection_type === 'serial' ? 'usb' : uiDevice.connection_type;

    const baseDevice = {
      id: uiDevice.id,
      name: uiDevice.name,
      enabled: uiDevice.enabled,
      status: apiStatus as DeviceStatus,
      connection_type: connectionType as ConnectionType,
      test_mode: false,
      store_id: currentStore?.store_id || '',
      terminal_id: terminalId || null,
      last_connected: uiDevice.last_connected || new Date().toISOString(),
      thermal_printer: null,
      kot_printer: null,
      network_printer: null,
      barcode_scanner: null,
      cash_drawer: null,
      label_printer: null,
    };

    switch (uiDevice.type) {
      case 'receipt_printer':
        const receiptDevice = uiDevice as ReceiptPrinterConfig;
        return {
          ...baseDevice,
          type: 'thermal_printer',
          test_mode: receiptDevice.test_mode || false,
          thermal_printer: {
            printer_model: receiptDevice.printer_model,
            ip_address: receiptDevice.ip_address,
            port: receiptDevice.port,
            paper_size: (receiptDevice.paper_size === 'thermal_58mm' || receiptDevice.paper_size === 'thermal_80mm') 
              ? receiptDevice.paper_size : 'thermal_80mm',
            auto_print: receiptDevice.auto_print,
            print_copies: receiptDevice.print_copies,
            cut_paper: receiptDevice.cut_paper,
            open_drawer: receiptDevice.open_drawer,
            character_encoding: receiptDevice.character_encoding === 'windows1252' ? 'utf8' : receiptDevice.character_encoding as CharacterEncoding,
          },
        };
      
      case 'kitchen_printer':
        const kitchenDevice = uiDevice as KitchenPrinterConfig;
        return {
          ...baseDevice,
          type: 'kitchen_printer',
          kot_printer: {
            printer_model: kitchenDevice.printer_model,
            ip_address: kitchenDevice.ip_address,
            port: kitchenDevice.port,
            paper_size: (kitchenDevice.paper_size === 'thermal_58mm' || kitchenDevice.paper_size === 'thermal_80mm') 
              ? kitchenDevice.paper_size : 'thermal_80mm',
            print_header: kitchenDevice.print_header,
            print_timestamp: kitchenDevice.print_timestamp,
            print_order_number: kitchenDevice.print_order_number,
            print_table_info: kitchenDevice.print_table_info,
            auto_cut: kitchenDevice.auto_cut,
            character_encoding: kitchenDevice.character_encoding === 'windows1252' ? 'utf8' : kitchenDevice.character_encoding as CharacterEncoding,
            kitchen_sections: kitchenDevice.kitchen_sections as KitchenSection[],
          },
        };
      
      case 'scanner':
        const scannerDevice = uiDevice as ScannerConfig;
        return {
          ...baseDevice,
          type: 'scanner',
          barcode_scanner: {
            scanner_model: scannerDevice.scanner_model,
            prefix: scannerDevice.prefix,
            suffix: scannerDevice.suffix,
            min_length: scannerDevice.min_length,
            max_length: scannerDevice.max_length,
            scan_mode: scannerDevice.scan_mode as ScanMode,
            beep_on_scan: scannerDevice.beep_on_scan,
            decode_types: scannerDevice.decode_types as BarcodeDecodeType[],
          },
        };
      
      case 'cash_drawer':
        return {
          ...baseDevice,
          type: 'cash_drawer',
        };
      
      default:
        return {
          ...baseDevice,
          type: 'thermal_printer',
        };
    }
  };

  // Hardware level tabs
  const levelTabs = [
    { 
      id: 'store', 
      name: 'Store Level', 
      icon: ComputerDesktopIcon,
      description: 'Common to all registers'
    },
    { 
      id: 'terminal', 
      name: 'Terminal Level', 
      icon: CogIcon,
      description: 'Specific to individual registers'
    }
  ];

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

  // Fetch hardware configuration
  useEffect(() => {
    const fetchHardwareConfig = async () => {
      if (!currentStore?.tenant_id || !currentStore?.store_id) {
        setErrors({ general: 'Store information not available' });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const devices = await hardwareApiService.getAllHardwareDevices(
          currentStore.tenant_id, 
          currentStore.store_id
        );
        
        // Transform API devices to UI devices using converter
        const storeDevices = devices
          .filter(device => !device.terminal_id) // Store level devices have no terminal_id
          .map(convertApiDeviceToUIDevice);
        
        const terminalDevices = devices
          .filter(device => device.terminal_id) // Terminal level devices have terminal_id
          .map(convertApiDeviceToUIDevice);
        
        // Transform to our combined structure
        const combinedConfig: CombinedHardwareConfig = {
          store_level: storeDevices,
          terminal_level: {}
        };
        
        // Group terminal-level devices by terminal_id
        terminalDevices.forEach((device) => {
          // Find the original API device to get terminal_id
          const apiDevice = devices.find(d => d.hardware_id === device.id);
          const terminalId = apiDevice?.terminal_id || 'default';
          if (!combinedConfig.terminal_level[terminalId]) {
            combinedConfig.terminal_level[terminalId] = [];
          }
          combinedConfig.terminal_level[terminalId].push(device);
        });
        
        setHardwareConfig(combinedConfig);
      } catch (error: any) {
        console.error('Failed to fetch hardware config:', error);
        
        // Use error framework for initial load error
        showError(error?.message || 'Failed to load hardware configuration. Please try again.');
        
        // Also set local error for backward compatibility
        setErrors({ general: error?.message || 'Failed to load hardware configuration. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHardwareConfig();
  }, [currentStore]);

  const handleLevelTabChange = (tabId: string) => {
    setActiveLevel(tabId as 'store' | 'terminal');
    setErrors({});
    
    // Auto-select first active terminal when switching to terminal level
    if (tabId === 'terminal' && !selectedTerminalId) {
      const terminalOptions = getTerminalOptions();
      const activeTerminal = terminalOptions.find(t => t.icon === '🟢');
      if (activeTerminal) {
        setSelectedTerminalId(activeTerminal.id);
      } else if (terminalOptions.length > 0) {
        setSelectedTerminalId(terminalOptions[0].id);
      }
    }
  };

  const handleAddDevice = () => {
    // Check if terminal is selected for terminal level
    if (activeLevel === 'terminal' && !selectedTerminalId) {
      showError('Please select a terminal first');
      setErrors({ general: 'Please select a terminal first' });
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    setEditingDevice(null);
    setFormMode('create');
    setShowDeviceForm(true);
  };

  const handleEditDevice = (device: HardwareDevice) => {
    setEditingDevice(device);
    setFormMode('edit');
    setShowDeviceForm(true);
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!currentStore?.tenant_id || !currentStore?.store_id) {
      showError('Store information not available');
      setErrors({ general: 'Store information not available' });
      return;
    }

    try {
      // Clear any previous errors
      setErrors({});
      
      const deviceToDelete = getCurrentDevices().find(d => d.id === deviceId);
      const deviceName = deviceToDelete?.name || 'device';

      await hardwareApiService.deleteHardwareDevice(
        currentStore.tenant_id,
        currentStore.store_id,
        deviceId
      );

      showSuccess(`Device "${deviceName}" deleted successfully!`);

      // Update local state
      if (!hardwareConfig) return;

      const updatedConfig = { ...hardwareConfig };
      
      if (activeLevel === 'store') {
        updatedConfig.store_level = updatedConfig.store_level.filter((d: HardwareDevice) => d.id !== deviceId);
      } else {
        if (!selectedTerminalId) {
          showError('Please select a terminal first');
          setErrors({ general: 'Please select a terminal first' });
          return;
        }
        
        if (updatedConfig.terminal_level[selectedTerminalId]) {
          updatedConfig.terminal_level[selectedTerminalId] = updatedConfig.terminal_level[selectedTerminalId].filter((d: HardwareDevice) => d.id !== deviceId);
        }
      }

      setHardwareConfig(updatedConfig);
      onFieldChange();
    } catch (error: any) {
      console.error('Failed to delete device:', error);
      
      // Use error framework for API error display
      showError(error?.message || 'Failed to delete device. Please try again.');
      
      // Also set local error for backward compatibility
      setErrors({ general: error?.message || 'Failed to delete device. Please try again.' });
    }
  };

  const handleSaveDevice = async (device: HardwareDevice, terminalId?: string) => {
    if (!currentStore?.tenant_id || !currentStore?.store_id) {
      showError('Store information not available');
      setErrors({ general: 'Store information not available' });
      return;
    }

    try {
      // Clear any previous errors
      setErrors({});
      
      // Convert UI device to API device format
      const apiDevice = convertUIDeviceToCreateRequest(device, terminalId);

      if (formMode === 'create') {
        // Create new device
        await hardwareApiService.createHardwareDevice(
          currentStore.tenant_id,
          currentStore.store_id,
          apiDevice
        );
        showSuccess(`Device "${device.name}" created successfully!`);
      } else {
        // Update existing device
        await hardwareApiService.updateHardwareDevice(
          currentStore.tenant_id,
          currentStore.store_id,
          device.id,
          {
            status: apiDevice.status,
            enabled: apiDevice.enabled,
            thermal_printer: apiDevice.thermal_printer,
            kot_printer: apiDevice.kot_printer,
            network_printer: apiDevice.network_printer,
            barcode_scanner: apiDevice.barcode_scanner
          }
        );
        showSuccess(`Device "${device.name}" updated successfully!`);
      }

      // Update local state
      if (!hardwareConfig) return;

      const updatedConfig = { ...hardwareConfig };
      
      if (activeLevel === 'store') {
        if (formMode === 'create') {
          updatedConfig.store_level.push(device);
        } else {
          const index = updatedConfig.store_level.findIndex((d: HardwareDevice) => d.id === device.id);
          if (index !== -1) {
            updatedConfig.store_level[index] = device;
          }
        }
      } else {
        // For terminal level, use the provided terminalId
        const targetTerminalId = terminalId || 'default';
        if (!updatedConfig.terminal_level[targetTerminalId]) {
          updatedConfig.terminal_level[targetTerminalId] = [];
        }
        
        if (formMode === 'create') {
          updatedConfig.terminal_level[targetTerminalId].push(device);
        } else {
          const index = updatedConfig.terminal_level[targetTerminalId].findIndex((d: HardwareDevice) => d.id === device.id);
          if (index !== -1) {
            updatedConfig.terminal_level[targetTerminalId][index] = device;
          }
        }
      }

      setHardwareConfig(updatedConfig);
      setShowDeviceForm(false);
      setEditingDevice(null);
      onFieldChange();
    } catch (error: any) {
      console.error('Failed to save device:', error);
      
      // Use error framework for API error display
      showError(error?.message || `Failed to ${formMode === 'create' ? 'create' : 'update'} device. Please try again.`);
      
      // Also set local error for backward compatibility with UI components that check for errors
      setErrors({ general: error?.message || `Failed to ${formMode === 'create' ? 'create' : 'update'} device. Please try again.` });
    }
  };

  const handleTestDevice = async (device: HardwareDevice) => {
    if (!currentStore?.tenant_id || !currentStore?.store_id) {
      showError('Store information not available');
      setErrors({ general: 'Store information not available' });
      return;
    }

    try {
      // Clear any previous errors
      setErrors({});
      
      await hardwareApiService.testHardwareDevice(
        currentStore.tenant_id,
        currentStore.store_id,
        device.id
      );
      
      showSuccess(`Device "${device.name}" test completed successfully!`);
    } catch (error: any) {
      console.error('Device test failed:', error);
      
      // Use error framework for API error display
      showError(error?.message || `Failed to test device "${device.name}". Please try again.`);
      
      // Also set local error for backward compatibility
      setErrors({ general: error?.message || `Failed to test device "${device.name}". Please try again.` });
    }
  };

  const getCurrentDevices = (): HardwareDevice[] => {
    if (!hardwareConfig) return [];
    
    if (activeLevel === 'store') {
      return hardwareConfig.store_level;
    } else {
      // Use the selected terminal ID for terminal level
      return hardwareConfig.terminal_level[selectedTerminalId] || [];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Widget
          title="Hardware Configuration"
          description="Loading hardware configuration..."
          icon={ComputerDesktopIcon}
        >
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Widget>
      </div>
    );
  }

  const currentDevices = getCurrentDevices();

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {errors.general && (
        <Alert variant="error">
          {errors.general}
        </Alert>
      )}

      {/* Hardware Configuration Header */}
      <Widget
        title="Hardware Configuration"
        description="Configure hardware devices for your point of sale system at both store and terminal levels"
        icon={ComputerDesktopIcon}
      >
        {/* Level Selection Tabs */}
        <EnhancedTabs
          tabs={levelTabs}
          activeTab={activeLevel}
          onTabChange={handleLevelTabChange}
        >
          <div className="space-y-6">
            {/* Level Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                {activeLevel === 'store' ? 'Store Level Configuration' : 'Terminal Level Configuration'}
              </h3>
              <p className="text-sm text-blue-700">
                {activeLevel === 'store' 
                  ? 'Hardware devices configured at store level are shared across all registers and terminals in this store.'
                  : 'Hardware devices configured at terminal level are specific to individual registers and override store-level settings.'
                }
              </p>
            </div>

            {/* Terminal Selection (for terminal level only) */}
            {activeLevel === 'terminal' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-amber-900 mb-3">
                  Select Terminal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DropdownSearch
                    label="Terminal"
                    options={getTerminalOptions()}
                    value={selectedTerminalId}
                    onSelect={(option) => setSelectedTerminalId(option ? option.id : '')}
                    placeholder="Select a terminal to view/edit its devices"
                    displayValue={(option) => option ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    ) : 'Select terminal'}
                  />
                  {selectedTerminalId && (
                    <div className="flex items-center text-sm text-amber-700">
                      <span>Viewing devices for: <strong>{getTerminalOptions().find(t => t.id === selectedTerminalId)?.label}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Device List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {activeLevel === 'store' ? 'Store Hardware Devices' : 'Terminal Hardware Devices'}
                </h3>
                <Button
                  onClick={handleAddDevice}
                  variant="primary"
                  size="sm"
                  disabled={activeLevel === 'terminal' && !selectedTerminalId}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Device
                </Button>
              </div>

              {/* Show terminal selection prompt for terminal level */}
              {activeLevel === 'terminal' && !selectedTerminalId ? (
                <div className="text-center py-12 bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg">
                  <ComputerDesktopIcon className="mx-auto h-12 w-12 text-amber-400 mb-4" />
                  <h3 className="text-lg font-medium text-amber-900 mb-2">
                    Select a Terminal
                  </h3>
                  <p className="text-sm text-amber-700 mb-6">
                    Please select a terminal from the dropdown above to view and manage its hardware devices.
                  </p>
                </div>
              ) : currentDevices.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hardware devices configured
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Get started by adding your first hardware device for this {activeLevel}.
                  </p>
                  <Button
                    onClick={handleAddDevice}
                    variant="primary"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentDevices.map((device) => (
                    <HardwareDeviceCard
                      key={device.id}
                      device={device}
                      onEdit={() => handleEditDevice(device)}
                      onDelete={() => handleDeleteDevice(device.id)}
                      onTest={() => handleTestDevice(device)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </EnhancedTabs>
      </Widget>

      {/* Device Form Modal */}
      <HardwareDeviceForm
        isOpen={showDeviceForm}
        onClose={() => {
          setShowDeviceForm(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
        device={editingDevice}
        level={activeLevel}
        mode={formMode}
      />
    </div>
  );
};

export default HardwareConfigurationTab;
