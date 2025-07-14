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
import { hardwareConfigService } from '../../services/hardware/hardwareConfigService';
import { useTenantStore } from '../../tenants/tenantStore';
import type { 
  HardwareDevice, 
  HardwareOption
} from '../../types/hardware';

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
      setIsLoading(true);
      try {
        // Use mock data for development - in production, get tenantId and storeId from context
        const configResponse = await hardwareConfigService.getMockHardwareConfig();
        
        // Transform the response into our combined structure
        const combinedConfig: CombinedHardwareConfig = {
          store_level: configResponse.store_config.devices,
          terminal_level: {}
        };
        
        // Transform terminal configs
        configResponse.terminal_configs.forEach((terminalConfig) => {
          combinedConfig.terminal_level[terminalConfig.terminal_id] = terminalConfig.devices;
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
  }, []);

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
    try {
      if (!hardwareConfig) return;

      const updatedConfig = { ...hardwareConfig };
      
      if (activeLevel === 'store') {
        updatedConfig.store_level = updatedConfig.store_level.filter((d: HardwareDevice) => d.id !== deviceId);
      } else {
        // For terminal level, we need to check if a terminal is selected
        if (!selectedTerminalId) {
          // No terminal selected, can't delete
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
    try {
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
    try {
      // Mock test - in production, provide proper parameters
      await hardwareConfigService.testHardwareDevice('tenant_123', 'store_456', device.id, {
        device_id: device.id,
        test_type: 'connection'
      });
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
