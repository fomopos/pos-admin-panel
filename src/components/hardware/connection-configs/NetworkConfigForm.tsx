/**
 * Network Configuration Form Component
 * 
 * Form component for configuring network-based hardware devices (TCP/IP, HTTP, WebSocket).
 * Handles IP address, port, protocol selection, timeouts, and heartbeat configuration.
 */

import React from 'react';
import { InputTextField, DropdownSearch, PropertyCheckbox } from '../../ui';
import { NETWORK_PROTOCOLS, getDefaultPortForProtocol } from '../../../constants/hardwareOptions';
import type { NetworkConfig } from '../../../types/hardware-new.types';

interface NetworkConfigFormProps {
  config: Partial<NetworkConfig>;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const NetworkConfigForm: React.FC<NetworkConfigFormProps> = ({
  config,
  onFieldChange,
  errors = {}
}) => {
  const handleProtocolChange = (protocol: string) => {
    onFieldChange('network_config', {
      ...config,
      protocol,
      port: config.port || getDefaultPortForProtocol(protocol)
    });
  };

  const handleFieldChange = (field: keyof NetworkConfig, value: any) => {
    onFieldChange('network_config', {
      ...config,
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
        />

        <InputTextField
          label="Port"
          type="number"
          value={config.port?.toString() || ''}
          onChange={(value) => handleFieldChange('port', value ? parseInt(value) : null)}
          placeholder="9100"
          required
          error={errors['network_config.port']}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Protocol"
          options={NETWORK_PROTOCOLS}
          value={config.protocol || ''}
          onSelect={(option) => option && handleProtocolChange(option.id)}
          placeholder="Select protocol"
          error={errors['network_config.protocol']}
          displayValue={(option) => option ? option.label : 'Select protocol'}
        />

        <PropertyCheckbox
          title="Use mDNS Discovery"
          description="Enable multicast DNS for automatic device discovery"
          checked={config.use_mdns || false}
          onChange={(checked) => handleFieldChange('use_mdns', checked)}
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Timeout Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputTextField
            label="Connect Timeout (ms)"
            type="number"
            value={config.connect_timeout_ms?.toString() || ''}
            onChange={(value) => handleFieldChange('connect_timeout_ms', value ? parseInt(value) : null)}
            placeholder="5000"
            error={errors['network_config.connect_timeout_ms']}
          />

          <InputTextField
            label="Read Timeout (ms)"
            type="number"
            value={config.read_timeout_ms?.toString() || ''}
            onChange={(value) => handleFieldChange('read_timeout_ms', value ? parseInt(value) : null)}
            placeholder="3000"
            error={errors['network_config.read_timeout_ms']}
          />

          <InputTextField
            label="Write Timeout (ms)"
            type="number"
            value={config.write_timeout_ms?.toString() || ''}
            onChange={(value) => handleFieldChange('write_timeout_ms', value ? parseInt(value) : null)}
            placeholder="3000"
            error={errors['network_config.write_timeout_ms']}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Heartbeat Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Configure heartbeat commands for periodic device health checks (optional)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Heartbeat Command (hex)"
            value={config.heartbeat_command ? config.heartbeat_command.map(b => b.toString(16).padStart(2, '0')).join(' ') : ''}
            onChange={(value) => {
              if (value) {
                const bytes = value.split(' ').map(h => parseInt(h, 16)).filter(b => !isNaN(b));
                handleFieldChange('heartbeat_command', bytes);
              } else {
                handleFieldChange('heartbeat_command', null);
              }
            }}
            placeholder="1B 05 (ESC/POS status check)"
            error={errors['network_config.heartbeat_command']}
          />

          <InputTextField
            label="Expected Response (hex)"
            value={config.expected_heartbeat_response ? config.expected_heartbeat_response.map(b => b.toString(16).padStart(2, '0')).join(' ') : ''}
            onChange={(value) => {
              if (value) {
                const bytes = value.split(' ').map(h => parseInt(h, 16)).filter(b => !isNaN(b));
                handleFieldChange('expected_heartbeat_response', bytes);
              } else {
                handleFieldChange('expected_heartbeat_response', null);
              }
            }}
            placeholder="10 04 14"
            error={errors['network_config.expected_heartbeat_response']}
          />
        </div>
      </div>
    </div>
  );
};

export default NetworkConfigForm;
