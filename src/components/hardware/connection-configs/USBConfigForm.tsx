import React from 'react';
import type { USBConfig } from '../../../types/hardware-new.types';
import { InputTextField } from '../../ui';

interface USBConfigFormProps {
  config: USBConfig;
  onChange: (config: USBConfig) => void;
  errors?: Record<string, string>;
}

/**
 * USBConfigForm - Configuration form for USB/HID connections
 * 
 * Handles USB device settings including:
 * - Vendor ID and Product ID (required for device identification)
 * - USB device path (platform-specific)
 * - HID usage page and usage (for HID devices)
 * 
 * @example
 * ```tsx
 * <USBConfigForm
 *   config={device.connection_config as USBConfig}
 *   onChange={(newConfig) => handleConnectionConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const USBConfigForm: React.FC<USBConfigFormProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof USBConfig, value: string | number | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* USB Identifiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Vendor ID (hex)"
          value={config.vendor_id ? '0x' + config.vendor_id.toString(16).toUpperCase().padStart(4, '0') : ''}
          onChange={(value) => {
            if (value) {
              const hex = value.replace('0x', '').replace('0X', '');
              const decimal = parseInt(hex, 16);
              handleFieldChange('vendor_id', isNaN(decimal) ? null : decimal);
            } else {
              handleFieldChange('vendor_id', null);
            }
          }}
          placeholder="0x04B8 (Epson)"
          error={errors['usb_config.vendor_id']}
          required
        />

        <InputTextField
          label="Product ID (hex)"
          value={config.product_id ? '0x' + config.product_id.toString(16).toUpperCase().padStart(4, '0') : ''}
          onChange={(value) => {
            if (value) {
              const hex = value.replace('0x', '').replace('0X', '');
              const decimal = parseInt(hex, 16);
              handleFieldChange('product_id', isNaN(decimal) ? null : decimal);
            } else {
              handleFieldChange('product_id', null);
            }
          }}
          placeholder="0x0202"
          error={errors['usb_config.product_id']}
          required
        />
      </div>

      {/* USB Path */}
      <div className="grid grid-cols-1 gap-6">
        <InputTextField
          label="USB Device Path"
          value={config.usb_path || ''}
          onChange={(value) => handleFieldChange('usb_path', value || null)}
          placeholder="/dev/usb/lp0 or \\?\usb#vid_04b8&pid_0202"
          error={errors['usb_config.usb_path']}
        />
      </div>

      {/* HID Settings */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">HID Settings (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="HID Usage Page (hex)"
            value={config.usage_page ? '0x' + config.usage_page.toString(16).toUpperCase().padStart(4, '0') : ''}
            onChange={(value) => {
              if (value) {
                const hex = value.replace('0x', '').replace('0X', '');
                const decimal = parseInt(hex, 16);
                handleFieldChange('usage_page', isNaN(decimal) ? null : decimal);
              } else {
                handleFieldChange('usage_page', null);
              }
            }}
            placeholder="0x008C (Barcode Scanner)"
            error={errors['usb_config.usage_page']}
          />

          <InputTextField
            label="HID Usage (hex)"
            value={config.usage ? '0x' + config.usage.toString(16).toUpperCase().padStart(4, '0') : ''}
            onChange={(value) => {
              if (value) {
                const hex = value.replace('0x', '').replace('0X', '');
                const decimal = parseInt(hex, 16);
                handleFieldChange('usage', isNaN(decimal) ? null : decimal);
              } else {
                handleFieldChange('usage', null);
              }
            }}
            placeholder="0x0002"
            error={errors['usb_config.usage']}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Finding USB Device Information</h5>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Windows:</strong> Device Manager → View → Devices by Connection → USB Root Hub → Properties → Hardware IDs</li>
          <li><strong>macOS:</strong> System Information → Hardware → USB → Select device → Product ID / Vendor ID</li>
          <li><strong>Linux:</strong> Run <code className="bg-blue-100 px-1 rounded">lsusb -v</code> in terminal</li>
          <li><strong>Android:</strong> Use USB Host Diagnostics app from Play Store</li>
        </ul>
      </div>
    </div>
  );
};
