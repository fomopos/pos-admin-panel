import React from 'react';
import type { Capabilities } from '../../../types/hardware-new.types';
import {
  PropertyCheckbox,
  MultipleDropdownSearch,
  InputTextField
} from '../../ui';
import { BARCODE_DECODE_TYPES } from '../../../constants/hardwareOptions';

interface CapabilitiesConfigProps {
  config: Capabilities;
  onChange: (config: Capabilities) => void;
  errors?: Record<string, string>;
}

// Document/Image format options
const DOCUMENT_FORMATS = [
  { id: 'pdf', label: 'PDF', value: 'pdf' },
  { id: 'png', label: 'PNG', value: 'png' },
  { id: 'jpg', label: 'JPEG', value: 'jpg' },
  { id: 'bmp', label: 'BMP', value: 'bmp' },
  { id: 'gif', label: 'GIF', value: 'gif' },
  { id: 'tiff', label: 'TIFF', value: 'tiff' },
  { id: 'svg', label: 'SVG', value: 'svg' },
  { id: 'txt', label: 'Text', value: 'txt' },
  { id: 'html', label: 'HTML', value: 'html' }
];

/**
 * CapabilitiesConfig - Configuration form for device capabilities
 * 
 * Handles device feature flags and supported formats including:
 * - Functional capabilities (print, scan, payment, weigh, open drawer)
 * - Protocol support (ESC/POS, ZPL)
 * - Hardware features (cutter support)
 * - Supported document/image formats
 * - Supported barcode symbologies
 * - Maximum resolution
 * 
 * Capabilities define what a device can do, used for UI adaptation,
 * feature enablement, and workflow routing.
 * 
 * @example
 * ```tsx
 * <CapabilitiesConfig
 *   config={device.capabilities}
 *   onChange={(newCapabilities) => handleCapabilitiesChange(newCapabilities)}
 *   errors={validationErrors}
 * />
 * ```
 */
const CapabilitiesConfig: React.FC<CapabilitiesConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof Capabilities, value: boolean | string | string[] | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Core Capabilities */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Core Capabilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Can Print"
            description="Device has printing capability"
            checked={config.can_print || false}
            onChange={(checked) => handleFieldChange('can_print', checked)}
          />

          <PropertyCheckbox
            title="Can Scan"
            description="Device can scan barcodes/QR codes"
            checked={config.can_scan || false}
            onChange={(checked) => handleFieldChange('can_scan', checked)}
          />

          <PropertyCheckbox
            title="Can Accept Payment"
            description="Device can process card payments"
            checked={config.can_accept_payment || false}
            onChange={(checked) => handleFieldChange('can_accept_payment', checked)}
          />

          <PropertyCheckbox
            title="Can Weigh"
            description="Device has weighing capability"
            checked={config.can_weigh || false}
            onChange={(checked) => handleFieldChange('can_weigh', checked)}
          />

          <PropertyCheckbox
            title="Can Open Cash Drawer"
            description="Device can trigger cash drawer opening"
            checked={config.can_open_drawer || false}
            onChange={(checked) => handleFieldChange('can_open_drawer', checked)}
          />
        </div>
      </div>

      {/* Protocol Support */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Protocol Support</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Supports ESC/POS"
            description="Supports ESC/POS printer commands"
            checked={config.supports_escpos || false}
            onChange={(checked) => handleFieldChange('supports_escpos', checked)}
          />

          <PropertyCheckbox
            title="Supports ZPL"
            description="Supports Zebra Programming Language"
            checked={config.supports_zpl || false}
            onChange={(checked) => handleFieldChange('supports_zpl', checked)}
          />

          <PropertyCheckbox
            title="Supports Cutter"
            description="Has built-in paper cutter"
            checked={config.supports_cutter || false}
            onChange={(checked) => handleFieldChange('supports_cutter', checked)}
          />
        </div>
      </div>

      {/* Supported Formats */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Supported Formats</h4>
        <MultipleDropdownSearch
          label="Document/Image Formats"
          options={DOCUMENT_FORMATS}
          values={config.supported_formats || []}
          onSelect={(values: string[]) => handleFieldChange('supported_formats', values.length > 0 ? values : null)}
          placeholder="Select supported formats"
          error={errors['capabilities.supported_formats']}
        />
      </div>

      {/* Barcode Symbologies */}
      {config.can_scan && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Barcode Symbologies</h4>
          <MultipleDropdownSearch
            label="Supported Barcode Types"
            options={BARCODE_DECODE_TYPES}
            values={config.supported_symbologies || []}
            onSelect={(values: string[]) => handleFieldChange('supported_symbologies', values.length > 0 ? values : null)}
            placeholder="Select supported symbologies"
            error={errors['capabilities.supported_symbologies']}
          />
        </div>
      )}

      {/* Maximum Resolution */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Resolution</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Maximum Resolution"
            value={config.max_resolution || ''}
            onChange={(value) => handleFieldChange('max_resolution', value || null)}
            placeholder="1200x1200 dpi or 203 dpi"
            error={errors['capabilities.max_resolution']}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-violet-900 mb-2">Capabilities Configuration Notes</h5>
        <ul className="text-sm text-violet-800 space-y-1 list-disc list-inside">
          <li><strong>Core Capabilities:</strong> Define what the device can do (used by POS to show/hide features)</li>
          <li><strong>Protocol Support:</strong> ESC/POS (thermal printers), ZPL (label printers)</li>
          <li><strong>Cutter:</strong> Automatic paper cutting (requires compatible printer)</li>
          <li><strong>Formats:</strong> Select document/image types device can handle</li>
          <li><strong>Symbologies:</strong> Barcode types scanner can decode (only if can_scan is enabled)</li>
          <li><strong>Resolution:</strong> Print quality (DPI) - higher is better but slower</li>
        </ul>
      </div>

      {/* Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Common Device Capability Examples</h5>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Receipt Printer:</p>
            <p className="ml-2">Print ✓ | Open Drawer ✓ | ESC/POS ✓ | Cutter ✓ | Formats: txt, png</p>
          </div>
          <div>
            <p className="font-semibold">Barcode Scanner:</p>
            <p className="ml-2">Scan ✓ | Symbologies: Code 128, EAN-13, QR</p>
          </div>
          <div>
            <p className="font-semibold">Payment Terminal:</p>
            <p className="ml-2">Accept Payment ✓ | Print (receipts) ✓</p>
          </div>
          <div>
            <p className="font-semibold">Label Printer:</p>
            <p className="ml-2">Print ✓ | ZPL ✓ | Formats: png, pdf | Resolution: 300 dpi</p>
          </div>
          <div>
            <p className="font-semibold">Scale:</p>
            <p className="ml-2">Weigh ✓</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapabilitiesConfig;
