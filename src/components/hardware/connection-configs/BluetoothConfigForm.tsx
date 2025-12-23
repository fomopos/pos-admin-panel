import React from 'react';
import type { BluetoothConfig } from '../../../types/hardware-new.types';
import { InputTextField, PropertyCheckbox } from '../../ui';

interface BluetoothConfigFormProps {
  config: BluetoothConfig;
  onChange: (config: BluetoothConfig) => void;
  errors?: Record<string, string>;
}

/**
 * BluetoothConfigForm - Configuration form for Bluetooth connections
 * 
 * Handles Bluetooth connection settings including:
 * - MAC address (required)
 * - Service UUID for BLE devices
 * - Device name for discovery
 * - Auto-reconnection settings
 * 
 * @example
 * ```tsx
 * <BluetoothConfigForm
 *   config={device.connection_config as BluetoothConfig}
 *   onChange={(newConfig) => handleConnectionConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const BluetoothConfigForm: React.FC<BluetoothConfigFormProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof BluetoothConfig, value: string | boolean | number | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Bluetooth Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="MAC Address"
          value={config.mac_address || ''}
          onChange={(value) => handleFieldChange('mac_address', value || null)}
          placeholder="00:11:22:33:44:55"
          error={errors['bluetooth_config.mac_address']}
          required
        />

        <InputTextField
          label="Device Name"
          value={config.device_name || ''}
          onChange={(value) => handleFieldChange('device_name', value || null)}
          placeholder="Bluetooth Printer"
          error={errors['bluetooth_config.device_name']}
        />
      </div>

      {/* BLE Service UUID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Service UUID"
          value={config.service_uuid || ''}
          onChange={(value) => handleFieldChange('service_uuid', value || null)}
          placeholder="0000180A-0000-1000-8000-00805F9B34FB"
          error={errors['bluetooth_config.service_uuid']}
        />

        <InputTextField
          label="RSSI (Signal Strength)"
          type="number"
          value={config.rssi?.toString() || ''}
          onChange={(value) => handleFieldChange('rssi', value ? parseInt(value) : null)}
          placeholder="-80"
          error={errors['bluetooth_config.rssi']}
        />
      </div>

      {/* Connection Settings */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Connection Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Device Paired"
            checked={config.paired || false}
            onChange={(checked) => handleFieldChange('paired', checked)}
            description="Whether the device is already paired"
          />

          <PropertyCheckbox
            title="Auto Reconnect"
            checked={config.auto_reconnect || false}
            onChange={(checked) => handleFieldChange('auto_reconnect', checked)}
            description="Automatically reconnect when device is available"
          />
        </div>
      </div>
    </div>
  );
};
