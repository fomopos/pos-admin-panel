import React from 'react';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox
} from '../../ui';
import type { NetworkPrinterConfig as NetworkConfig, HardwareOption } from '../../../types/hardware-api';

interface NetworkPrinterConfigProps {
  config: Partial<NetworkConfig>;
  onFieldChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  characterEncodingOptions: HardwareOption[];
}

const NetworkPrinterConfig: React.FC<NetworkPrinterConfigProps> = ({
  config,
  onFieldChange,
  errors,
  characterEncodingOptions
}) => {
  return (
    <div className="space-y-6">
      {/* Network Printer Model */}
      <DropdownSearch
        label="Printer Model"
        options={[
          { id: 'hp_laserjet_pro_m404dn', label: 'HP LaserJet Pro M404dn' },
          { id: 'canon_pixma_g7020', label: 'Canon PIXMA G7020' },
          { id: 'epson_workforce_pro', label: 'Epson WorkForce Pro' }
        ]}
        value={config.printer_model || ''}
        onSelect={(option) => option && onFieldChange('printer_model', option.id)}
        placeholder="Select network printer model"
        displayValue={(option) => option ? (
          <div className="flex items-center gap-2">
            <span>{option.label}</span>
          </div>
        ) : 'Select network printer model'}
      />

      {/* Network Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="IP Address"
          value={config.ip_address || ''}
          onChange={(value) => onFieldChange('ip_address', value)}
          placeholder="192.168.1.102"
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

      {/* Paper Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Paper Size"
          options={[
            { id: 'A4', label: 'A4' },
            { id: 'A5', label: 'A5' },
            { id: 'Letter', label: 'Letter' },
            { id: 'Legal', label: 'Legal' },
            { id: 'A3', label: 'A3' }
          ]}
          value={config.paper_size || 'A4'}
          onSelect={(option) => option && onFieldChange('paper_size', option.id)}
          placeholder="Select paper size"
          required
        />
        <DropdownSearch
          label="Paper Orientation"
          options={[
            { id: 'portrait', label: 'Portrait' },
            { id: 'landscape', label: 'Landscape' }
          ]}
          value={config.paper_orientation || 'portrait'}
          onSelect={(option) => option && onFieldChange('paper_orientation', option.id)}
          placeholder="Select orientation"
          required
        />
      </div>

      {/* Print Quality and Color */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Print Quality"
          options={[
            { id: 'draft', label: 'Draft' },
            { id: 'normal', label: 'Normal' },
            { id: 'high', label: 'High' },
            { id: 'photo', label: 'Photo' }
          ]}
          value={config.print_quality || 'normal'}
          onSelect={(option) => option && onFieldChange('print_quality', option.id)}
          placeholder="Select print quality"
          required
        />
        <DropdownSearch
          label="Color Mode"
          options={[
            { id: 'color', label: 'Color' },
            { id: 'monochrome', label: 'Monochrome' },
            { id: 'grayscale', label: 'Grayscale' }
          ]}
          value={config.color_mode || 'monochrome'}
          onSelect={(option) => option && onFieldChange('color_mode', option.id)}
          placeholder="Select color mode"
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

      {/* Network Printer Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PropertyCheckbox
          title="Duplex Printing"
          description="Enable double-sided printing"
          checked={config.duplex_printing ?? false}
          onChange={(checked) => onFieldChange('duplex_printing', checked)}
        />
        <PropertyCheckbox
          title="Auto Paper Detection"
          description="Automatically detect paper size and type"
          checked={config.auto_paper_detection ?? true}
          onChange={(checked) => onFieldChange('auto_paper_detection', checked)}
        />
      </div>

      {/* Advanced Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputTextField
          label="Print Copies"
          type="number"
          value={config.print_copies?.toString() || '1'}
          onChange={(value) => onFieldChange('print_copies', parseInt(value) || 1)}
          placeholder="1"
          required
        />
        <InputTextField
          label="Tray Capacity"
          type="number"
          value={config.tray_capacity?.toString() || '250'}
          onChange={(value) => onFieldChange('tray_capacity', parseInt(value) || 250)}
          placeholder="250"
          required
        />
        <InputTextField
          label="Max Resolution"
          value={config.max_resolution || '1200x1200 dpi'}
          onChange={(value) => onFieldChange('max_resolution', value)}
          placeholder="1200x1200 dpi"
          required
        />
      </div>
    </div>
  );
};

export default NetworkPrinterConfig;
