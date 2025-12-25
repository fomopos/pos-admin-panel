/**
 * Cash Drawer Configuration Form Component
 * 
 * Form for configuring cash drawers.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { InputTextField } from '../../ui';
import type { DrawerConfig } from '../../../types/hardware.types';

interface DrawerConfigFormProps {
  config: Partial<DrawerConfig>;
  onChange: (config: DrawerConfig) => void;
  errors?: Record<string, string>;
}

/**
 * DrawerConfigForm - Configuration form for cash drawers
 * 
 * @example
 * ```tsx
 * <DrawerConfigForm
 *   config={{ open_command: 'ESC p 0 50 250' }}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const DrawerConfigForm: React.FC<DrawerConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = <K extends keyof DrawerConfig>(
    field: K,
    value: DrawerConfig[K]
  ) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <InputTextField
          label="Open Command"
          value={config.open_command || ''}
          onChange={(value) => handleFieldChange('open_command', value || undefined)}
          placeholder="ESC p 0 50 250"
          error={errors['drawer_config.open_command']}
          helperText="ESC/POS command to open the cash drawer"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Common Open Commands</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><code className="bg-blue-100 px-1 rounded">ESC p 0 50 250</code> - Standard ESC/POS command</li>
          <li><code className="bg-blue-100 px-1 rounded">ESC p 0 25 250</code> - Short pulse variant</li>
          <li><code className="bg-blue-100 px-1 rounded">ESC p 1 50 250</code> - Alternate pin drawer</li>
        </ul>
      </div>
    </div>
  );
};

export default DrawerConfigForm;
