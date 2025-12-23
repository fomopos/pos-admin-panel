import React from 'react';
import type { NetworkPrinterConfig as NetworkConfig } from '../../../types/hardware-new.types';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox,
  MultipleDropdownSearch
} from '../../ui';
import { NETWORK_PAPER_SIZES } from '../../../constants/hardwareOptions';

interface NetworkPrinterConfigProps {
  config: NetworkConfig;
  onChange: (config: NetworkConfig) => void;
  errors?: Record<string, string>;
}

// Paper orientation options
const PAPER_ORIENTATIONS = [
  { id: 'portrait', label: 'Portrait', value: 'portrait' },
  { id: 'landscape', label: 'Landscape', value: 'landscape' }
];

// Print quality options
const PRINT_QUALITY_OPTIONS = [
  { id: 'draft', label: 'Draft', value: 'draft', description: 'Fast, lower quality' },
  { id: 'normal', label: 'Normal', value: 'normal', description: 'Standard quality' },
  { id: 'high', label: 'High', value: 'high', description: 'Best quality' },
  { id: 'photo', label: 'Photo', value: 'photo', description: 'Photo-quality printing' }
];

// Color mode options
const COLOR_MODE_OPTIONS = [
  { id: 'color', label: 'Color', value: 'color', description: 'Full color printing' },
  { id: 'monochrome', label: 'Monochrome', value: 'monochrome', description: 'Black and white only' },
  { id: 'grayscale', label: 'Grayscale', value: 'grayscale', description: 'Shades of gray' }
];

// Document format options
const DOCUMENT_FORMATS = [
  { id: 'pdf', label: 'PDF', value: 'pdf' },
  { id: 'docx', label: 'Word (DOCX)', value: 'docx' },
  { id: 'txt', label: 'Text (TXT)', value: 'txt' },
  { id: 'html', label: 'HTML', value: 'html' },
  { id: 'rtf', label: 'Rich Text (RTF)', value: 'rtf' },
  { id: 'odt', label: 'OpenDocument (ODT)', value: 'odt' }
];

/**
 * NetworkPrinterConfig - Configuration form for office network printers
 * 
 * Handles standard office printer settings including:
 * - Paper size and orientation (A4, Letter, Legal, etc.)
 * - Print quality and color mode
 * - Duplex (double-sided) printing
 * - Document format support
 * - Tray capacity and resolution
 * 
 * Used for laser printers, inkjet printers, and multifunction devices
 * that use IPP, LPD, or RAW protocols over the network.
 * 
 * @example
 * ```tsx
 * <NetworkPrinterConfig
 *   config={device.device_config as NetworkPrinterConfig}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
const NetworkPrinterConfig: React.FC<NetworkPrinterConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof NetworkConfig, value: string | boolean | number | string[] | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };
  return (
    <div className="space-y-6">
      {/* Paper Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Paper Size"
          options={NETWORK_PAPER_SIZES}
          value={config.paper_size || 'A4'}
          onSelect={(option) => option && handleFieldChange('paper_size', option.id)}
          placeholder="Select paper size"
          displayValue={(option) => option ? option.label : 'Select paper size'}
          error={errors['network_printer_config.paper_size']}
        />

        <DropdownSearch
          label="Paper Orientation"
          options={PAPER_ORIENTATIONS}
          value={config.paper_orientation || 'portrait'}
          onSelect={(option) => option && handleFieldChange('paper_orientation', option.id)}
          placeholder="Select orientation"
          displayValue={(option) => option ? option.label : 'Select orientation'}
          error={errors['network_printer_config.paper_orientation']}
        />
      </div>

      {/* Print Quality and Color */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Print Quality"
          options={PRINT_QUALITY_OPTIONS}
          value={config.print_quality || 'normal'}
          onSelect={(option) => option && handleFieldChange('print_quality', option.id)}
          placeholder="Select print quality"
          displayValue={(option) => option ? option.label : 'Select print quality'}
          error={errors['network_printer_config.print_quality']}
        />

        <DropdownSearch
          label="Color Mode"
          options={COLOR_MODE_OPTIONS}
          value={config.color_mode || 'monochrome'}
          onSelect={(option) => option && handleFieldChange('color_mode', option.id)}
          placeholder="Select color mode"
          displayValue={(option) => option ? option.label : 'Select color mode'}
          error={errors['network_printer_config.color_mode']}
        />
      </div>

      {/* Supported Document Formats */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Document Support</h4>
        <MultipleDropdownSearch
          label="Supported Formats"
          options={DOCUMENT_FORMATS}
          values={config.supported_formats || []}
          onSelect={(values: string[]) => handleFieldChange('supported_formats', values.length > 0 ? values : null)}
          placeholder="Select supported formats"
          error={errors['network_printer_config.supported_formats']}
        />
      </div>

      {/* Printer Settings */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Printer Behavior</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Duplex Printing"
            description="Enable double-sided (duplex) printing"
            checked={config.duplex_printing || false}
            onChange={(checked) => handleFieldChange('duplex_printing', checked)}
          />

          <InputTextField
            label="Print Copies"
            type="number"
            value={config.print_copies?.toString() || '1'}
            onChange={(value) => handleFieldChange('print_copies', value ? parseInt(value) : 1)}
            placeholder="1"
            error={errors['network_printer_config.print_copies']}
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Maximum Resolution"
            value={config.max_resolution || ''}
            onChange={(value) => handleFieldChange('max_resolution', value || null)}
            placeholder="1200x1200 dpi"
            error={errors['network_printer_config.max_resolution']}
          />

          <InputTextField
            label="Paper Tray Capacity"
            type="number"
            value={config.tray_capacity?.toString() || ''}
            onChange={(value) => handleFieldChange('tray_capacity', value ? parseInt(value) : null)}
            placeholder="250"
            error={errors['network_printer_config.tray_capacity']}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Network Printer Configuration Notes</h5>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Paper Size:</strong> A4 (210×297mm) for international, Letter (8.5×11") for US</li>
          <li><strong>Print Quality:</strong> Draft for fast printing, Photo for high-quality images</li>
          <li><strong>Color Mode:</strong> Monochrome saves toner/ink, use Color only when needed</li>
          <li><strong>Duplex:</strong> Double-sided printing saves paper (requires printer support)</li>
          <li><strong>Formats:</strong> Select document types this printer can handle (PDF, Word, etc.)</li>
          <li><strong>Resolution:</strong> Higher DPI = better quality but slower (600-1200 typical, 2400+ for photos)</li>
        </ul>
      </div>
    </div>
  );
};

export default NetworkPrinterConfig;
