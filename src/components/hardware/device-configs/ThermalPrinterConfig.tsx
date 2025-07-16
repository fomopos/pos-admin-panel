import React from 'react';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox
} from '../../ui';
import {
  THERMAL_PRINTER_MODELS,
  THERMAL_PAPER_SIZES
} from '../../../types/hardware-api';
import type { ThermalPrinterConfig as ThermalConfig, HardwareOption } from '../../../types/hardware-api';

interface ThermalPrinterConfigProps {
  config: Partial<ThermalConfig>;
  onFieldChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  characterEncodingOptions: HardwareOption[];
  connectionType: string;
  showReceiptSettings?: boolean;
}

const ThermalPrinterConfig: React.FC<ThermalPrinterConfigProps> = ({
  config,
  onFieldChange,
  errors,
  characterEncodingOptions,
  connectionType,
  showReceiptSettings = true
}) => {
  return (
    <div className="space-y-6">
      {/* Printer Model */}
      <DropdownSearch
        label="Printer Model"
        options={THERMAL_PRINTER_MODELS}
        value={config.printer_model || ''}
        onSelect={(option) => option && onFieldChange('printer_model', option.id)}
        placeholder="Select printer model"
        displayValue={(option) => option ? (
          <div className="flex items-center gap-2">
            <span>{option.label}</span>
          </div>
        ) : 'Select printer model'}
      />

      {/* Paper Size */}
      <DropdownSearch
        label="Paper Size"
        options={THERMAL_PAPER_SIZES}
        value={config.paper_size || 'thermal_80mm'}
        onSelect={(option) => option && onFieldChange('paper_size', option.id)}
        placeholder="Select paper size"
        required
      />

      {/* Network Settings */}
      {connectionType === 'network' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="IP Address"
            value={config.ip_address || ''}
            onChange={(value) => onFieldChange('ip_address', value)}
            placeholder="192.168.1.100"
            required
            error={errors.ip_address}
          />
          <InputTextField
            label="Port"
            type="number"
            value={config.port?.toString() || '9100'}
            onChange={(value) => onFieldChange('port', parseInt(value) || 9100)}
            placeholder="9100"
            required
            error={errors.port}
          />
        </div>
      )}

      {/* Character Encoding */}
      <DropdownSearch
        label="Character Encoding"
        options={characterEncodingOptions}
        value={config.character_encoding || 'utf8'}
        onSelect={(option) => option && onFieldChange('character_encoding', option.id)}
        placeholder="Select character encoding"
        required
      />

      {/* Receipt Printer Settings */}
      {showReceiptSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Auto Print"
            description="Automatically print receipts after transactions"
            checked={config.auto_print ?? true}
            onChange={(checked) => onFieldChange('auto_print', checked)}
          />
          <PropertyCheckbox
            title="Cut Paper"
            description="Automatically cut paper after printing"
            checked={config.cut_paper ?? true}
            onChange={(checked) => onFieldChange('cut_paper', checked)}
          />
          <PropertyCheckbox
            title="Open Drawer"
            description="Open cash drawer after printing"
            checked={config.open_drawer ?? false}
            onChange={(checked) => onFieldChange('open_drawer', checked)}
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
      )}
    </div>
  );
};

export default ThermalPrinterConfig;
