import React, { useState, useEffect } from 'react';
import {
  ComputerDesktopIcon,
  PlusIcon,
  CogIcon,
  CheckIcon
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
import type { 
  HardwareDevice, 
  HardwareOption
} from '../../types/hardware';
import type {
  HardwareDevice as ApiHardwareDevice
} from '../../types/hardware-api';

interface HardwareConfigurationTabProps {
  settings: any;
  onSave: (data: any) => void;
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
    id: apiDevice.id,
    name: apiDevice.name,
    enabled: apiDevice.enabled,
    status: apiDevice.status,
    last_connected: apiDevice.last_connected,
  };

  // Convert based on device type
  switch (apiDevice.type) {
    case 'thermal_printer':
      return {
        ...baseDevice,
        type: 'receipt_printer',
        connection_type: apiDevice.connection_type,
        paper_size: apiDevice.thermal_printer?.paper_size || 'thermal_80mm',
        auto_print: apiDevice.thermal_printer?.auto_print || true,
        print_copies: apiDevice.thermal_printer?.print_copies || 1,
        cut_paper: apiDevice.thermal_printer?.cut_paper || true,
        open_drawer: apiDevice.thermal_printer?.open_drawer || false,
        character_encoding: apiDevice.thermal_printer?.character_encoding || 'utf8',
        test_mode: apiDevice.test_mode,
        printer_model: apiDevice.thermal_printer?.printer_model,
        ip_address: apiDevice.thermal_printer?.ip_address,
        port: apiDevice.thermal_printer?.port,
      } as HardwareDevice;
    
    case 'kitchen_printer':
      return {
        ...baseDevice,
        type: 'kitchen_printer',
        connection_type: apiDevice.connection_type,
        paper_size: apiDevice.kot_printer?.paper_size || 'thermal_80mm',
        print_header: apiDevice.kot_printer?.print_header || true,
        print_timestamp: apiDevice.kot_printer?.print_timestamp || true,
        print_order_number: apiDevice.kot_printer?.print_order_number || true,
        print_table_info: apiDevice.kot_printer?.print_table_info || true,
        auto_cut: apiDevice.kot_printer?.auto_cut || true,
        character_encoding: apiDevice.kot_printer?.character_encoding || 'utf8',
        kitchen_sections: apiDevice.kot_printer?.kitchen_sections || ['hot_kitchen'],
        printer_model: apiDevice.kot_printer?.printer_model,
        ip_address: apiDevice.kot_printer?.ip_address,
        port: apiDevice.kot_printer?.port,
      } as HardwareDevice;
    
    case 'scanner':
      return {
        ...baseDevice,
        type: 'scanner',
        connection_type: apiDevice.connection_type,
        scanner_model: apiDevice.barcode_scanner?.scanner_model,
        prefix: apiDevice.barcode_scanner?.prefix,
        suffix: apiDevice.barcode_scanner?.suffix,
        min_length: apiDevice.barcode_scanner?.min_length || 3,
        max_length: apiDevice.barcode_scanner?.max_length || 20,
        scan_mode: apiDevice.barcode_scanner?.scan_mode || 'manual',
        beep_on_scan: apiDevice.barcode_scanner?.beep_on_scan || true,
        decode_types: apiDevice.barcode_scanner?.decode_types || ['CODE128'],
      } as HardwareDevice;
    
    case 'cash_drawer':
      return {
        ...baseDevice,
        type: 'cash_drawer',
        connection_type: apiDevice.connection_type,
        auto_open: false,
        trigger_event: 'sale_complete',
        open_duration: 500,
      } as HardwareDevice;
    
    default:
      // Fallback to receipt printer for unknown types
      return {
        ...baseDevice,
        type: 'receipt_printer',
        connection_type: apiDevice.connection_type,
        paper_size: 'thermal_80mm',
        auto_print: true,
        print_copies: 1,
        cut_paper: true,
        open_drawer: false,
        character_encoding: 'utf8',
        test_mode: false,
      } as HardwareDevice;
  }
};

