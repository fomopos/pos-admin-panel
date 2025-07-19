import React from 'react';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox,
  MultipleDropdownSearch
} from '../../ui';
import {
  KITCHEN_PRINTER_MODELS,
  THERMAL_PAPER_SIZES,
  KITCHEN_SECTIONS
} from '../../../types/hardware-api';
import type { KotPrinterConfig as KitchenConfig, HardwareOption } from '../../../types/hardware-api';

interface KitchenPrinterConfigProps {
  config: Partial<KitchenConfig>;
  onFieldChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  characterEncodingOptions: HardwareOption[];
  connectionType: string;
}

const KitchenPrinterConfig: React.FC<KitchenPrinterConfigProps> = ({
  config,
  onFieldChange,
  errors,
  characterEncodingOptions,
  connectionType
}) => {
  return (
    <div className="space-y-6">
      {/* Printer Model */}
      <DropdownSearch
        label="Printer Model"
        options={KITCHEN_PRINTER_MODELS}
        value={config.printer_model || ''}
        onSelect={(option) => option && onFieldChange('printer_model', option.id)}
        placeholder="Select kitchen printer model"
        displayValue={(option) => option ? (
          <div className="flex items-center gap-2">
            <span>{option.label}</span>
          </div>
        ) : 'Select kitchen printer model'}
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
            placeholder="192.168.1.101"
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

      {/* Kitchen Sections */}
      <MultipleDropdownSearch
        label="Kitchen Sections"
        values={config.kitchen_sections || []}
        options={KITCHEN_SECTIONS}
        onSelect={(selectedValues) => onFieldChange('kitchen_sections', selectedValues)}
        placeholder="No sections selected"
        searchPlaceholder="Search kitchen sections..."
        allowSelectAll={true}
        selectAllLabel="Select All Sections"
        clearAllLabel="Clear All Sections"
        maxSelectedDisplay={3}
        displayValue={(selectedOptions) => 
          selectedOptions.length > 0 
            ? `${selectedOptions.length} section${selectedOptions.length > 1 ? 's' : ''} selected`
            : "No sections selected"
        }
        required
        error={errors.kitchen_sections}
      />

      {/* Kitchen Specific Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PropertyCheckbox
          title="Print Header"
          description="Print header information on kitchen tickets"
          checked={config.print_header ?? true}
          onChange={(checked) => onFieldChange('print_header', checked)}
        />
        <PropertyCheckbox
          title="Print Timestamp"
          description="Include timestamp on kitchen tickets"
          checked={config.print_timestamp ?? true}
          onChange={(checked) => onFieldChange('print_timestamp', checked)}
        />
        <PropertyCheckbox
          title="Print Order Number"
          description="Include order number on kitchen tickets"
          checked={config.print_order_number ?? true}
          onChange={(checked) => onFieldChange('print_order_number', checked)}
        />
        <PropertyCheckbox
          title="Print Table Info"
          description="Include table information on kitchen tickets"
          checked={config.print_table_info ?? true}
          onChange={(checked) => onFieldChange('print_table_info', checked)}
        />
        <PropertyCheckbox
          title="Auto Cut"
          description="Automatically cut paper after printing"
          checked={config.auto_cut ?? true}
          onChange={(checked) => onFieldChange('auto_cut', checked)}
        />
      </div>
    </div>
  );
};

export default KitchenPrinterConfig;
