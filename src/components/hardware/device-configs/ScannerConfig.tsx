import React from 'react';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox
} from '../../ui';
import {
  SCANNER_MODELS,
  BARCODE_DECODE_TYPES
} from '../../../types/hardware-api';
import type { BarcodeScannerConfig, HardwareOption, BarcodeDecodeType } from '../../../types/hardware-api';

interface ScannerConfigProps {
  config: Partial<BarcodeScannerConfig>;
  onFieldChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

// Scan Mode Options
const SCAN_MODE_OPTIONS: HardwareOption[] = [
  { id: 'manual', label: 'Manual', value: 'manual' },
  { id: 'automatic', label: 'Automatic', value: 'automatic' }
];

const ScannerConfig: React.FC<ScannerConfigProps> = ({
  config,
  onFieldChange
}) => {
  const handleDecodeTypeChange = (checked: boolean, decodeType: string) => {
    const currentTypes = config.decode_types || [];
    if (checked) {
      if (!currentTypes.includes(decodeType as BarcodeDecodeType)) {
        onFieldChange('decode_types', [...currentTypes, decodeType]);
      }
    } else {
      onFieldChange('decode_types', currentTypes.filter((type: BarcodeDecodeType) => type !== decodeType));
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Model */}
      <DropdownSearch
        label="Scanner Model"
        options={SCANNER_MODELS}
        value={config.scanner_model || ''}
        onSelect={(option) => option && onFieldChange('scanner_model', option.id)}
        placeholder="Select scanner model"
        displayValue={(option) => option ? (
          <div className="flex items-center gap-2">
            <span>{option.label}</span>
          </div>
        ) : 'Select scanner model'}
      />

      {/* Scan Mode */}
      <DropdownSearch
        label="Scan Mode"
        options={SCAN_MODE_OPTIONS}
        value={config.scan_mode || 'manual'}
        onSelect={(option) => option && onFieldChange('scan_mode', option.id)}
        placeholder="Select scan mode"
        required
      />

      {/* Prefix and Suffix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Prefix"
          value={config.prefix || ''}
          onChange={(value) => onFieldChange('prefix', value)}
          placeholder="Enter prefix"
        />
        <InputTextField
          label="Suffix"
          value={config.suffix || ''}
          onChange={(value) => onFieldChange('suffix', value)}
          placeholder="Enter suffix"
        />
      </div>

      {/* Length Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Minimum Length"
          type="number"
          value={config.min_length?.toString() || '1'}
          onChange={(value) => onFieldChange('min_length', parseInt(value) || 1)}
          placeholder="1"
          required
        />
        <InputTextField
          label="Maximum Length"
          type="number"
          value={config.max_length?.toString() || '50'}
          onChange={(value) => onFieldChange('max_length', parseInt(value) || 50)}
          placeholder="50"
          required
        />
      </div>

      {/* Scanner Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PropertyCheckbox
          title="Beep on Scan"
          description="Play beep sound on successful scan"
          checked={config.beep_on_scan ?? true}
          onChange={(checked) => onFieldChange('beep_on_scan', checked)}
        />
      </div>

      {/* Decode Types */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Supported Barcode Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BARCODE_DECODE_TYPES.map((decodeType) => (
            <PropertyCheckbox
              key={decodeType.id}
              title={decodeType.label}
              description={`Enable ${decodeType.label} scanning`}
              checked={config.decode_types?.includes(decodeType.id as BarcodeDecodeType) ?? false}
              onChange={(checked) => handleDecodeTypeChange(checked, decodeType.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScannerConfig;
