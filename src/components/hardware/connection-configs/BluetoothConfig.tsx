/**
 * Bluetooth Configuration Form Component
 * 
 * Form component for configuring Bluetooth hardware devices.
 * Simplified per new API spec.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { InputTextField } from '../../ui';
import type { BluetoothConfig } from '../../../types/hardware.types';

interface BluetoothConfigFormProps {
  config: Partial<BluetoothConfig>;
  onChange: (config: BluetoothConfig) => void;
  errors?: Record<string, string>;
}

/**
 * BluetoothConfigForm - Configuration form for Bluetooth connections
 * 
 * @example
 * ```tsx
 * <BluetoothConfigForm
 *   config={{ mac_address: '00:11:22:33:44:55', device_name: 'Star TSP143' }}
 *   onChange={(newConfig) => handleConnectionConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const BluetoothConfigForm: React.FC<BluetoothConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = (field: keyof BluetoothConfig, value: string) => {
    onChange({
      mac_address: config.mac_address || '',
      device_name: config.device_name,
      service_uuid: config.service_uuid,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="MAC Address"
          value={config.mac_address || ''}
          onChange={(value) => handleFieldChange('mac_address', value)}
          placeholder="00:11:22:33:44:55"
          required
          error={errors['bluetooth_config.mac_address']}
          helperText="Bluetooth device MAC address"
        />

        <InputTextField
          label="Device Name"
          value={config.device_name || ''}
          onChange={(value) => handleFieldChange('device_name', value)}
          placeholder="Star TSP143"
          error={errors['bluetooth_config.device_name']}
          helperText="Optional device name for identification"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <InputTextField
          label="Service UUID"
          value={config.service_uuid || ''}
          onChange={(value) => handleFieldChange('service_uuid', value)}
          placeholder="00001101-0000-1000-8000-00805F9B34FB"
          error={errors['bluetooth_config.service_uuid']}
          helperText="Bluetooth service UUID (SPP default shown)"
        />
      </div>
    </div>
  );
};

export default BluetoothConfigForm;
