import React from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { InputTextField, DropdownSearch, MultipleDropdownSearch, Widget } from '../ui';
import { getUOMDropdownOptions, getUOMById } from '../../constants/uom';
import type { DropdownSearchOption } from '../ui/DropdownSearch';
import type { MultipleDropdownSearchOption } from '../ui/MultipleDropdownSearch';
import type { Product, ProductFormErrors } from '../../services/types/product.types';
import type { EnhancedCategory } from '../../types/category';

interface ProductBasicInfoTabProps {
  formData: Partial<Product>;
  errors: ProductFormErrors;
  categories: EnhancedCategory[];
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  getCategoryDropdownOptions: () => MultipleDropdownSearchOption[];
  handleCategorySelect: (selectedValues: string[]) => void;
  handleStockStatusSelect: (option: DropdownSearchOption | null) => void;
  getStockStatusDropdownOptions: () => DropdownSearchOption[];
  getTaxGroupDropdownOptions: () => DropdownSearchOption[];
  handleTaxGroupSelect: (option: DropdownSearchOption | null) => void;
  taxGroupsLoading: boolean;
}

export const ProductBasicInfoTab: React.FC<ProductBasicInfoTabProps> = ({
  formData,
  errors,
  isEditing,
  onInputChange,
  getCategoryDropdownOptions,
  handleCategorySelect,
  handleStockStatusSelect,
  getStockStatusDropdownOptions,
  getTaxGroupDropdownOptions,
  handleTaxGroupSelect,
  taxGroupsLoading
}) => {
  return (
    <Widget
      title="Basic Information"
      description="Enter the fundamental details for this product"
      icon={ClipboardDocumentListIcon}
      variant="default"
      className='overflow-visible'
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <InputTextField
          label="Product Name"
          required
          value={formData.name}
          onChange={(value) => onInputChange({ target: { name: 'name', value, type: 'text' } } as any)}
          placeholder="Enter product name"
          error={errors.name}
          colSpan="md:col-span-2"
        />

        {/* Product ID */}
        <InputTextField
          label="Product ID"
          value={formData.item_id || ''}
          onChange={(value) => onInputChange({ target: { name: 'item_id', value, type: 'text' } } as any)}
          placeholder={isEditing ? "Product ID (system generated)" : "Enter product ID (optional)"}
          disabled={isEditing}
          helperText={isEditing ? "Product ID cannot be changed after creation" : "Leave empty to auto-generate"}
        />

        {/* Category */}
        <div>
          <MultipleDropdownSearch
            label="Categories"
            values={formData.attributes?.category_ids || []}
            placeholder="No Categories Selected"
            searchPlaceholder="Search categories..."
            options={getCategoryDropdownOptions()}
            onSelect={handleCategorySelect}
            allowSelectAll={true}
            selectAllLabel="Select All Categories"
            clearAllLabel="Clear All Categories"
            noOptionsMessage="No categories available"
            maxSelectedDisplay={3}
          />
        </div>

        {/* UOM */}
        <div>
          <DropdownSearch
            label="Unit of Measure"
            required
            value={formData.uom}
            options={getUOMDropdownOptions()}
            onSelect={(option) => 
              onInputChange({ 
                target: { 
                  name: 'uom', 
                  value: option?.id || '', 
                  type: 'text' 
                } 
              } as any)
            }
            placeholder="Select unit of measure"
            searchPlaceholder="Search units..."
            displayValue={(option) => option ? getUOMById(option.id)?.label || option.label : ''}
            error={errors.uom}
            allowClear={false}
            closeOnSelect={true}
            noOptionsMessage="No units available"
          />
        </div>

        {/* Brand */}
        <InputTextField
          label="Brand"
          value={formData.brand}
          onChange={(value) => onInputChange({ target: { name: 'brand', value, type: 'text' } } as any)}
          placeholder="Enter brand name"
        />

        {/* Tax Group */}
        <div>
          <DropdownSearch
            label="Tax Group"
            value={formData.tax_group}
            placeholder={taxGroupsLoading ? "Loading tax groups..." : "Select tax group"}
            searchPlaceholder="Search tax groups..."
            options={getTaxGroupDropdownOptions()}
            onSelect={handleTaxGroupSelect}
            clearLabel="No Tax Group"
            noOptionsMessage={
              taxGroupsLoading 
                ? "Loading tax groups..." 
                : getTaxGroupDropdownOptions().length === 0 
                  ? "No tax groups configured. Please set up tax configuration first."
                  : "No tax groups match your search"
            }
            allowClear={true}
            closeOnSelect={true}
          />
        </div>

        {/* Fiscal ID */}
        <InputTextField
          label="Fiscal ID"
          value={formData.fiscal_id}
          onChange={(value) => onInputChange({ target: { name: 'fiscal_id', value, type: 'text' } } as any)}
          placeholder="Enter fiscal ID"
        />

        {/* Stock Status */}
        <div>
          <DropdownSearch
            label="Stock Status"
            value={formData.stock_status || 'in_stock'}
            placeholder="Select stock status"
            searchPlaceholder="Search stock status..."
            options={getStockStatusDropdownOptions()}
            onSelect={handleStockStatusSelect}
            clearLabel="Default Status"
            noOptionsMessage="No status options available"
            allowClear={false}
            closeOnSelect={true}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={onInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product description"
          />
        </div>
      </div>
    </Widget>
  );
};
