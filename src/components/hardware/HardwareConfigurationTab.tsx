/**
 * Hardware Configuration Tab - New API Specification
 * 
 * Main component for managing hardware devices at store and terminal levels.
 * Uses the new simplified API with 6 device types and 3 connection types.
 * 
 * @see src/types/hardware.types.ts
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComputerDesktopIcon,
  PlusIcon,
  CogIcon,
  FunnelIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  Widget,
  Button,
  Alert,
  EnhancedTabs,
  DropdownSearch,
  MultipleDropdownSearch,
  InputTextField
} from '../ui';

// New components
import { DeviceCard } from './DeviceCard';
import DeviceForm from './DeviceForm';

// New service
import { hardwareService } from '../../services/hardware/hardware.service';

// New types
import type {
  HardwareDevice,
  CreateHardwareDTO,
  DeviceType,
  ConnectionType
} from '../../types/hardware.types';

// New options
import {
  DEVICE_TYPES,
  CONNECTION_TYPES
} from '../../constants/hardware.options';

// Store
import { useTenantStore } from '../../tenants/tenantStore';
import { useError } from '../../hooks/useError';

// ============================================================================
// TYPES
// ============================================================================

interface HardwareConfigurationTabProps {
  settings?: any;
  onFieldChange?: () => void;
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
  connectionTypes: ConnectionType[];
  searchTerm: string;
  enabledOnly: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const HardwareConfigurationTab: React.FC<HardwareConfigurationTabProps> = ({
  onFieldChange
}) => {
  const { t } = useTranslation();
  const { currentStore } = useTenantStore();
  const { showError, showSuccess } = useError();

  // State
  const [devices, setDevices] = useState<HardwareDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<'store' | 'terminal'>('store');
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<HardwareDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    deviceTypes: [],
    connectionTypes: [],
    searchTerm: '',
    enabledOnly: false
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Hardware level tabs
  const levelTabs = [
    { 
      id: 'store', 
      name: t('hardware.storeLevel', 'Store Level'), 
      icon: ComputerDesktopIcon,
      description: t('hardware.storeLevelDesc', 'Common to all registers')
    },
    { 
      id: 'terminal', 
      name: t('hardware.terminalLevel', 'Terminal Level'), 
      icon: CogIcon,
      description: t('hardware.terminalLevelDesc', 'Specific to individual registers')
    }
  ];

  // Get terminal options for dropdown
  const getTerminalOptions = useCallback((): HardwareOption[] => {
    if (!currentStore?.terminals) return [];
    
    return Object.values(currentStore.terminals).map((terminal: any) => ({
      id: terminal.terminal_id,
      label: `${terminal.name} (${terminal.terminal_id})`,
      value: terminal.terminal_id,
      description: `${terminal.platform || 'Unknown'} - ${terminal.status || 'unknown'}`,
      icon: terminal.status === 'active' ? '🟢' : '🔴'
    }));
  }, [currentStore?.terminals]);

  // Filter devices based on current filters
  const applyFilters = useCallback((deviceList: HardwareDevice[]): HardwareDevice[] => {
    let filtered = [...deviceList];

    // Filter by device type
    if (filters.deviceTypes.length > 0) {
      filtered = filtered.filter(d => filters.deviceTypes.includes(d.type));
    }

    // Filter by connection type
    if (filters.connectionTypes.length > 0) {
      filtered = filtered.filter(d => filters.connectionTypes.includes(d.connection_type));
    }

    // Filter by enabled status
    if (filters.enabledOnly) {
      filtered = filtered.filter(d => d.enabled !== false);
    }

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name?.toLowerCase().includes(searchLower) ||
        d.id.toLowerCase().includes(searchLower) ||
        d.type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [filters]);

  // Get current devices based on active level and terminal selection
  const getCurrentDevices = useCallback((): HardwareDevice[] => {
    let levelDevices: HardwareDevice[];
    
    if (activeLevel === 'store') {
      // Store level: devices without terminal_id
      levelDevices = devices.filter(d => !d.terminal_id);
    } else {
      // Terminal level: devices with matching terminal_id
      if (!selectedTerminalId) return [];
      levelDevices = devices.filter(d => d.terminal_id === selectedTerminalId);
    }
    
    return applyFilters(levelDevices);
  }, [devices, activeLevel, selectedTerminalId, applyFilters]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchDevices = useCallback(async () => {
    if (!currentStore?.store_id) {
      setError(t('hardware.noStoreSelected', 'No store selected'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await hardwareService.getAllDevices(currentStore.store_id);
      setDevices(response.hardware);
    } catch (err: any) {
      console.error('Failed to fetch hardware devices:', err);
      showError(err);
      setError(err?.message || t('hardware.fetchFailed', 'Failed to load hardware configuration'));
    } finally {
      setIsLoading(false);
    }
  }, [currentStore?.store_id, showError, t]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLevelTabChange = useCallback((tabId: string) => {
    setActiveLevel(tabId as 'store' | 'terminal');
    setError(null);
    
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
  }, [selectedTerminalId, getTerminalOptions]);

  const handleAddDevice = useCallback(() => {
    // Check if terminal is selected for terminal level
    if (activeLevel === 'terminal' && !selectedTerminalId) {
      showError(t('hardware.selectTerminalFirst', 'Please select a terminal first'));
      return;
    }
    
    setEditingDevice(null);
    setShowDeviceForm(true);
  }, [activeLevel, selectedTerminalId, showError, t]);

  const handleEditDevice = useCallback((device: HardwareDevice) => {
    setEditingDevice(device);
    setShowDeviceForm(true);
  }, []);

  const handleDeleteDevice = useCallback(async (deviceId: string) => {
    if (!currentStore?.store_id) {
      showError(t('hardware.noStoreSelected', 'No store selected'));
      return;
    }

    try {
      const deviceToDelete = devices.find(d => d.id === deviceId);
      const deviceName = deviceToDelete?.name || deviceId;

      await hardwareService.deleteDevice(currentStore.store_id, deviceId);
      
      showSuccess(t('hardware.deviceDeleted', 'Device "{{name}}" deleted successfully', { name: deviceName }));

      // Update local state
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      onFieldChange?.();
    } catch (err: any) {
      console.error('Failed to delete device:', err);
      showError(err);
    }
  }, [currentStore?.store_id, devices, showError, showSuccess, onFieldChange, t]);

  const handleSaveDevice = useCallback(async (deviceData: CreateHardwareDTO) => {
    if (!currentStore?.store_id) {
      showError(t('hardware.noStoreSelected', 'No store selected'));
      return;
    }

    const isEdit = !!editingDevice;

    try {
      if (isEdit) {
        // Update existing device
        const { id, type, ...updateData } = deviceData;
        await hardwareService.updateDevice(
          currentStore.store_id,
          deviceData.id,
          updateData
        );
        
        showSuccess(t('hardware.deviceUpdated', 'Device updated successfully'));
        
        // Update local state - merge the update data with existing device
        setDevices(prev => prev.map(d => 
          d.id === deviceData.id 
            ? { ...d, ...deviceData, updated_at: new Date().toISOString() }
            : d
        ));
      } else {
        // Create new device
        const newDevice = await hardwareService.createDevice(currentStore.store_id, deviceData);
        
        showSuccess(t('hardware.deviceCreated', 'Device created successfully'));
        
        // Add to local state
        setDevices(prev => [...prev, newDevice]);
      }

      setShowDeviceForm(false);
      setEditingDevice(null);
      onFieldChange?.();
    } catch (err: any) {
      console.error('Failed to save device:', err);
      throw err; // Re-throw to let form handle error display
    }
  }, [currentStore?.store_id, editingDevice, showError, showSuccess, onFieldChange, t]);

  const handleToggleDevice = useCallback(async (device: HardwareDevice) => {
    if (!currentStore?.store_id) return;

    try {
      const newEnabledState = !device.enabled;
      await hardwareService.updateDevice(
        currentStore.store_id,
        device.id,
        { enabled: newEnabledState }
      );
      
      // Update local state
      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { ...d, enabled: newEnabledState, updated_at: new Date().toISOString() }
          : d
      ));
      showSuccess(t('hardware.deviceToggled', 'Device {{status}}', { 
        status: newEnabledState ? 'enabled' : 'disabled' 
      }));
      onFieldChange?.();
    } catch (err: any) {
      console.error('Failed to toggle device:', err);
      showError(err);
    }
  }, [currentStore?.store_id, showError, showSuccess, onFieldChange, t]);

  const clearFilters = useCallback(() => {
    setFilters({
      deviceTypes: [],
      connectionTypes: [],
      searchTerm: '',
      enabledOnly: false
    });
  }, []);

  // ============================================================================
  // RENDER: LOADING
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Widget
          title={t('hardware.title', 'Hardware Configuration')}
          description={t('hardware.loading', 'Loading hardware configuration...')}
          icon={ComputerDesktopIcon}
        >
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Widget>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN
  // ============================================================================

  const currentDevices = getCurrentDevices();
  const totalDevicesAtLevel = devices.filter(d => 
    activeLevel === 'store' ? !d.terminal_id : d.terminal_id === selectedTerminalId
  ).length;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchDevices}>
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              {t('common.retry', 'Retry')}
            </Button>
          </div>
        </Alert>
      )}

      {/* Hardware Configuration Header */}
      <Widget
        title={t('hardware.title', 'Hardware Configuration')}
        description={t('hardware.description', 'Configure hardware devices for your point of sale system at both store and terminal levels')}
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
                {activeLevel === 'store' 
                  ? t('hardware.storeLevelConfig', 'Store Level Configuration')
                  : t('hardware.terminalLevelConfig', 'Terminal Level Configuration')
                }
              </h3>
              <p className="text-sm text-blue-700">
                {activeLevel === 'store' 
                  ? t('hardware.storeLevelInfo', 'Hardware devices configured at store level are shared across all registers and terminals in this store.')
                  : t('hardware.terminalLevelInfo', 'Hardware devices configured at terminal level are specific to individual registers and override store-level settings.')
                }
              </p>
            </div>

            {/* Terminal Selection (for terminal level only) */}
            {activeLevel === 'terminal' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-amber-900 mb-3">
                  {t('hardware.selectTerminal', 'Select Terminal')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DropdownSearch
                    label={t('hardware.terminal', 'Terminal')}
                    options={getTerminalOptions()}
                    value={selectedTerminalId}
                    onSelect={(option) => setSelectedTerminalId(option ? option.id : '')}
                    placeholder={t('hardware.selectTerminalPlaceholder', 'Select a terminal to view/edit its devices')}
                    displayValue={(option) => option ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    ) : t('hardware.selectTerminalShort', 'Select terminal')}
                  />
                  {selectedTerminalId && (
                    <div className="flex items-center text-sm text-amber-700">
                      <span>
                        {t('hardware.viewingDevicesFor', 'Viewing devices for')}: 
                        <strong className="ml-1">
                          {getTerminalOptions().find(t => t.id === selectedTerminalId)?.label}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Device List Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeLevel === 'store' 
                      ? t('hardware.storeDevices', 'Store Hardware Devices')
                      : t('hardware.terminalDevices', 'Terminal Hardware Devices')
                    }
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentDevices.length === totalDevicesAtLevel
                      ? t('hardware.deviceCount', '{{count}} device(s) configured', { count: currentDevices.length })
                      : t('hardware.deviceCountFiltered', '{{shown}} of {{total}} device(s) shown', { 
                          shown: currentDevices.length, 
                          total: totalDevicesAtLevel 
                        })
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant={showFilters ? "primary" : "outline"}
                    size="sm"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    {t('common.filters', 'Filters')}
                    {(filters.deviceTypes.length > 0 || filters.connectionTypes.length > 0 || filters.searchTerm || filters.enabledOnly) && (
                      <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                        {filters.deviceTypes.length + filters.connectionTypes.length + (filters.searchTerm ? 1 : 0) + (filters.enabledOnly ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={fetchDevices}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleAddDevice}
                    variant="primary"
                    size="sm"
                    disabled={activeLevel === 'terminal' && !selectedTerminalId}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('hardware.addDevice', 'Add Device')}
                  </Button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputTextField
                      label={t('common.search', 'Search')}
                      value={filters.searchTerm}
                      onChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
                      placeholder={t('hardware.searchPlaceholder', 'Search devices...')}
                    />
                    
                    <MultipleDropdownSearch
                      label={t('hardware.deviceTypes', 'Device Types')}
                      options={DEVICE_TYPES.map(dt => ({ id: dt.id, label: dt.label, value: dt.value }))}
                      values={filters.deviceTypes}
                      onSelect={(selected) => setFilters(prev => ({ ...prev, deviceTypes: selected as DeviceType[] }))}
                      placeholder={t('hardware.allTypes', 'All types')}
                    />
                    
                    <MultipleDropdownSearch
                      label={t('hardware.connectionTypes', 'Connection Types')}
                      options={CONNECTION_TYPES.map(ct => ({ id: ct.id, label: ct.label, value: ct.value }))}
                      values={filters.connectionTypes}
                      onSelect={(selected) => setFilters(prev => ({ ...prev, connectionTypes: selected as ConnectionType[] }))}
                      placeholder={t('hardware.allConnections', 'All connections')}
                    />
                    
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.enabledOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, enabledOnly: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {t('hardware.enabledOnly', 'Enabled only')}
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      size="sm"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {t('common.clearFilters', 'Clear Filters')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Device List Content */}
              {activeLevel === 'terminal' && !selectedTerminalId ? (
                // Terminal not selected prompt
                <div className="text-center py-12 bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg">
                  <ComputerDesktopIcon className="mx-auto h-12 w-12 text-amber-400 mb-4" />
                  <h3 className="text-lg font-medium text-amber-900 mb-2">
                    {t('hardware.selectTerminalPrompt', 'Select a Terminal')}
                  </h3>
                  <p className="text-sm text-amber-700 mb-6">
                    {t('hardware.selectTerminalInfo', 'Please select a terminal from the dropdown above to view and manage its hardware devices.')}
                  </p>
                </div>
              ) : currentDevices.length === 0 ? (
                // Empty state
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {totalDevicesAtLevel === 0
                      ? t('hardware.noDevices', 'No hardware devices configured')
                      : t('hardware.noMatchingDevices', 'No devices match your filters')
                    }
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {totalDevicesAtLevel === 0
                      ? t('hardware.getStarted', 'Get started by adding your first hardware device.')
                      : t('hardware.tryDifferentFilters', 'Try adjusting your filter criteria.')
                    }
                  </p>
                  {totalDevicesAtLevel === 0 ? (
                    <Button onClick={handleAddDevice} variant="primary">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {t('hardware.addDevice', 'Add Device')}
                    </Button>
                  ) : (
                    <Button onClick={clearFilters} variant="outline">
                      {t('common.clearFilters', 'Clear Filters')}
                    </Button>
                  )}
                </div>
              ) : (
                // Device grid
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentDevices.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onEdit={() => handleEditDevice(device)}
                      onDelete={() => handleDeleteDevice(device.id)}
                      onToggle={() => handleToggleDevice(device)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </EnhancedTabs>
      </Widget>

      {/* Device Form Modal */}
      <DeviceForm
        isOpen={showDeviceForm}
        onClose={() => {
          setShowDeviceForm(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
        device={editingDevice}
        level={activeLevel}
        terminalId={activeLevel === 'terminal' ? selectedTerminalId : undefined}
      />
    </div>
  );
};

export default HardwareConfigurationTab;
