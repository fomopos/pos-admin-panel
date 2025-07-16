import React from 'react';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox
} from '../../ui';
import {
  LABEL_PRINTER_MODELS,
  LABEL_SIZES,
  PRINT_DENSITIES,
  PRINT_SPEEDS
} from '../../../types/hardware-api';
import type { LabelPrinterConfig } from '../../../types/hardware-api';

interface LabelPrinterConfigProps {
  config: Partial<LabelPrinterConfig>;
  onFieldChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  characterEncodingOptions: { id: string; label: string; value: string; }[];
  connectionType: string;
}

const LabelPrinterConfigComponent: React.FC<LabelPrinterConfigProps> = ({
  config,
  onFieldChange,
  characterEncodingOptions,
  connectionType
}) => {
  return (
    <div className="space-y-6">
      {/* Printer Model */}
      <DropdownSearch
        label="Label Printer Model"
        options={LABEL_PRINTER_MODELS}
        value={config.printer_model || ''}
        onSelect={(option) => option && onFieldChange('printer_model', option.id)}
        placeholder="Select label printer model"
        displayValue={(option) => option ? (
          <div className="flex items-center gap-2">
            <span>{option.label}</span>
          </div>
        ) : 'Select label printer model'}
      />

      {/* Label Size */}
      <DropdownSearch
        label="Label Size"
        options={LABEL_SIZES}
        value={config.label_size || '62x100mm'}
        onSelect={(option) => option && onFieldChange('label_size', option.id)}
        placeholder="Select label size"
        required
      />

      {/* Network Settings */}
      {connectionType === 'network' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="IP Address"
            value={config.ip_address || ''}
            onChange={(value) => onFieldChange('ip_address', value)}
            placeholder="192.168.1.103"
            required
          />
          <InputTextField
            label="Port"
            type="number"
            value={config.port?.toString() || '9100'}
            onChange={(value) => onFieldChange('port', parseInt(value) || 9100)}
            placeholder="9100"
            required
          />
        </div>
      )}

      {/* Print Quality Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Print Density"
          options={PRINT_DENSITIES}
          value={config.print_density || '203dpi'}
          onSelect={(option) => option && onFieldChange('print_density', option.id)}
          placeholder="Select print density"
          required
        />
        <DropdownSearch
          label="Print Speed"
          options={PRINT_SPEEDS}
          value={config.print_speed || '100mm/s'}
          onSelect={(option) => option && onFieldChange('print_speed', option.id)}
          placeholder="Select print speed"
          required
        />
      </div>

      {/* Character Encoding */}
      <DropdownSearch
        label="Character Encoding"
        options={characterEncodingOptions}
        value={config.character_encoding || 'utf8'}
        onSelect={(option) => option && onFieldChange('character_encoding', option.id)}
        placeholder="Select character encoding"
        required
      />

      {/* Label Printer Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PropertyCheckbox
          title="Auto Cut"
          description="Automatically cut labels after printing"
          checked={config.auto_cut ?? true}
          onChange={(checked) => onFieldChange('auto_cut', checked)}
        />
        <PropertyCheckbox
          title="Calibration Enabled"
          description="Enable automatic label calibration"
          checked={config.calibration_enabled ?? true}
          onChange={(checked) => onFieldChange('calibration_enabled', checked)}
        />
        <InputTextField
          label="Print Copies"
          type="number"
          value={config.print_copies?.toString() || '1'}
          onChange={(value) => onFieldChange('print_copies', parseInt(value) || 1)}
          placeholder="1"
          required
        />
      </div>
    </div>
  );
};

export default LabelPrinterConfigComponent;
