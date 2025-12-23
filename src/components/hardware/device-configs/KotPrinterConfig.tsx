import React from 'react';
import type { KotPrinterConfig as KOTConfig } from '../../../types/hardware-new.types';
import {
  DropdownSearch,
  PropertyCheckbox,
  MultipleDropdownSearch
} from '../../ui';
import {
  THERMAL_PAPER_SIZES,
  CHARACTER_ENCODINGS,
  KITCHEN_SECTIONS
} from '../../../constants/hardwareOptions';

interface KotPrinterConfigProps {
  config: KOTConfig;
  onChange: (config: KOTConfig) => void;
  errors?: Record<string, string>;
}

/**
 * KotPrinterConfig - Configuration form for Kitchen Order Ticket printers
 * 
 * Handles KOT printer settings including:
 * - Paper size (58mm, 80mm)
 * - Print content options (header, timestamp, order number, table info)
 * - Auto-cut behavior
 * - Kitchen sections assignment (for routing orders)
 * - Character encoding
 * 
 * KOT printers are used in restaurant kitchens to print order tickets
 * for preparation staff. They can be assigned to specific kitchen sections
 * (e.g., hot kitchen, cold kitchen, bar, grill).
 * 
 * @example
 * ```tsx
 * <KotPrinterConfig
 *   config={device.device_config as KotPrinterConfig}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
const KotPrinterConfig: React.FC<KotPrinterConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof KOTConfig, value: string | boolean | number | string[] | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Paper Size and Encoding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Paper Size"
          options={THERMAL_PAPER_SIZES}
          value={config.paper_size || 'thermal_80mm'}
          onSelect={(option) => option && handleFieldChange('paper_size', option.id)}
          placeholder="Select paper size"
          displayValue={(option) => option ? option.label : 'Select paper size'}
          error={errors['kot_printer_config.paper_size']}
        />

        <DropdownSearch
          label="Character Encoding"
          options={CHARACTER_ENCODINGS}
          value={config.character_encoding || 'utf8'}
          onSelect={(option) => option && handleFieldChange('character_encoding', option.id)}
          placeholder="Select encoding"
          displayValue={(option) => option ? option.label : 'Select encoding'}
          error={errors['kot_printer_config.character_encoding']}
        />
      </div>

      {/* Kitchen Sections */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Kitchen Assignment</h4>
        <MultipleDropdownSearch
          label="Kitchen Sections"
          options={KITCHEN_SECTIONS}
          values={config.kitchen_sections || []}
          onSelect={(values: string[]) => handleFieldChange('kitchen_sections', values.length > 0 ? values : null)}
          placeholder="Select kitchen sections"
          error={errors['kot_printer_config.kitchen_sections']}
        />
        <p className="text-sm text-gray-500 mt-2">
          Orders containing items from these sections will print to this KOT printer
        </p>
      </div>

      {/* Print Content Options */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Print Content</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Print Header"
            description="Include restaurant name and info"
            checked={config.print_header || false}
            onChange={(checked) => handleFieldChange('print_header', checked)}
          />

          <PropertyCheckbox
            title="Print Timestamp"
            description="Include order time on ticket"
            checked={config.print_timestamp || false}
            onChange={(checked) => handleFieldChange('print_timestamp', checked)}
          />

          <PropertyCheckbox
            title="Print Order Number"
            description="Show order/ticket number"
            checked={config.print_order_number || false}
            onChange={(checked) => handleFieldChange('print_order_number', checked)}
          />

          <PropertyCheckbox
            title="Print Table Info"
            description="Include table number/name"
            checked={config.print_table_info || false}
            onChange={(checked) => handleFieldChange('print_table_info', checked)}
          />

          <PropertyCheckbox
            title="Auto Cut Paper"
            description="Automatically cut paper after printing"
            checked={config.auto_cut || false}
            onChange={(checked) => handleFieldChange('auto_cut', checked)}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-purple-900 mb-2">KOT Printer Configuration Notes</h5>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li><strong>Kitchen Sections:</strong> Assign this printer to one or more kitchen areas (e.g., Hot Kitchen, Bar)</li>
          <li><strong>Order Routing:</strong> Orders with items from assigned sections will automatically print here</li>
          <li><strong>Multiple Printers:</strong> One order can print to multiple KOT printers if items span sections</li>
          <li><strong>Paper Size:</strong> 58mm for compact stations, 80mm for main kitchen printers</li>
          <li><strong>Header Info:</strong> Useful for identifying which restaurant/location in multi-site setups</li>
          <li><strong>Table Info:</strong> Critical for dine-in orders to match tickets with tables</li>
        </ul>
      </div>
    </div>
  );
};

export default KotPrinterConfig;
