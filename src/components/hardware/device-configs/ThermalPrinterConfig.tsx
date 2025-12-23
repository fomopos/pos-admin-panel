import React from 'react';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox
} from '../../ui';
import {
  THERMAL_PAPER_SIZES,
  CHARACTER_ENCODINGS
} from '../../../constants/hardwareOptions';
import type { ThermalPrinterConfig as ThermalConfig } from '../../../types/hardware-new.types';

interface ThermalPrinterConfigProps {
  config: ThermalConfig;
  onChange: (config: ThermalConfig) => void;
  errors?: Record<string, string>;
}

/**
 * ThermalPrinterConfig - Configuration form for thermal receipt printers
 * 
 * Handles thermal printer settings including:
 * - Paper size (58mm, 80mm)
 * - Print behavior (auto-print, copies, cut paper)
 * - Cash drawer integration
 * - Character encoding and print density
 * 
 * @example
 * ```tsx
 * <ThermalPrinterConfig
 *   config={device.device_config as ThermalPrinterConfig}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
const ThermalPrinterConfig: React.FC<ThermalPrinterConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof ThermalConfig, value: string | boolean | number | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Paper Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Paper Size"
          options={THERMAL_PAPER_SIZES}
          value={config.paper_size || 'thermal_80mm'}
          onSelect={(option) => option && handleFieldChange('paper_size', option.id)}
          placeholder="Select paper size"
          displayValue={(option) => option ? option.label : 'Select paper size'}
          error={errors['thermal_printer_config.paper_size']}
        />

        <DropdownSearch
          label="Character Encoding"
          options={CHARACTER_ENCODINGS}
          value={config.character_encoding || 'utf8'}
          onSelect={(option) => option && handleFieldChange('character_encoding', option.id)}
          placeholder="Select encoding"
          displayValue={(option) => option ? option.label : 'Select encoding'}
          error={errors['thermal_printer_config.character_encoding']}
        />
      </div>

      {/* Print Density and Charset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Print Density (0-255)"
          type="number"
          value={config.density?.toString() || ''}
          onChange={(value) => {
            const num = value ? parseInt(value) : null;
            if (num !== null && (num < 0 || num > 255)) return;
            handleFieldChange('density', num);
          }}
          placeholder="128"
          error={errors['thermal_printer_config.density']}
        />

        <InputTextField
          label="Character Set"
          value={config.charset || ''}
          onChange={(value) => handleFieldChange('charset', value || null)}
          placeholder="CP437 or PC850"
          error={errors['thermal_printer_config.charset']}
        />
      </div>

      {/* Receipt Printer Behaviors */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Print Behavior</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Auto Print"
            description="Automatically print receipts after transactions"
            checked={config.auto_print || false}
            onChange={(checked) => handleFieldChange('auto_print', checked)}
          />

          <PropertyCheckbox
            title="Cut Paper"
            description="Automatically cut paper after printing"
            checked={config.cut_paper || false}
            onChange={(checked) => handleFieldChange('cut_paper', checked)}
          />

          <PropertyCheckbox
            title="Open Cash Drawer"
            description="Open cash drawer after printing receipt"
            checked={config.open_drawer || false}
            onChange={(checked) => handleFieldChange('open_drawer', checked)}
          />

          <InputTextField
            label="Print Copies"
            type="number"
            value={config.print_copies?.toString() || '1'}
            onChange={(value) => handleFieldChange('print_copies', value ? parseInt(value) : 1)}
            placeholder="1"
            error={errors['thermal_printer_config.print_copies']}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Thermal Printer Configuration Notes</h5>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Paper Size:</strong> 80mm is standard for receipts, 58mm for compact printers</li>
          <li><strong>Density:</strong> Higher values (200-255) = darker print, lower (50-100) = lighter. Default: 128</li>
          <li><strong>Character Set:</strong> CP437 (USA), PC850 (Multilingual), PC858 (Euro), PC866 (Cyrillic)</li>
          <li><strong>Cut Paper:</strong> Requires printer with built-in cutter support</li>
          <li><strong>Cash Drawer:</strong> Uses standard ESC/POS kick-out command (requires cash drawer port)</li>
        </ul>
      </div>
    </div>
  );
};

export default ThermalPrinterConfig;
