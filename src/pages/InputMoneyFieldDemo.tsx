import React, { useState } from 'react';
import { CurrencyDollarIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { PageHeader, InputMoneyField, Card } from '../components/ui';

interface DemoFormData {
  listPrice: string;
  salePrice: string;
  discount: string;
  euroPrice: string;
  iconPrice: string;
  disabledPrice: string;
}

const InputMoneyFieldDemo: React.FC = () => {
  const [formData, setFormData] = useState<DemoFormData>({
    listPrice: '',
    salePrice: '99.99',
    discount: '',
    euroPrice: '',
    iconPrice: '',
    disabledPrice: '150.00'
  });

  const [errors, setErrors] = useState<Partial<DemoFormData>>({});

  const handleInputChange = (field: keyof DemoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleValidation = () => {
    const newErrors: Partial<DemoFormData> = {};
    
    if (!formData.listPrice || parseFloat(formData.listPrice) <= 0) {
      newErrors.listPrice = 'List price must be greater than 0';
    }
    
    if (formData.discount && parseFloat(formData.discount) > 100) {
      newErrors.discount = 'Discount cannot exceed 100';
    }
    
    setErrors(newErrors);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="InputMoneyField Component Demo"
        description="Showcase of the new InputMoneyField component with various configurations"
      />

      {/* Basic Examples */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Currency Inputs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputMoneyField
            label="List Price"
            required
            value={formData.listPrice}
            onChange={(value) => handleInputChange('listPrice', value)}
            placeholder="0.00"
            error={errors.listPrice}
            helperText="Enter the base price for this item"
          />

          <InputMoneyField
            label="Sale Price"
            value={formData.salePrice}
            onChange={(value) => handleInputChange('salePrice', value)}
            placeholder="0.00"
            helperText="Optional discounted price"
          />

          <InputMoneyField
            label="Discount Amount"
            value={formData.discount}
            onChange={(value) => handleInputChange('discount', value)}
            placeholder="0.00"
            error={errors.discount}
            min={0}
            max={1000}
          />

          <InputMoneyField
            label="Disabled Field"
            value={formData.disabledPrice}
            onChange={(value) => handleInputChange('disabledPrice', value)}
            placeholder="0.00"
            disabled
            helperText="This field is disabled for demonstration"
          />
        </div>
      </Card>

      {/* Currency Variations */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Currency Variations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputMoneyField
            label="Euro Price"
            value={formData.euroPrice}
            onChange={(value) => handleInputChange('euroPrice', value)}
            placeholder="0.00"
            currencySymbol="€"
            helperText="Price in Euros"
          />

          <InputMoneyField
            label="Price with Icon"
            value={formData.iconPrice}
            onChange={(value) => handleInputChange('iconPrice', value)}
            placeholder="0.00"
            currencyIcon={CurrencyDollarIcon}
            helperText="Using currency icon instead of symbol"
          />

          <InputMoneyField
            label="Currency After"
            value={formData.listPrice}
            onChange={(value) => handleInputChange('listPrice', value)}
            placeholder="0.00"
            currencySymbol="USD"
            currencyPosition="after"
            helperText="Currency symbol positioned after the amount"
          />

          <InputMoneyField
            label="Alternative Icon"
            value={formData.salePrice}
            onChange={(value) => handleInputChange('salePrice', value)}
            placeholder="0.00"
            currencyIcon={BanknotesIcon}
            helperText="Using different currency icon"
          />
        </div>
      </Card>

      {/* Form Example */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Form Integration Example</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputMoneyField
              label="Product Cost"
              required
              value={formData.listPrice}
              onChange={(value) => handleInputChange('listPrice', value)}
              placeholder="0.00"
              error={errors.listPrice}
            />

            <InputMoneyField
              label="Selling Price"
              value={formData.salePrice}
              onChange={(value) => handleInputChange('salePrice', value)}
              placeholder="0.00"
            />

            <InputMoneyField
              label="Profit Margin"
              value={formData.discount}
              onChange={(value) => handleInputChange('discount', value)}
              placeholder="0.00"
              error={errors.discount}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleValidation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Validate Form
            </button>
            <button
              onClick={() => {
                setFormData({
                  listPrice: '',
                  salePrice: '',
                  discount: '',
                  euroPrice: '',
                  iconPrice: '',
                  disabledPrice: '150.00'
                });
                setErrors({});
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Reset Form
            </button>
          </div>
        </div>
      </Card>

      {/* Form Data Display */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Form Data</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

export default InputMoneyFieldDemo;
