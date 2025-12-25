/**
 * Scanner Configuration Form Component
 * 
 * Form for configuring barcode scanners.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { InputTextField, PropertyCheckbox } from '../../ui';
import type { ScannerConfig } from '../../../types/hardware.types';

interface ScannerConfigFormProps {
  config: Partial<ScannerConfig>;
  onChange: (config: ScannerConfig) => void;
  errors?: Record<string, string>;
}

/**
 * ScannerConfigForm - Configuration form for barcode scanners
 * 
 * @example
 * ```tsx
 * <ScannerConfigForm
 *   config={{ prefix: '', suffix: '\r\n', beep_on_scan: true }}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const ScannerConfigForm: React.FC<ScannerConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = <K extends keyof ScannerConfig>(
    field: K,
    value: ScannerConfig[K]
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
          label="Prefix"
          value={config.prefix || ''}
          onChange={(value) => handleFieldChange('prefix', value || undefined)}
          placeholder=""
          error={errors['scanner_config.prefix']}
          helperText="Characters to add before scanned data"
        />

        <InputTextField
          label="Suffix"
          value={config.suffix || ''}
          onChange={(value) => handleFieldChange('suffix', value || undefined)}
          placeholder="\r\n"
          error={errors['scanner_config.suffix']}
          helperText="Characters to add after scanned data (e.g., \r\n for Enter key)"
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Scanner Options</h4>
        <PropertyCheckbox
          title="Beep on Scan"
          description="Play a beep sound when a barcode is successfully scanned"
          checked={config.beep_on_scan || false}
          onChange={(checked) => handleFieldChange('beep_on_scan', checked)}
        />
      </div>
    </div>
  );
};

export default ScannerConfigForm;
