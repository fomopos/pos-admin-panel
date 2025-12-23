import React from 'react';
import type { LabelPrinterConfig as LabelConfig } from '../../../types/hardware-new.types';
import {
  InputTextField,
  PropertyCheckbox,
  MultipleDropdownSearch
} from '../../ui';

interface LabelPrinterConfigProps {
  config: LabelConfig;
  onChange: (config: LabelConfig) => void;
  errors?: Record<string, string>;
}

// Label width options in mm
const LABEL_WIDTH_OPTIONS = [
  { id: '25', label: '25mm', value: '25' },
  { id: '32', label: '32mm', value: '32' },
  { id: '40', label: '40mm', value: '40' },
  { id: '50', label: '50mm', value: '50' },
  { id: '58', label: '58mm', value: '58' },
  { id: '62', label: '62mm', value: '62' },
  { id: '76', label: '76mm', value: '76' },
  { id: '102', label: '102mm (4")', value: '102' },
  { id: '110', label: '110mm', value: '110' }
];

/**
 * LabelPrinterConfig - Configuration form for label printers
 * 
 * Handles label printer settings including:
 * - Supported label widths (25mm to 110mm)
 * - Maximum label length
 * - ZPL support (Zebra Programming Language)
 * 
 * Label printers are used for shipping labels, product labels, barcode labels,
 * price tags, and inventory labels. Common brands: Zebra, Dymo, Brother.
 * 
 * @example
 * ```tsx
 * <LabelPrinterConfig
 *   config={device.device_config as LabelPrinterConfig}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
const LabelPrinterConfigComponent: React.FC<LabelPrinterConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof LabelConfig, value: boolean | number | number[] | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };
  return (
    <div className="space-y-6">
      {/* Supported Label Widths */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Label Dimensions</h4>
        <MultipleDropdownSearch
          label="Supported Label Widths (mm)"
          options={LABEL_WIDTH_OPTIONS}
          values={(config.supported_label_widths || []).map(w => w.toString())}
          onSelect={(values: string[]) => {
            const widths = values.map(v => parseInt(v)).filter(n => !isNaN(n));
            handleFieldChange('supported_label_widths', widths.length > 0 ? widths : null);
          }}
          placeholder="Select supported label widths"
          error={errors['label_printer_config.supported_label_widths']}
        />
        <p className="text-sm text-gray-500 mt-2">
          Select all label widths this printer supports (typically 58mm, 62mm, 76mm, 102mm)
        </p>
      </div>

      {/* Maximum Label Length */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Maximum Label Length (mm)"
          type="number"
          value={config.max_length_mm?.toString() || ''}
          onChange={(value) => handleFieldChange('max_length_mm', value ? parseInt(value) : null)}
          placeholder="300"
          error={errors['label_printer_config.max_length_mm']}
        />
      </div>

      {/* ZPL Support */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Programming Language Support</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Supports ZPL"
            description="Zebra Programming Language (industry standard for label printing)"
            checked={config.supports_zpl || false}
            onChange={(checked) => handleFieldChange('supports_zpl', checked)}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-indigo-900 mb-2">Label Printer Configuration Notes</h5>
        <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
          <li><strong>Label Widths:</strong> Common sizes: 62mm (address labels), 102mm (4" shipping labels)</li>
          <li><strong>Max Length:</strong> Continuous label printers can print up to 300-1000mm length</li>
          <li><strong>ZPL Support:</strong> Enable for Zebra printers or ZPL-compatible devices (Dymo, Brother with ZPL emulation)</li>
          <li><strong>Use Cases:</strong> Shipping (102mm), Product labels (62mm), Price tags (58mm), Barcode labels (76mm)</li>
          <li><strong>Direct Thermal vs Transfer:</strong> Direct thermal (no ribbon), Thermal transfer (with ribbon, more durable)</li>
        </ul>
      </div>

      {/* Common Label Sizes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Common Label Printer Configurations</h5>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Zebra ZD420 (Desktop):</p>
            <p className="ml-2">Widths: 25, 32, 58, 76, 102mm | Max Length: 300mm | ZPL: Yes</p>
          </div>
          <div>
            <p className="font-semibold">Dymo LabelWriter 450:</p>
            <p className="ml-2">Widths: 19, 28, 36, 54, 62mm | Max Length: 300mm | ZPL: No (uses ESC/POS)</p>
          </div>
          <div>
            <p className="font-semibold">Brother QL-820NWB:</p>
            <p className="ml-2">Widths: 29, 38, 50, 62mm | Max Length: 1000mm | ZPL: Optional (with firmware)</p>
          </div>
          <div>
            <p className="font-semibold">Zebra ZT411 (Industrial):</p>
            <p className="ml-2">Widths: 25-170mm | Max Length: 991mm | ZPL: Yes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPrinterConfigComponent;
