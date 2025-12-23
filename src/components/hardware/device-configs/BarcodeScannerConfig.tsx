import React from 'react';
import type { BarcodeScannerConfig as ScannerConfig } from '../../../types/hardware-new.types';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox,
  MultipleDropdownSearch
} from '../../ui';
import {
  SCAN_MODES,
  BARCODE_DECODE_TYPES
} from '../../../constants/hardwareOptions';

interface BarcodeScannerConfigProps {
  config: ScannerConfig;
  onChange: (config: ScannerConfig) => void;
  errors?: Record<string, string>;
}

/**
 * BarcodeScannerConfig - Configuration form for barcode/QR code scanners
 * 
 * Handles barcode scanner settings including:
 * - Supported barcode symbologies (Code 128, EAN-13, QR, etc.)
 * - Scan mode (trigger, continuous, presentation)
 * - Prefix/suffix for scanned data
 * - Barcode length validation
 * - Beep and feedback settings
 * 
 * Supports handheld scanners, presentation scanners, and fixed-mount scanners
 * via USB, Bluetooth, Serial, or AIDL connections.
 * 
 * @example
 * ```tsx
 * <BarcodeScannerConfig
 *   config={device.device_config as BarcodeScannerConfig}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
const BarcodeScannerConfig: React.FC<BarcodeScannerConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof ScannerConfig, value: string | boolean | number | string[] | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Scan Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Scan Mode"
          options={SCAN_MODES}
          value={config.scan_mode || 'trigger'}
          onSelect={(option) => option && handleFieldChange('scan_mode', option.id)}
          placeholder="Select scan mode"
          displayValue={(option) => option ? option.label : 'Select scan mode'}
          error={errors['barcode_scanner_config.scan_mode']}
        />

        {config.scan_mode === 'continuous' && (
          <InputTextField
            label="Scan Interval (ms)"
            type="number"
            value={config.continuous_scan_interval_ms?.toString() || ''}
            onChange={(value) => handleFieldChange('continuous_scan_interval_ms', value ? parseInt(value) : null)}
            placeholder="500"
            error={errors['barcode_scanner_config.continuous_scan_interval_ms']}
          />
        )}
      </div>

      {/* Supported Barcode Types */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Barcode Symbologies</h4>
        <MultipleDropdownSearch
          label="Supported Barcode Types"
          options={BARCODE_DECODE_TYPES}
          values={config.decode_types || []}
          onSelect={(values: string[]) => handleFieldChange('decode_types', values.length > 0 ? values : null)}
          placeholder="Select supported barcode types"
          error={errors['barcode_scanner_config.decode_types']}
        />
        <p className="text-sm text-gray-500 mt-2">
          Select which barcode formats this scanner should decode
        </p>
      </div>

      {/* Data Formatting */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Data Formatting</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Prefix"
            value={config.prefix || ''}
            onChange={(value) => handleFieldChange('prefix', value || null)}
            placeholder="Optional prefix (e.g., 'SKU:')"
            error={errors['barcode_scanner_config.prefix']}
          />

          <InputTextField
            label="Suffix"
            value={config.suffix || ''}
            onChange={(value) => handleFieldChange('suffix', value || null)}
            placeholder="Optional suffix (e.g., '\\n' or '\\t')"
            error={errors['barcode_scanner_config.suffix']}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Prefix/suffix are added to scanned data. Use \\n for newline, \\t for tab, \\r for carriage return
        </p>
      </div>

      {/* Length Validation */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Length Validation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Minimum Length"
            type="number"
            value={config.min_length?.toString() || ''}
            onChange={(value) => handleFieldChange('min_length', value ? parseInt(value) : null)}
            placeholder="1"
            error={errors['barcode_scanner_config.min_length']}
          />

          <InputTextField
            label="Maximum Length"
            type="number"
            value={config.max_length?.toString() || ''}
            onChange={(value) => handleFieldChange('max_length', value ? parseInt(value) : null)}
            placeholder="255"
            error={errors['barcode_scanner_config.max_length']}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Reject barcodes outside this length range (leave empty for no limits)
        </p>
      </div>

      {/* Feedback Settings */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Feedback</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Beep on Scan"
            description="Play audio beep when barcode is successfully scanned"
            checked={config.beep_on_scan || false}
            onChange={(checked) => handleFieldChange('beep_on_scan', checked)}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-green-900 mb-2">Barcode Scanner Configuration Notes</h5>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li><strong>Scan Mode:</strong> Trigger (button press), Continuous (auto-scan), Presentation (auto-detect)</li>
          <li><strong>Symbologies:</strong> Enable only needed types for faster scanning (Code 128 and EAN-13 most common)</li>
          <li><strong>Prefix/Suffix:</strong> Add identifiers or formatting (e.g., prefix "SKU:" makes "SKU:12345")</li>
          <li><strong>Length Validation:</strong> Reject invalid scans (e.g., EAN-13 is always 13 digits)</li>
          <li><strong>Continuous Mode:</strong> Set interval to balance speed vs CPU usage (300-1000ms typical)</li>
          <li><strong>Common Formats:</strong> Code 128 (inventory), EAN-13/UPC-A (retail), QR Code (multi-purpose)</li>
        </ul>
      </div>

      {/* Format Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Common Barcode Use Cases</h5>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Retail Product Scanning:</p>
            <p className="ml-2">Symbologies: EAN-13, UPC-A | Mode: Trigger | Suffix: \\n</p>
          </div>
          <div>
            <p className="font-semibold">Warehouse Inventory:</p>
            <p className="ml-2">Symbologies: Code 128, Code 39 | Mode: Trigger | Length: 8-20</p>
          </div>
          <div>
            <p className="font-semibold">QR Code Tickets:</p>
            <p className="ml-2">Symbologies: QR Code | Mode: Presentation | Beep: Yes</p>
          </div>
          <div>
            <p className="font-semibold">Document Tracking:</p>
            <p className="ml-2">Symbologies: Code 128, PDF417, Data Matrix | Mode: Trigger</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerConfig;
