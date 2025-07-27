import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { InputMoneyField, DropdownSearch, Widget } from '../ui';
import { getUOMDropdownOptions } from '../../constants/uom';
import type { DropdownSearchOption } from '../ui/DropdownSearch';
import type { Product, ProductFormErrors } from '../../services/types/product.types';

interface ProductPricingTabProps {
  formData: Partial<Product>;
  errors: ProductFormErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  getDiscountTypeDropdownOptions: () => DropdownSearchOption[];
  handleDiscountTypeSelect: (option: DropdownSearchOption | null) => void;
}

export const ProductPricingTab: React.FC<ProductPricingTabProps> = ({
  formData,
  errors,
  onInputChange,
  getDiscountTypeDropdownOptions,
  handleDiscountTypeSelect
}) => {
  return (
    <Widget
      title="Pricing Information"
      description="Configure pricing, discounts and cost settings"
      icon={CurrencyDollarIcon}
      variant="default"
      className='overflow-visible'
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* List Price */}
        <InputMoneyField
          label="List Price"
          required
          value={formData.pricing?.list_price || ''}
          onChange={(value) => onInputChange({ target: { name: 'pricing.list_price', value, type: 'number' } } as any)}
          placeholder="0.00"
          error={errors.list_price}
          min={0}
          step={0.01}
        />

        {/* Sale Price */}
        <InputMoneyField
          label="Sale Price"
          value={formData.pricing?.sale_price || ''}
          onChange={(value) => onInputChange({ target: { name: 'pricing.sale_price', value, type: 'number' } } as any)}
          placeholder="0.00"
          min={0}
          step={0.01}
        />

        {/* Tare Value */}
        <InputMoneyField
          label="Tare Value"
          value={formData.pricing?.tare_value || ''}
          onChange={(value) => onInputChange({ target: { name: 'pricing.tare_value', value, type: 'number' } } as any)}
          placeholder="0.00"
          min={0}
          step={0.01}
        />

        {/* Tare UOM */}
        <div>
          <DropdownSearch
            label="Tare UOM"
            value={formData.pricing?.tare_uom || ''}
            options={getUOMDropdownOptions()}
            onSelect={(option) => 
              onInputChange({ 
                target: { 
                  name: 'pricing.tare_uom', 
                  value: option?.id || '', 
                  type: 'text' 
                } 
              } as any)
            }
            placeholder="Select tare unit"
            searchPlaceholder="Search units..."
            clearLabel="No Unit"
            noOptionsMessage="No units available"
            allowClear={true}
            closeOnSelect={true}
          />
        </div>

        {/* Discount Type */}
        <div>
          <DropdownSearch
            label="Discount Type"
            value={formData.pricing?.discount_type || 'percentage'}
            placeholder="Select discount type"
            searchPlaceholder="Search discount types..."
            options={getDiscountTypeDropdownOptions()}
            onSelect={handleDiscountTypeSelect}
            clearLabel="Default Type"
            noOptionsMessage="No discount types available"
            allowClear={false}
            closeOnSelect={true}
          />
        </div>

        {/* Discount Value */}
        <InputMoneyField
          label="Discount Value"
          value={formData.pricing?.discount_value}
          onChange={(value) => onInputChange({ target: { name: 'pricing.discount_value', value, type: 'number' } } as any)}
          placeholder="0.00"
          step={0.01}
          min={0}
          currencySymbol={formData.pricing?.discount_type === 'percentage' ? '%' : undefined}
          currencyPosition="after"
        />

        {/* Min Discount Value */}
        <InputMoneyField
          label="Min Discount Value"
          value={formData.pricing?.min_discount_value}
          onChange={(value) => onInputChange({ target: { name: 'pricing.min_discount_value', value, type: 'number' } } as any)}
          placeholder="0.00"
          step={0.01}
          min={0}
          currencySymbol={formData.pricing?.discount_type === 'percentage' ? '%' : undefined}
          currencyPosition="after"
        />

        {/* Max Discount Value */}
        <InputMoneyField
          label="Max Discount Value"
          value={formData.pricing?.max_discount_value}
          onChange={(value) => onInputChange({ target: { name: 'pricing.max_discount_value', value, type: 'number' } } as any)}
          placeholder="0.00"
          step={0.01}
          min={0}
          currencySymbol={formData.pricing?.discount_type === 'percentage' ? '%' : undefined}
          currencyPosition="after"
        />
      </div>
    </Widget>
  );
};