const HardwareConfigurationTab: React.FC<HardwareConfigurationTabProps> = ({
  onSave,
  onFieldChange
}) => {
  const { currentStore } = useTenantStore();
  const [hardwareConfig, setHardwareConfig] = useState<CombinedHardwareConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<'store' | 'terminal'>('store');
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<HardwareDevice | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to convert UI device to API device type
  const convertUIDeviceToApiDevice = (uiDevice: HardwareDevice, terminalId?: string): ApiHardwareDevice => {
    // Map status (handle unknown -> disconnected mapping)
    const apiStatus = uiDevice.status === 'unknown' ? 'disconnected' : uiDevice.status;
    
    const baseDevice = {
      id: uiDevice.id,
      name: uiDevice.name,
      enabled: uiDevice.enabled,
      status: apiStatus as any,
      last_connected: uiDevice.last_connected || new Date().toISOString(),
      store_id: currentStore?.store_id || '',
      terminal_id: terminalId,
      test_mode: false,
      thermal_printer: {},
      kot_printer: {},
      network_printer: {},
      barcode_scanner: {},
    };

    // Map connection types (handle serial -> usb mapping)
    const connectionType = uiDevice.connection_type === 'serial' ? 'usb' : uiDevice.connection_type;

    switch (uiDevice.type) {
      case 'receipt_printer':
        return {
          ...baseDevice,
          type: 'thermal_printer',
          connection_type: connectionType as any,
          test_mode: (uiDevice as any).test_mode || false,
          thermal_printer: {
            printer_model: (uiDevice as any).printer_model,
            ip_address: (uiDevice as any).ip_address,
            port: (uiDevice as any).port,
            paper_size: (uiDevice.paper_size === 'thermal_58mm' || uiDevice.paper_size === 'thermal_80mm') ? uiDevice.paper_size : 'thermal_80mm',
            auto_print: uiDevice.auto_print,
            print_copies: uiDevice.print_copies,
            cut_paper: uiDevice.cut_paper,
            open_drawer: uiDevice.open_drawer,
            character_encoding: uiDevice.character_encoding === 'windows1252' ? 'utf8' : uiDevice.character_encoding as any,
          },
          kot_printer: {},
          network_printer: {},
          barcode_scanner: {},
          cash_drawer: {},
          label_printer: {},
        };
      
      case 'kitchen_printer':
        return {
          ...baseDevice,
          type: 'kitchen_printer',
          connection_type: connectionType as any,
          kot_printer: {
            printer_model: (uiDevice as any).printer_model,
            ip_address: (uiDevice as any).ip_address,
            port: (uiDevice as any).port,
            paper_size: (uiDevice.paper_size === 'thermal_58mm' || uiDevice.paper_size === 'thermal_80mm') ? uiDevice.paper_size : 'thermal_80mm',
            print_header: uiDevice.print_header,
            print_timestamp: uiDevice.print_timestamp,
            print_order_number: uiDevice.print_order_number,
            print_table_info: uiDevice.print_table_info,
            auto_cut: uiDevice.auto_cut,
            character_encoding: uiDevice.character_encoding === 'windows1252' ? 'utf8' : uiDevice.character_encoding as any,
            kitchen_sections: uiDevice.kitchen_sections as any[],
          },
          thermal_printer: {},
          network_printer: {},
          barcode_scanner: {},
          cash_drawer: {},
          label_printer: {},
        };
      
      case 'scanner':
        return {
          ...baseDevice,
          type: 'scanner',
          connection_type: connectionType as any,
          barcode_scanner: {
            scanner_model: (uiDevice as any).scanner_model,
            prefix: (uiDevice as any).prefix,
            suffix: (uiDevice as any).suffix,
            min_length: uiDevice.min_length,
            max_length: uiDevice.max_length,
            scan_mode: uiDevice.scan_mode as any,
            beep_on_scan: uiDevice.beep_on_scan,
            decode_types: uiDevice.decode_types as any[],
          },
          thermal_printer: {},
          kot_printer: {},
          network_printer: {},
          cash_drawer: {},
          label_printer: {},
        };
      
      case 'cash_drawer':
        return {
          ...baseDevice,
          type: 'cash_drawer',
          connection_type: connectionType as any,
          thermal_printer: {},
          kot_printer: {},
          network_printer: {},
          barcode_scanner: {},
          cash_drawer: {},
          label_printer: {},
        };
      
      default:
        return {
          ...baseDevice,
          type: 'thermal_printer',
          connection_type: connectionType as any,
          thermal_printer: {},
          kot_printer: {},
          network_printer: {},
          barcode_scanner: {},
          cash_drawer: {},
          label_printer: {},
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
        const devices = await hardwareApiService.getHardwareDevices(
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
          const apiDevice = devices.find(d => d.id === device.id);
          const terminalId = apiDevice?.terminal_id || 'default';
          if (!combinedConfig.terminal_level[terminalId]) {
            combinedConfig.terminal_level[terminalId] = [];
          }
          combinedConfig.terminal_level[terminalId].push(device);
        });
        
        setHardwareConfig(combinedConfig);
      } catch (error) {
        console.error('Failed to fetch hardware config:', error);
        setErrors({ general: 'Failed to load hardware configuration' });
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
      setErrors({ general: 'Please select a terminal first' });
      return;
    }
    
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
      setErrors({ general: 'Store information not available' });
      return;
    }

    try {
      await hardwareApiService.deleteHardwareDevice(
        currentStore.tenant_id,
        currentStore.store_id,
        deviceId
      );

      // Update local state
      if (!hardwareConfig) return;

      const updatedConfig = { ...hardwareConfig };
      
      if (activeLevel === 'store') {
        updatedConfig.store_level = updatedConfig.store_level.filter((d: HardwareDevice) => d.id !== deviceId);
      } else {
        if (!selectedTerminalId) {
          setErrors({ general: 'Please select a terminal first' });
          return;
        }
        
        if (updatedConfig.terminal_level[selectedTerminalId]) {
          updatedConfig.terminal_level[selectedTerminalId] = updatedConfig.terminal_level[selectedTerminalId].filter((d: HardwareDevice) => d.id !== deviceId);
        }
      }

      setHardwareConfig(updatedConfig);
      onFieldChange();
    } catch (error) {
      console.error('Failed to delete device:', error);
      setErrors({ general: 'Failed to delete device' });
    }
  };

  const handleSaveDevice = async (device: HardwareDevice, terminalId?: string) => {
    if (!currentStore?.tenant_id || !currentStore?.store_id) {
      setErrors({ general: 'Store information not available' });
      return;
    }

    try {
      // Convert UI device to API device format
      const apiDevice = convertUIDeviceToApiDevice(device, terminalId);

      if (formMode === 'create') {
        // Create new device
        await hardwareApiService.createHardwareDevice(
          currentStore.tenant_id,
          currentStore.store_id,
          apiDevice
        );
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
    } catch (error) {
      console.error('Failed to save device:', error);
      setErrors({ general: 'Failed to save device' });
    }
  };

  const handleTestDevice = async (device: HardwareDevice) => {
    if (!currentStore?.tenant_id || !currentStore?.store_id) {
      setErrors({ general: 'Store information not available' });
      return;
    }

    try {
      await hardwareApiService.testHardwareDevice(
        currentStore.tenant_id,
        currentStore.store_id,
        device.id
      );
      // Success feedback would be shown by the card component
    } catch (error) {
      console.error('Device test failed:', error);
      setErrors({ general: `Failed to test ${device.name}` });
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      if (!hardwareConfig) return;

      // For now, just save locally - in production, call proper API
      console.log('Saving hardware configuration:', hardwareConfig);
      onSave({ hardware_config: hardwareConfig });
      setErrors({});
    } catch (error) {
      console.error('Failed to save hardware configuration:', error);
      setErrors({ general: 'Failed to save hardware configuration' });
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
        headerActions={
          <Button
            onClick={handleSaveConfiguration}
            className="px-6"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        }
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
