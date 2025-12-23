import React from 'react';
import type { ScaleConfig } from '../../../types/hardware-new.types';
import {
  DropdownSearch,
  InputTextField
} from '../../ui';
import { WEIGHT_UNITS } from '../../../constants/hardwareOptions';

interface ScaleConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
  errors?: Record<string, string>;
}

/**
 * ScaleConfig - Configuration form for weight scales
 * 
 * Handles scale settings including:
 * - Weight unit (kg, g, lb)
 * - Decimal precision (number of decimal places)
 * - Stabilization time (time to settle before reading)
 * 
 * Weight scales are used in retail, produce markets, deli counters,
 * and bulk food sections for weighing items and calculating prices.
 * 
 * @example
 * ```tsx
 * <ScaleConfig
 *   config={device.device_config as ScaleConfig}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
const ScaleConfigComponent: React.FC<ScaleConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof ScaleConfig, value: string | number | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Weight Unit and Precision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Weight Unit"
          options={WEIGHT_UNITS}
          value={config.unit || 'kg'}
          onSelect={(option) => option && handleFieldChange('unit', option.id)}
          placeholder="Select weight unit"
          displayValue={(option) => option ? option.label : 'Select weight unit'}
          error={errors['scale_config.unit']}
        />

        <InputTextField
          label="Decimal Places"
          type="number"
          value={config.decimal_places?.toString() || ''}
          onChange={(value) => {
            const num = value ? parseInt(value) : null;
            if (num !== null && (num < 0 || num > 5)) return;
            handleFieldChange('decimal_places', num);
          }}
          placeholder="2"
          error={errors['scale_config.decimal_places']}
        />
      </div>

      {/* Stabilization Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Stabilization Time (ms)"
          type="number"
          value={config.stabilize_time_ms?.toString() || ''}
          onChange={(value) => handleFieldChange('stabilize_time_ms', value ? parseInt(value) : null)}
          placeholder="500"
          error={errors['scale_config.stabilize_time_ms']}
        />
      </div>

      {/* Help Text */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-teal-900 mb-2">Weight Scale Configuration Notes</h5>
        <ul className="text-sm text-teal-800 space-y-1 list-disc list-inside">
          <li><strong>Weight Unit:</strong> kg (kilograms) for metric, lb (pounds) for imperial, g (grams) for precision</li>
          <li><strong>Decimal Places:</strong> 0-5 digits after decimal point (2 typical: 1.25 kg, 3 for precision: 0.125 kg)</li>
          <li><strong>Stabilization Time:</strong> Wait time for weight to settle (300-1000ms typical, longer for sensitive scales)</li>
          <li><strong>Use Cases:</strong> Produce (2 decimals), Bulk foods (3 decimals), Jewelry (5 decimals)</li>
          <li><strong>Tare Function:</strong> Zero out container weight before weighing item (usually built into scale)</li>
        </ul>
      </div>

      {/* Common Configurations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Common Scale Configurations</h5>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Retail Produce Scale:</p>
            <p className="ml-2">Unit: kg or lb | Decimals: 2 | Stabilize: 500ms</p>
          </div>
          <div>
            <p className="font-semibold">Deli Counter Scale:</p>
            <p className="ml-2">Unit: g or lb | Decimals: 2 | Stabilize: 300ms</p>
          </div>
          <div>
            <p className="font-semibold">Bulk Food Scale:</p>
            <p className="ml-2">Unit: kg | Decimals: 3 | Stabilize: 700ms</p>
          </div>
          <div>
            <p className="font-semibold">Jewelry/Precision Scale:</p>
            <p className="ml-2">Unit: g | Decimals: 4-5 | Stabilize: 1000ms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleConfigComponent;
