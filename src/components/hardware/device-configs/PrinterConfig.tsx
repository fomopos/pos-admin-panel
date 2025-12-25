/**
 * Printer Configuration Form Component
 * 
 * Unified form for configuring all printer types:
 * - Thermal (receipt printers, kitchen printers)
 * - Label (product labels, shipping labels)
 * - Document (A4/Letter printers)
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React, { useState, useMemo } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox,
  MultipleDropdownSearch,
  Button
} from '../../ui';
import {
  PRINTER_MODES,
  CHARACTER_ENCODINGS,
  KITCHEN_SECTIONS,
  getPaperSizesForMode
} from '../../../constants/hardware.options';
import type { PrinterConfig, PrinterMode, PaperSize } from '../../../types/hardware.types';

interface PrinterConfigFormProps {
  config: Partial<PrinterConfig>;
  onChange: (config: PrinterConfig) => void;
  errors?: Record<string, string>;
}

/**
 * PrinterConfigForm - Unified configuration form for all printer types
 * 
 * @example
 * ```tsx
 * <PrinterConfigForm
 *   config={{ mode: 'thermal', paper: '80mm', cut: true }}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const PrinterConfigForm: React.FC<PrinterConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const mode = config.mode || 'thermal';
  const [newKitchenName, setNewKitchenName] = useState('');

  // Combine predefined kitchens with any custom ones from the config
  const allKitchenOptions = useMemo(() => {
    const predefinedIds = KITCHEN_SECTIONS.map(k => k.id);
    const customKitchens = (config.kitchens || [])
      .filter(k => !predefinedIds.includes(k))
      .map(k => ({
        id: k,
        label: k,
        description: 'Custom kitchen'
      }));
    return [...KITCHEN_SECTIONS, ...customKitchens];
  }, [config.kitchens]);

  const handleFieldChange = <K extends keyof PrinterConfig>(
    field: K, 
    value: PrinterConfig[K]
  ) => {
    onChange({
      mode: config.mode || 'thermal',
      ...config,
      [field]: value
    });
  };

  const handleModeChange = (newMode: PrinterMode) => {
    // Reset config when mode changes, keeping only common fields
    const paperSizes = getPaperSizesForMode(newMode);
    const defaultPaper = paperSizes[0]?.id as PaperSize || undefined;
    
    const newConfig: PrinterConfig = {
      mode: newMode,
      paper: defaultPaper,
      copies: 1
    };

    // Set mode-specific defaults
    if (newMode === 'thermal') {
      newConfig.cut = true;
      newConfig.drawer = false;
      newConfig.auto = true;
      newConfig.encoding = 'utf8';
    } else if (newMode === 'label') {
      newConfig.zpl = true;
    }

    onChange(newConfig);
  };

  const paperSizes = getPaperSizesForMode(mode);

  return (
    <div className="space-y-6">
      {/* Printer Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Printer Mode"
          options={PRINTER_MODES}
          value={mode}
          onSelect={(option) => option && handleModeChange(option.id as PrinterMode)}
          placeholder="Select printer mode"
          displayValue={(option) => option ? (
            <div className="flex items-center gap-2">
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </div>
          ) : 'Select printer mode'}
          required
          error={errors['printer_config.mode']}
        />

        <DropdownSearch
          label="Paper Size"
          options={paperSizes}
          value={config.paper || ''}
          onSelect={(option) => option && handleFieldChange('paper', option.id as PaperSize)}
          placeholder="Select paper size"
          displayValue={(option) => option ? option.label : 'Select paper size'}
          error={errors['printer_config.paper']}
        />
      </div>

      {/* Custom Label Size (for label mode only when not using standard size) */}
      {mode === 'label' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Custom Label Size (Optional)</h4>
          <p className="text-xs text-blue-700 mb-4">
            Use custom dimensions if your label size is not in the standard list.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label="Width (mm)"
              type="number"
              value={config.width?.toString() || ''}
              onChange={(value) => handleFieldChange('width', value ? parseInt(value) : undefined)}
              placeholder="50"
              error={errors['printer_config.width']}
            />

            <InputTextField
              label="Height (mm)"
              type="number"
              value={config.height?.toString() || ''}
              onChange={(value) => handleFieldChange('height', value ? parseInt(value) : undefined)}
              placeholder="25"
              error={errors['printer_config.height']}
            />
          </div>
        </div>
      )}

      {/* Common Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Number of Copies"
          type="number"
          value={config.copies?.toString() || '1'}
          onChange={(value) => handleFieldChange('copies', value ? parseInt(value) : 1)}
          placeholder="1"
          error={errors['printer_config.copies']}
        />

        {mode === 'thermal' && (
          <DropdownSearch
            label="Character Encoding"
            options={CHARACTER_ENCODINGS}
            value={config.encoding || 'utf8'}
            onSelect={(option) => option && handleFieldChange('encoding', option.id as 'utf8' | 'gbk')}
            placeholder="Select encoding"
            displayValue={(option) => option ? option.label : 'Select encoding'}
            error={errors['printer_config.encoding']}
          />
        )}
      </div>

      {/* Thermal-specific Settings */}
      {mode === 'thermal' && (
        <>
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Thermal Printer Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PropertyCheckbox
                title="Auto Print"
                description="Print automatically when document ready"
                checked={config.auto || false}
                onChange={(checked) => handleFieldChange('auto', checked)}
              />

              <PropertyCheckbox
                title="Auto Cut"
                description="Cut paper after printing"
                checked={config.cut || false}
                onChange={(checked) => handleFieldChange('cut', checked)}
              />

              <PropertyCheckbox
                title="Open Cash Drawer"
                description="Open drawer after printing"
                checked={config.drawer || false}
                onChange={(checked) => handleFieldChange('drawer', checked)}
              />
            </div>
          </div>

          {/* Kitchen Sections for KOT routing */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Kitchen Sections (Optional)</h4>
            <p className="text-xs text-gray-500 mb-4">
              Select kitchen sections for KOT (Kitchen Order Ticket) routing. Leave empty for general receipt printing.
            </p>
            
            {/* Add Custom Kitchen */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">Add Custom Kitchen</label>
              <div className="flex gap-2">
                <InputTextField
                  label=""
                  value={newKitchenName}
                  onChange={(value) => setNewKitchenName(value)}
                  placeholder="Enter custom kitchen name..."
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (newKitchenName.trim()) {
                      const kitchenId = newKitchenName.trim().toLowerCase().replace(/\s+/g, '_');
                      const currentKitchens = config.kitchens || [];
                      if (!currentKitchens.includes(kitchenId)) {
                        handleFieldChange('kitchens', [...currentKitchens, kitchenId]);
                      }
                      setNewKitchenName('');
                    }
                  }}
                  disabled={!newKitchenName.trim()}
                  className="shrink-0"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Kitchens Display */}
            {config.kitchens && config.kitchens.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Selected Kitchens</label>
                <div className="flex flex-wrap gap-2">
                  {config.kitchens.map((kitchenId) => {
                    const kitchen = allKitchenOptions.find(k => k.id === kitchenId);
                    const label = kitchen?.label || kitchenId;
                    const isCustom = !KITCHEN_SECTIONS.find(k => k.id === kitchenId);
                    return (
                      <span
                        key={kitchenId}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          isCustom 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {label}
                        {isCustom && <span className="text-xs opacity-70">(custom)</span>}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.kitchens?.filter(k => k !== kitchenId);
                            handleFieldChange('kitchens', updated && updated.length > 0 ? updated : undefined);
                          }}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Predefined Kitchen Selection */}
            <MultipleDropdownSearch
              label="Predefined Kitchen Sections"
              options={allKitchenOptions}
              values={config.kitchens || []}
              onSelect={(selected) => handleFieldChange('kitchens', selected.length > 0 ? selected : undefined)}
              placeholder="Select kitchen sections..."
              searchPlaceholder="Search sections..."
            />
          </div>
        </>
      )}

      {/* Label-specific Settings */}
      {mode === 'label' && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Label Printer Options</h4>
          <PropertyCheckbox
            title="ZPL Support"
            description="Printer supports Zebra Programming Language (ZPL) commands"
            checked={config.zpl || false}
            onChange={(checked) => handleFieldChange('zpl', checked)}
          />
        </div>
      )}
    </div>
  );
};

export default PrinterConfigForm;
