/**
 * Display Configuration Form Component
 * 
 * Form for configuring customer displays and KDS screens.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { InputTextField } from '../../ui';
import type { DisplayConfig } from '../../../types/hardware.types';

interface DisplayConfigFormProps {
  config: Partial<DisplayConfig>;
  onChange: (config: DisplayConfig) => void;
  errors?: Record<string, string>;
}

/**
 * DisplayConfigForm - Configuration form for displays
 * 
 * @example
 * ```tsx
 * <DisplayConfigForm
 *   config={{ line_count: 2, chars_per_line: 20 }}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const DisplayConfigForm: React.FC<DisplayConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = <K extends keyof DisplayConfig>(
    field: K,
    value: DisplayConfig[K]
  ) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Number of Lines"
          type="number"
          value={config.line_count?.toString() || '2'}
          onChange={(value) => {
            const num = value ? parseInt(value) : 2;
            if (num >= 1 && num <= 20) {
              handleFieldChange('line_count', num);
            }
          }}
          placeholder="2"
          error={errors['display_config.line_count']}
          helperText="Number of display lines (1-20)"
        />

        <InputTextField
          label="Characters per Line"
          type="number"
          value={config.chars_per_line?.toString() || '20'}
          onChange={(value) => {
            const num = value ? parseInt(value) : 20;
            if (num >= 10 && num <= 80) {
              handleFieldChange('chars_per_line', num);
            }
          }}
          placeholder="20"
          error={errors['display_config.chars_per_line']}
          helperText="Characters per line (10-80)"
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Common Display Configurations</h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">VFD 2×20:</span> 2 lines, 20 chars
          </div>
          <div>
            <span className="font-medium">VFD 4×20:</span> 4 lines, 20 chars
          </div>
          <div>
            <span className="font-medium">LCD 2×16:</span> 2 lines, 16 chars
          </div>
          <div>
            <span className="font-medium">KDS Tablet:</span> 10 lines, 40 chars
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayConfigForm;
