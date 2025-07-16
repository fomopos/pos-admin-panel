import React from 'react';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox
} from '../../ui';
import {
  CASH_DRAWER_MODELS
} from '../../../types/hardware-api';
import type { CashDrawerConfig } from '../../../types/hardware-api';

interface CashDrawerConfigProps {
  config: Partial<CashDrawerConfig>;
  onFieldChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  connectionType: string;
}

const CashDrawerConfigComponent: React.FC<CashDrawerConfigProps> = ({
  config,
  onFieldChange,
  connectionType
}) => {
  return (
    <div className="space-y-6">
      {/* Drawer Model */}
      <DropdownSearch
        label="Cash Drawer Model"
        options={CASH_DRAWER_MODELS}
        value={config.drawer_model || ''}
        onSelect={(option) => option && onFieldChange('drawer_model', option.id)}
        placeholder="Select cash drawer model"
        displayValue={(option) => option ? (
          <div className="flex items-center gap-2">
            <span>{option.label}</span>
          </div>
        ) : 'Select cash drawer model'}
      />

      {/* Network Settings */}
      {connectionType === 'network' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="IP Address"
            value={config.ip_address || ''}
            onChange={(value) => onFieldChange('ip_address', value)}
            placeholder="192.168.1.102"
            required
          />
          <InputTextField
            label="Port"
            type="number"
            value={config.port?.toString() || '9100'}
            onChange={(value) => onFieldChange('port', parseInt(value) || 9100)}
            placeholder="9100"
            required
          />
        </div>
      )}

      {/* Cash Drawer Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PropertyCheckbox
          title="Auto Open"
          description="Automatically open drawer after transactions"
          checked={config.auto_open ?? true}
          onChange={(checked) => onFieldChange('auto_open', checked)}
        />
        <PropertyCheckbox
          title="Monitor Status"
          description="Monitor drawer open/close status"
          checked={config.monitor_status ?? true}
          onChange={(checked) => onFieldChange('monitor_status', checked)}
        />
        <PropertyCheckbox
          title="Alert on Open"
          description="Alert when drawer is left open"
          checked={config.alert_on_open ?? true}
          onChange={(checked) => onFieldChange('alert_on_open', checked)}
        />
        <InputTextField
          label="Open Timeout (seconds)"
          type="number"
          value={config.open_timeout?.toString() || '30'}
          onChange={(value) => onFieldChange('open_timeout', parseInt(value) || 30)}
          placeholder="30"
          required
        />
      </div>

      {/* Pulse Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Pulse Duration (ms)"
          type="number"
          value={config.pulse_duration?.toString() || '100'}
          onChange={(value) => onFieldChange('pulse_duration', parseInt(value) || 100)}
          placeholder="100"
          required
        />
        <InputTextField
          label="Pulse Strength"
          type="number"
          value={config.pulse_strength?.toString() || '50'}
          onChange={(value) => onFieldChange('pulse_strength', parseInt(value) || 50)}
          placeholder="50"
          required
        />
      </div>
    </div>
  );
};

export default CashDrawerConfigComponent;
