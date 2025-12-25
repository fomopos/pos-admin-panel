/**
 * Network Configuration Form Component
 * 
 * Form component for configuring network-based hardware devices.
 * Simplified per new API spec - only requires IP address and port.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { InputTextField } from '../../ui';
import type { NetworkConfig } from '../../../types/hardware.types';

interface NetworkConfigFormProps {
  config: Partial<NetworkConfig>;
  onChange: (config: NetworkConfig) => void;
  errors?: Record<string, string>;
}

/**
 * NetworkConfigForm - Configuration form for network connections
 * 
 * @example
 * ```tsx
 * <NetworkConfigForm
 *   config={{ ip_address: '192.168.1.100', port: 9100 }}
 *   onChange={(newConfig) => handleConnectionConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const NetworkConfigForm: React.FC<NetworkConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = (field: keyof NetworkConfig, value: string | number) => {
    onChange({
      ip_address: config.ip_address || '',
      port: config.port || 9100,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="IP Address"
          value={config.ip_address || ''}
          onChange={(value) => handleFieldChange('ip_address', value)}
          placeholder="192.168.1.100"
          required
          error={errors['network_config.ip_address']}
          helperText="Enter the device's IP address"
        />

        <InputTextField
          label="Port"
          type="number"
          value={config.port?.toString() || '9100'}
          onChange={(value) => handleFieldChange('port', value ? parseInt(value) : 9100)}
          placeholder="9100"
          required
          error={errors['network_config.port']}
          helperText="Default: 9100 for most printers"
        />
      </div>
    </div>
  );
};

export default NetworkConfigForm;
