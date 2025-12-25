/**
 * USB Configuration Form Component
 * 
 * Form component for configuring USB hardware devices.
 * Simplified per new API spec.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { InputTextField } from '../../ui';
import type { USBConfig } from '../../../types/hardware.types';

interface USBConfigFormProps {
  config: Partial<USBConfig>;
  onChange: (config: USBConfig) => void;
  errors?: Record<string, string>;
}

/**
 * USBConfigForm - Configuration form for USB connections
 * 
 * @example
 * ```tsx
 * <USBConfigForm
 *   config={{ vendor_id: 1234, product_id: 5678 }}
 *   onChange={(newConfig) => handleConnectionConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const USBConfigForm: React.FC<USBConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = (field: keyof USBConfig, value: number | string | undefined) => {
    onChange({
      vendor_id: config.vendor_id || 0,
      product_id: config.product_id || 0,
      usb_path: config.usb_path,
      [field]: value
    });
  };

  // Helper to format hex value for display
  const formatHex = (value: number | undefined): string => {
    if (value === undefined || value === 0) return '';
    return '0x' + value.toString(16).toUpperCase().padStart(4, '0');
  };

  // Helper to parse hex input
  const parseHex = (value: string): number => {
    if (!value) return 0;
    const hex = value.replace('0x', '').replace('0X', '');
    const decimal = parseInt(hex, 16);
    return isNaN(decimal) ? 0 : decimal;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Vendor ID"
          value={formatHex(config.vendor_id)}
          onChange={(value) => handleFieldChange('vendor_id', parseHex(value))}
          placeholder="0x04B8 (Epson)"
          required
          error={errors['usb_config.vendor_id']}
          helperText="USB Vendor ID in hex format"
        />

        <InputTextField
          label="Product ID"
          value={formatHex(config.product_id)}
          onChange={(value) => handleFieldChange('product_id', parseHex(value))}
          placeholder="0x0202"
          required
          error={errors['usb_config.product_id']}
          helperText="USB Product ID in hex format"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <InputTextField
          label="USB Device Path"
          value={config.usb_path || ''}
          onChange={(value) => handleFieldChange('usb_path', value || undefined)}
          placeholder="/dev/usb/lp0"
          error={errors['usb_config.usb_path']}
          helperText="Optional platform-specific USB device path"
        />
      </div>
    </div>
  );
};

export default USBConfigForm;
