/**
 * Scale Configuration Form Component
 * 
 * Form for configuring weighing scales.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { DropdownSearch, InputTextField } from '../../ui';
import { WEIGHT_UNITS } from '../../../constants/hardware.options';
import type { ScaleConfig, WeightUnit } from '../../../types/hardware.types';

interface ScaleConfigFormProps {
  config: Partial<ScaleConfig>;
  onChange: (config: ScaleConfig) => void;
  errors?: Record<string, string>;
}

/**
 * ScaleConfigForm - Configuration form for weighing scales
 * 
 * @example
 * ```tsx
 * <ScaleConfigForm
 *   config={{ unit: 'kg', decimal_places: 2 }}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const ScaleConfigForm: React.FC<ScaleConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = <K extends keyof ScaleConfig>(
    field: K,
    value: ScaleConfig[K]
  ) => {
    onChange({
      unit: config.unit || 'kg',
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Weight Unit"
          options={WEIGHT_UNITS}
          value={config.unit || 'kg'}
          onSelect={(option) => option && handleFieldChange('unit', option.id as WeightUnit)}
          placeholder="Select unit"
          displayValue={(option) => option ? option.label : 'Select unit'}
          required
          error={errors['scale_config.unit']}
        />

        <InputTextField
          label="Decimal Places"
          type="number"
          value={config.decimal_places?.toString() || '2'}
          onChange={(value) => {
            const num = value ? parseInt(value) : 2;
            if (num >= 0 && num <= 4) {
              handleFieldChange('decimal_places', num);
            }
          }}
          placeholder="2"
          error={errors['scale_config.decimal_places']}
          helperText="Number of decimal places (0-4)"
        />
      </div>
    </div>
  );
};

export default ScaleConfigForm;
