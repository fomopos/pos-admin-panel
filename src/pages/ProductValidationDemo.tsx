import React, { useState } from 'react';
import { 
  Widget, 
  PageHeader, 
  Button, 
  InputTextField, 
  InputTextArea,
  InputMoneyField,
  DropdownSearch,
  MultipleDropdownSearch,
  PropertyCheckbox, 
  Alert 
} from '../components/ui';
import { 
  InformationCircleIcon, 
  CurrencyDollarIcon,
  CogIcon,
  TagIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ProductValidationRules, type ProductFormData } from '../utils/productValidation';
import type { ProductFormErrors } from '../services/types/product.types';

const ProductValidationDemo: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    store_id: '',
    uom: '',
    brand: '',
    tax_group: '',
    fiscal_id: '',
    stock_status: 'in_stock',
    pricing: {
      list_price: 0,
      sale_price: 0,
      tare_value: 0,
      tare_uom: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_discount_value: 0,
      max_discount_value: 0
    },
    settings: {
      track_inventory: false,
      allow_backorder: false,
      require_serial: false,
      taxable: true,
      measure_required: false,
      non_inventoried: false,
      shippable: true,
      serialized: false,
      active: true,
      disallow_discount: false,
      online_only: false
    },
    prompts: {
      prompt_qty: false,
      prompt_price: false,
      prompt_weight: 0,
      prompt_uom: false,
      prompt_description: false,
      prompt_cost: false,
      prompt_serial: false,
      prompt_lot: false,
      prompt_expiry: false
    },
    attributes: {
      manufacturer: '',
      model_number: '',
      category_ids: [],
      tags: [],
      custom_attributes: {},
      properties: {}
    },
    media: {
      image_url: ''
    },
    modifier_groups: []
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [validationResults, setValidationResults] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Sample dropdown options
  const storeOptions = [
    { id: 'store1', label: 'Main Store', description: 'Primary retail location' },
    { id: 'store2', label: 'Warehouse', description: 'Storage and distribution center' }
  ];

  const uomOptions = [
    { id: 'EACH', label: 'Each', description: 'Individual items' },
    { id: 'LB', label: 'Pound', description: 'Weight measurement' },
    { id: 'KG', label: 'Kilogram', description: 'Metric weight' },
    { id: 'OZ', label: 'Ounce', description: 'Small weight measurement' }
  ];

  const taxGroupOptions = [
    { id: 'standard', label: 'Standard Tax', description: 'Regular sales tax' },
    { id: 'food', label: 'Food Items', description: 'Reduced tax rate for food' },
    { id: 'exempt', label: 'Tax Exempt', description: 'No tax applied' }
  ];

  const categoryOptions = [
    { id: 'electronics', label: 'Electronics', description: 'Electronic devices', level: 0 },
    { id: 'smartphones', label: 'Smartphones', description: 'Mobile phones', level: 1 },
    { id: 'laptops', label: 'Laptops', description: 'Portable computers', level: 1 },
    { id: 'clothing', label: 'Clothing', description: 'Apparel and fashion', level: 0 },
    { id: 'mens', label: "Men's Clothing", description: 'Male apparel', level: 1 },
    { id: 'womens', label: "Women's Clothing", description: 'Female apparel', level: 1 }
  ];

  const validateField = (fieldName: string, value: any): void => {
    const validation = ProductValidationRules.validateField(fieldName, value, formData);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? undefined : validation.error
    }));
  };

  const validateFullForm = (): void => {
    const { isValid, errors: validationErrors } = ProductValidationRules.validateForm(formData);
    
    setErrors(validationErrors);
    setIsFormValid(isValid);
    
    const results: string[] = [];
    
    if (isValid) {
      results.push('✅ All validation checks passed!');
    } else {
      results.push('❌ Validation failed with the following errors:');
      Object.entries(validationErrors).forEach(([field, error]) => {
        results.push(`  • ${field}: ${error}`);
      });
    }
    
    setValidationResults(results);
  };

  const handleInputChange = (field: string, value: any): void => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Perform real-time validation
    validateField(field, value);
  };

  const handleArrayChange = (field: string, values: string[]): void => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = values;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: values
      }));
    }
    
    // Perform real-time validation
    validateField(field, values);
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      description: '',
      store_id: '',
      uom: '',
      brand: '',
      tax_group: '',
      fiscal_id: '',
      stock_status: 'in_stock',
      pricing: {
        list_price: 0,
        sale_price: 0,
        tare_value: 0,
        tare_uom: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_discount_value: 0,
        max_discount_value: 0
      },
      settings: {
        track_inventory: false,
        allow_backorder: false,
        require_serial: false,
        taxable: true,
        measure_required: false,
        non_inventoried: false,
        shippable: true,
        serialized: false,
        active: true,
        disallow_discount: false,
        online_only: false
      },
      prompts: {
        prompt_qty: false,
        prompt_price: false,
        prompt_weight: 0,
        prompt_uom: false,
        prompt_description: false,
        prompt_cost: false,
        prompt_serial: false,
        prompt_lot: false,
        prompt_expiry: false
      },
      attributes: {
        manufacturer: '',
        model_number: '',
        category_ids: [],
        tags: [],
        custom_attributes: {},
        properties: {}
      },
      media: {
        image_url: ''
      },
      modifier_groups: []
    });
    setErrors({});
    setValidationResults([]);
    setIsFormValid(false);
  };

  const fillSampleData = (): void => {
    setFormData({
      name: 'iPhone 15 Pro',
      description: 'Latest Apple iPhone with advanced features and pro camera system',
      store_id: 'store1',
      uom: 'EACH',
      brand: 'Apple',
      tax_group: 'standard',
      fiscal_id: 'IPHONE15PRO',
      stock_status: 'in_stock',
      pricing: {
        list_price: 999.99,
        sale_price: 899.99,
        tare_value: 0,
        tare_uom: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_discount_value: 5,
        max_discount_value: 15
      },
      settings: {
        track_inventory: true,
        allow_backorder: false,
        require_serial: true,
        taxable: true,
        measure_required: false,
        non_inventoried: false,
        shippable: true,
        serialized: true,
        active: true,
        disallow_discount: false,
        online_only: false
      },
      prompts: {
        prompt_qty: false,
        prompt_price: false,
        prompt_weight: 0,
        prompt_uom: false,
        prompt_description: false,
        prompt_cost: false,
        prompt_serial: true,
        prompt_lot: false,
        prompt_expiry: false
      },
      attributes: {
        manufacturer: 'Apple Inc.',
        model_number: 'A2848',
        category_ids: ['electronics', 'smartphones'],
        tags: ['apple', 'iphone', 'smartphone', 'premium'],
        custom_attributes: {},
        properties: {}
      },
      media: {
        image_url: 'https://example.com/images/iphone15pro.jpg'
      },
      modifier_groups: []
    });
    setErrors({});
    setValidationResults([]);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Product Validation Demo"
        description="Test the comprehensive product validation system with real-time feedback"
      >
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={resetForm}>
            Reset Form
          </Button>
          <Button variant="outline" onClick={fillSampleData}>
            Fill Sample Data
          </Button>
          <Button variant="primary" onClick={validateFullForm}>
            Validate Form
          </Button>
        </div>
      </PageHeader>

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <Alert variant={isFormValid ? "success" : "error"}>
          <CheckCircleIcon className="h-5 w-5" />
          <div>
            <h4 className="font-medium">Validation Results</h4>
            <div className="text-sm mt-1">
              {validationResults.map((result, index) => (
                <div key={index} className="font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        </Alert>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Widget
          title="Basic Information"
          description="Core product details"
          icon={InformationCircleIcon}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label="Product Name"
              required
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              error={errors.name}
              placeholder="Enter product name"
              colSpan="md:col-span-2"
            />
            
            <InputTextArea
              label="Description"
              value={formData.description || ''}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Enter product description"
              rows={3}
              colSpan="md:col-span-2"
              error={errors.description}
            />
            
            <DropdownSearch
              label="Store"
              required
              value={formData.store_id}
              placeholder="Select store"
              options={storeOptions}
              onSelect={(option) => handleInputChange('store_id', option?.id || '')}
              error={errors.store_id}
            />
            
            <DropdownSearch
              label="Unit of Measure"
              required
              value={formData.uom}
              placeholder="Select UOM"
              options={uomOptions}
              onSelect={(option) => handleInputChange('uom', option?.id || '')}
              error={errors.uom}
            />
            
            <InputTextField
              label="Brand"
              value={formData.brand || ''}
              onChange={(value) => handleInputChange('brand', value)}
              error={errors.brand}
              placeholder="Enter brand name"
            />
            
            <DropdownSearch
              label="Tax Group"
              value={formData.tax_group || ''}
              placeholder="Select tax group"
              options={taxGroupOptions}
              onSelect={(option) => handleInputChange('tax_group', option?.id || '')}
              error={errors.tax_group}
            />
          </div>
        </Widget>

        {/* Pricing */}
        <Widget
          title="Pricing"
          description="Product pricing information"
          icon={CurrencyDollarIcon}
        >
          <div className="space-y-6">
            <InputMoneyField
              label="List Price"
              required
              value={formData.pricing.list_price}
              onChange={(value) => handleInputChange('pricing.list_price', value)}
              error={errors['pricing.list_price']}
              placeholder="0.00"
            />
            
            <InputMoneyField
              label="Sale Price"
              value={formData.pricing.sale_price || 0}
              onChange={(value) => handleInputChange('pricing.sale_price', value)}
              error={errors['pricing.sale_price']}
              placeholder="0.00"
            />
            
            <InputMoneyField
              label="Tare Value"
              value={formData.pricing.tare_value || 0}
              onChange={(value) => handleInputChange('pricing.tare_value', value)}
              error={errors['pricing.tare_value']}
              placeholder="0.00"
            />
          </div>
        </Widget>

        {/* Attributes */}
        <Widget
          title="Attributes"
          description="Product categorization and attributes"
          icon={TagIcon}
        >
          <div className="space-y-6">
            <InputTextField
              label="Manufacturer"
              value={formData.attributes?.manufacturer || ''}
              onChange={(value) => handleInputChange('attributes.manufacturer', value)}
              error={errors['attributes.manufacturer']}
              placeholder="Enter manufacturer"
            />
            
            <InputTextField
              label="Model Number"
              value={formData.attributes?.model_number || ''}
              onChange={(value) => handleInputChange('attributes.model_number', value)}
              error={errors['attributes.model_number']}
              placeholder="Enter model number"
            />
            
            <MultipleDropdownSearch
              label="Categories"
              values={formData.attributes?.category_ids || []}
              options={categoryOptions}
              onSelect={(values) => handleArrayChange('attributes.category_ids', values)}
              placeholder="No categories selected"
              searchPlaceholder="Search categories..."
              allowSelectAll={true}
              selectAllLabel="Select All Categories"
              clearAllLabel="Clear All Categories"
              maxSelectedDisplay={3}
              error={errors['attributes.category_ids']}
            />
          </div>
        </Widget>

        {/* Settings */}
        <Widget
          title="Settings"
          description="Product configuration options"
          icon={CogIcon}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PropertyCheckbox
              title="Track Inventory"
              description="Monitor stock levels for this product"
              checked={formData.settings?.track_inventory || false}
              onChange={(checked) => handleInputChange('settings.track_inventory', checked)}
            />
            
            <PropertyCheckbox
              title="Taxable"
              description="Apply tax to this product"
              checked={formData.settings?.taxable || false}
              onChange={(checked) => handleInputChange('settings.taxable', checked)}
            />
            
            <PropertyCheckbox
              title="Active"
              description="Product is available for sale"
              checked={formData.settings?.active || false}
              onChange={(checked) => handleInputChange('settings.active', checked)}
            />
            
            <PropertyCheckbox
              title="Shippable"
              description="Product can be shipped"
              checked={formData.settings?.shippable || false}
              onChange={(checked) => handleInputChange('settings.shippable', checked)}
            />
            
            <PropertyCheckbox
              title="Serialized"
              description="Track individual serial numbers"
              checked={formData.settings?.serialized || false}
              onChange={(checked) => handleInputChange('settings.serialized', checked)}
            />
            
            <PropertyCheckbox
              title="Allow Backorder"
              description="Allow orders when out of stock"
              checked={formData.settings?.allow_backorder || false}
              onChange={(checked) => handleInputChange('settings.allow_backorder', checked)}
            />
          </div>
        </Widget>

        {/* Media */}
        <Widget
          title="Media"
          description="Product images and media"
          icon={PhotoIcon}
          className="lg:col-span-2"
        >
          <InputTextField
            label="Image URL"
            value={formData.media?.image_url || ''}
            onChange={(value) => handleInputChange('media.image_url', value)}
            error={errors['media.image_url']}
            placeholder="https://example.com/image.jpg"
            colSpan="md:col-span-2"
          />
        </Widget>
      </div>
    </div>
  );
};

export default ProductValidationDemo;
