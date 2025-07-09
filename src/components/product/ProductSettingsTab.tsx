import React from 'react';
import { CogIcon, TagIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { PropertyCheckbox, InputTextField, Widget } from '../ui';
import type { Product } from '../../services/types/product.types';

interface ProductSettingsTabProps {
  formData: Partial<Product>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const ProductSettingsTab: React.FC<ProductSettingsTabProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      {/* Inventory Settings Widget */}
      <Widget
        title="Inventory Settings"
        description="Configure inventory tracking and management options"
        icon={CogIcon}
        variant="default"
      >
        <div className="space-y-4">
          <PropertyCheckbox
            title="Track Inventory"
            description="Monitor stock levels for this product"
            checked={formData.settings?.track_inventory || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.track_inventory', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Allow Backorder"
            description="Allow orders when item is out of stock"
            checked={formData.settings?.allow_backorder || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.allow_backorder', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Require Serial Number"
            description="Serial number must be provided for this product"
            checked={formData.settings?.require_serial || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.require_serial', checked, type: 'checkbox' } } as any)}
          />
        </div>
      </Widget>

      {/* Product Flags Widget */}
      <Widget
        title="Product Flags"
        description="Configure product behavior and display options"
        icon={TagIcon}
        variant="default"
      >
        <div className="space-y-4">
          <PropertyCheckbox
            title="Taxable"
            description="Apply taxes to this product"
            checked={formData.settings?.taxable || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.taxable', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Measure Required"
            description="Require weight or measurement for this product"
            checked={formData.settings?.measure_required || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.measure_required', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Non-Inventoried"
            description="This product is not tracked in inventory"
            checked={formData.settings?.non_inventoried || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.non_inventoried', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Shippable"
            description="This product can be shipped to customers"
            checked={formData.settings?.shippable || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.shippable', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Active"
            description="Product is active and available for sale"
            checked={formData.settings?.active || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.active', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Serialized"
            description="This product requires serial number tracking"
            checked={formData.settings?.serialized || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.serialized', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Disallow Discount"
            description="Prevent discounts from being applied to this product"
            checked={formData.settings?.disallow_discount || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.disallow_discount', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Online Only"
            description="Product is only available for online orders"
            checked={formData.settings?.online_only || false}
            onChange={(checked) => onInputChange({ target: { name: 'settings.online_only', checked, type: 'checkbox' } } as any)}
          />
        </div>
      </Widget>

      {/* Prompt Settings Widget */}
      <Widget
        title="Prompt Settings"
        description="Configure prompts for point-of-sale interactions"
        icon={ClipboardDocumentListIcon}
        variant="default"
      >
        <div className="space-y-4">
          <PropertyCheckbox
            title="Prompt for Price"
            description="Ask for price confirmation during sale"
            checked={formData.prompts?.prompt_price || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_price', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Prompt for Quantity"
            description="Ask for quantity confirmation during sale"
            checked={formData.prompts?.prompt_qty || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_qty', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Prompt for Description"
            description="Ask for additional description during sale"
            checked={formData.prompts?.prompt_description || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_description', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Prompt for UOM"
            description="Ask for unit of measure during sale"
            checked={formData.prompts?.prompt_uom || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_uom', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Prompt for Cost"
            description="Ask for cost confirmation during sale"
            checked={formData.prompts?.prompt_cost || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_cost', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Prompt for Serial"
            description="Ask for serial number during sale"
            checked={formData.prompts?.prompt_serial || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_serial', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Prompt for Lot"
            description="Ask for lot number during sale"
            checked={formData.prompts?.prompt_lot || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_lot', checked, type: 'checkbox' } } as any)}
          />
          
          <PropertyCheckbox
            title="Prompt for Expiry"
            description="Ask for expiry date during sale"
            checked={formData.prompts?.prompt_expiry || false}
            onChange={(checked) => onInputChange({ target: { name: 'prompts.prompt_expiry', checked, type: 'checkbox' } } as any)}
          />

          {/* Prompt Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Weight Threshold
            </label>
            <input
              type="number"
              name="prompts.prompt_weight"
              value={formData.prompts?.prompt_weight || ''}
              onChange={onInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Manufacturer */}
          <InputTextField
            label="Manufacturer"
            value={formData.attributes?.manufacturer}
            onChange={(value) => onInputChange({ target: { name: 'attributes.manufacturer', value, type: 'text' } } as any)}
            placeholder="Enter manufacturer name"
          />

          {/* Model Number */}
          <InputTextField
            label="Model Number"
            value={formData.attributes?.model_number}
            onChange={(value) => onInputChange({ target: { name: 'attributes.model_number', value, type: 'text' } } as any)}
            placeholder="Enter model number"
          />
        </div>
      </Widget>
    </div>
  );
};
