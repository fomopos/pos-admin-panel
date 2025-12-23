import React, { useState, useEffect } from 'react';
import {
  ComputerDesktopIcon,
  PlusIcon,
  CogIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  Widget,
  Button,
  Alert,
  EnhancedTabs,
  DropdownSearch,
  MultipleDropdownSearch
} from '../ui';
import HardwareDeviceCard from './HardwareDeviceCard';
import HardwareDeviceForm from './HardwareDeviceForm';
import { hardwareApiService } from '../../services/hardware/hardwareApiService';
import { useTenantStore } from '../../tenants/tenantStore';
import { useError } from '../../hooks/useError';
import type { 
  HardwareDevice,
  DeviceType,
  DeviceStatus,
  ConnectionType
} from '../../types/hardware-new.types';
import {
  DEVICE_TYPES,
  CONNECTION_TYPES,
  DEVICE_STATUS_OPTIONS
} from '../../constants/hardwareOptions';

interface HardwareConfigurationTabProps {
  settings: any;
  onFieldChange: () => void;
}

interface HardwareOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

interface FilterState {
  deviceTypes: DeviceType[];
  statuses: DeviceStatus[];
  connectionTypes: ConnectionType[];
  searchTerm: string;
}

// No converter needed - new API service handles transformation

const HardwareConfigurationTab: React.FC<HardwareConfigurationTabProps> = ({
  onFieldChange
}) => {
  const { currentStore } = useTenantStore();
  const { showError, showSuccess } = useError();
  const [devices, setDevices] = useState<HardwareDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<'store' | 'terminal'>('store');
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<HardwareDevice | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    deviceTypes: [],
    statuses: [],
    connectionTypes: [],
    searchTerm: ''
  });

  // Filter and search devices
  const applyFilters = (deviceList: HardwareDevice[]): HardwareDevice[] => {
    let filtered = [...deviceList];

    // Filter by device type
    if (filters.deviceTypes.length > 0) {
      filtered = filtered.filter(d => d.device_type && filters.deviceTypes.includes(d.device_type));
    }

    // Filter by status
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(d => d.status && filters.statuses.includes(d.status));
    }

    // Filter by connection type
    if (filters.connectionTypes.length > 0) {
      filtered = filtered.filter(d => filters.connectionTypes.includes(d.connection_type));
    }

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name?.toLowerCase().includes(searchLower) ||
        d.description?.toLowerCase().includes(searchLower) ||
        d.model?.toLowerCase().includes(searchLower) ||
        d.manufacturer?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
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
        // Fetch all devices using new API service
        const fetchedDevices = await hardwareApiService.getHardwareDevices(
          currentStore.tenant_id,
          currentStore.store_id
        );
        
        setDevices(fetchedDevices);
      } catch (error: any) {
        console.error('Failed to fetch hardware config:', error);
        showError(error);
        setErrors({ general: error?.message || 'Failed to load hardware configuration. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHardwareConfig();
  }, [currentStore, showError]);

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
      setErrors({});
      
      const deviceToDelete = getCurrentDevices().find(d => d.device_id === deviceId);
      const deviceName = deviceToDelete?.name || 'device';

      await hardwareApiService.deleteHardwareDevice(
        currentStore.tenant_id,
        currentStore.store_id,
        deviceId
      );

      showSuccess(`Device "${deviceName}" deleted successfully!`);

      // Update local state
      setDevices(prevDevices => prevDevices.filter(d => d.device_id !== deviceId));
      onFieldChange();
    } catch (error: any) {
      console.error('Failed to delete device:', error);
      showError(error);
      setErrors({ general: error?.message || 'Failed to delete device. Please try again.' });
    }
  };

  const handleSaveDevice = async (deviceData: Partial<HardwareDevice>, terminalId?: string) => {
    if (!currentStore?.tenant_id || !currentStore?.store_id) {
      showError('Store information not available');
      setErrors({ general: 'Store information not available' });
      return;
    }

    try {
      setErrors({});
      
      if (formMode === 'create') {
        // Create new device
        const newDevice = await hardwareApiService.createHardwareDevice(
          currentStore.tenant_id,
          currentStore.store_id,
          {
            ...deviceData,
            terminal_id: terminalId
          } as HardwareDevice
        );
        showSuccess(`Device "${deviceData.name}" created successfully!`);
        
        // Add to local state
        setDevices(prevDevices => [...prevDevices, newDevice]);
      } else {
        // Update existing device
        const updatedDevice = await hardwareApiService.updateHardwareDevice(
          currentStore.tenant_id,
          currentStore.store_id,
          deviceData.device_id!,
          deviceData
        );
        showSuccess(`Device "${deviceData.name}" updated successfully!`);
        
        // Update local state
        setDevices(prevDevices => 
          prevDevices.map(d => d.device_id === updatedDevice.device_id ? updatedDevice : d)
        );
      }

      setShowDeviceForm(false);
      setEditingDevice(null);
      onFieldChange();
    } catch (error: any) {
      console.error('Failed to save device:', error);
      showError(error);
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
      setErrors({});
      
      if (!device.device_id) {
        throw new Error('Device ID is missing');
      }
      
      await hardwareApiService.testHardwareDevice(
        currentStore.tenant_id,
        currentStore.store_id,
        device.device_id,
        { 
          device_id: device.device_id,
          test_type: 'connection'
        }
      );
      
      showSuccess(`Device "${device.name}" test completed successfully!`);
    } catch (error: any) {
      console.error('Device test failed:', error);
      showError(error);
      setErrors({ general: error?.message || `Failed to test device "${device.name}". Please try again.` });
    }
  };

  const getCurrentDevices = (): HardwareDevice[] => {
    let filteredDevices: HardwareDevice[] = [];
    
    if (activeLevel === 'store') {
      // Store level: devices without terminal_id
      filteredDevices = devices.filter(d => !d.terminal_id);
    } else {
      // Terminal level: devices with matching terminal_id
      if (!selectedTerminalId) return [];
      filteredDevices = devices.filter(d => d.terminal_id === selectedTerminalId);
    }
    
    // Apply filters
    return applyFilters(filteredDevices);
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
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeLevel === 'store' ? 'Store Hardware Devices' : 'Terminal Hardware Devices'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentDevices.length} device{currentDevices.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant={showFilters ? "primary" : "outline"}
                    size="sm"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
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
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                      </label>
                      <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        placeholder="Search devices..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <MultipleDropdownSearch
                      label="Device Types"
                      options={DEVICE_TYPES}
                      values={filters.deviceTypes}
                      onSelect={(selected) => setFilters(prev => ({ ...prev, deviceTypes: selected as DeviceType[] }))}
                      placeholder="All types"
                    />
                    
                    <MultipleDropdownSearch
                      label="Status"
                      options={DEVICE_STATUS_OPTIONS}
                      values={filters.statuses}
                      onSelect={(selected) => setFilters(prev => ({ ...prev, statuses: selected as DeviceStatus[] }))}
                      placeholder="All statuses"
                    />
                    
                    <MultipleDropdownSearch
                      label="Connection Types"
                      options={CONNECTION_TYPES}
                      values={filters.connectionTypes}
                      onSelect={(selected) => setFilters(prev => ({ ...prev, connectionTypes: selected as ConnectionType[] }))}
                      placeholder="All connections"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {currentDevices.length} of {devices.filter(d => 
                        activeLevel === 'store' ? !d.terminal_id : d.terminal_id === selectedTerminalId
                      ).length} devices shown
                    </p>
                    <Button
                      onClick={() => setFilters({ deviceTypes: [], statuses: [], connectionTypes: [], searchTerm: '' })}
                      variant="outline"
                      size="sm"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}

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
                      key={device.device_id}
                      device={device}
                      onEdit={() => handleEditDevice(device)}
                      onDelete={() => device.device_id && handleDeleteDevice(device.device_id)}
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
