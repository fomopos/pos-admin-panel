# Product Validation System Documentation

## Overview

This document describes the comprehensive product validation system implemented for the POS Admin Panel, similar to the category validation system. The validation provides both real-time field validation and complete form validation with detailed error feedback.

## Files Created/Modified

### New Files
- `src/utils/productValidation.ts` - Comprehensive validation rules and logic
- `src/pages/ProductValidationDemo.tsx` - Demo page showing all validation features

### Modified Files
- `src/pages/ProductEdit.tsx` - Updated to use new validation system with error handling

## Validation Features

### 1. Real-time Field Validation
- **Immediate feedback** as users type or change field values
- **Visual error indicators** on form fields
- **Contextual error messages** specific to each field type

### 2. Comprehensive Form Validation
- **Complete form validation** before submission
- **Global error feedback** using the error handling framework
- **User-friendly error messages** with field names and specific issues

### 3. Field-Specific Validation Rules

#### Core Required Fields
- **Product Name**: Required, 2-200 characters, valid characters only
- **Store ID**: Required selection
- **Unit of Measure**: Required, max 20 characters
- **List Price**: Required, must be > 0, max 2 decimal places, max $999,999.99

#### Optional Field Validations
- **Description**: Optional, max 1000 characters
- **Brand**: Optional, max 100 characters
- **Tax Group**: Optional, max 50 characters
- **Fiscal ID**: Optional, max 50 characters
- **Stock Status**: Must be valid enum value
- **Sale Price**: Must be ≤ list price, valid number format
- **Tare Value**: Non-negative, max 9999.99
- **Discount Values**: Contextual validation based on discount type
- **Manufacturer**: Optional, max 100 characters
- **Model Number**: Optional, max 50 characters
- **Category IDs**: Array validation, max 10 categories, no duplicates
- **Tags**: Array validation, max 20 tags, max 50 chars each, no duplicates
- **Image URL**: Valid URL format, common image extensions
- **Modifier Groups**: Complex nested validation for groups and modifiers

## Implementation Guide

### 1. Import the Validation System

```typescript
import { ProductValidationRules, type ProductFormData } from '../utils/productValidation';
import { useError } from '../hooks/useError';
```

### 2. Setup Error Handling

```typescript
const { showError, showSuccess, showValidationError } = useError();
const [errors, setErrors] = useState<ProductFormErrors>({});
```

### 3. Implement Real-time Validation

```typescript
const validateField = (fieldName: string, value: any): void => {
  const validationData: ProductFormData = {
    // Convert your form data to ProductFormData format
    ...formData
  };

  const validation = ProductValidationRules.validateField(fieldName, value, validationData);
  
  setErrors(prev => ({
    ...prev,
    [fieldName]: validation.isValid ? undefined : validation.error
  }));
};

const handleInputChange = (name: string, value: any) => {
  // Update form data
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Perform real-time validation
  validateField(name, value);
};
```

### 4. Implement Form Validation

```typescript
const validateForm = (): boolean => {
  const validationData: ProductFormData = {
    // Convert your form data to ProductFormData format
    name: formData.name || '',
    store_id: formData.store_id || '',
    uom: formData.uom || '',
    pricing: {
      list_price: formData.pricing?.list_price || 0,
      // ... other pricing fields
    },
    // ... other form sections
  };

  const { isValid, errors: validationErrors } = ProductValidationRules.validateForm(validationData);
  
  setErrors(validationErrors);
  
  if (!isValid) {
    const errorMessages = Object.entries(validationErrors).map(([field, error]) => {
      const fieldNames: Record<string, string> = {
        'name': 'Product Name',
        'store_id': 'Store',
        'uom': 'Unit of Measure',
        'pricing.list_price': 'List Price',
        // ... add user-friendly field names
      };
      
      const friendlyFieldName = fieldNames[field] || field;
      return `${friendlyFieldName}: ${error}`;
    });
    
    showValidationError(
      `Please fix the following errors before saving the product: ${errorMessages.join('; ')}`,
      'product_form_validation',
      null,
      'required'
    );
  }

  return isValid;
};
```

### 5. Form Submission with Validation

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  try {
    // Your save logic here
    if (isEditing) {
      await productService.updateProduct(/* ... */);
      showSuccess(`Product "${formData.name}" updated successfully`);
    } else {
      await productService.createProduct(/* ... */);
      showSuccess(`Product "${formData.name}" created successfully`);
    }
    
    navigate('/products');
  } catch (error: any) {
    showError(error?.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
  }
};
```

## Validation Rules Reference

### Field Validation Methods

```typescript
// Core fields
ProductValidationRules.validateName(name: string)
ProductValidationRules.validateStoreId(storeId: string)
ProductValidationRules.validateUom(uom: string)
ProductValidationRules.validateListPrice(price: number)

// Optional fields
ProductValidationRules.validateDescription(description?: string)
ProductValidationRules.validateBrand(brand?: string)
ProductValidationRules.validateSalePrice(salePrice?: number, listPrice?: number)
ProductValidationRules.validateTareValue(tareValue?: number)

// Complex fields
ProductValidationRules.validateCategoryIds(categoryIds?: string[])
ProductValidationRules.validateTags(tags?: string[])
ProductValidationRules.validateImageUrl(imageUrl?: string)
ProductValidationRules.validateModifierGroups(modifierGroups?: any[])

// File validation
ProductValidationRules.validateImageFile(file: File)
ProductValidationRules.validateItemId(itemId: string)
```

### Complete Form Validation

```typescript
const { isValid, errors } = ProductValidationRules.validateForm(formData);
```

### Field-Specific Validation

```typescript
const validation = ProductValidationRules.validateField(fieldName, value, formData);
```

## Error Messages

### Sample Error Messages

- **Product Name**: "Product name is required", "Product name must be at least 2 characters long"
- **List Price**: "List price must be greater than 0", "List price can have at most 2 decimal places"
- **Sale Price**: "Sale price cannot exceed list price"
- **Categories**: "Cannot assign more than 10 categories to a product", "Duplicate categories are not allowed"
- **Tags**: "Cannot have more than 20 tags", "Each tag must be less than 50 characters"
- **Image URL**: "Invalid image URL format", "Image URL should point to a valid image file"

## Usage Examples

### Basic Product Form

```tsx
<InputTextField
  label="Product Name"
  required
  value={formData.name}
  onChange={(value) => handleInputChange('name', value)}
  error={errors.name}
  placeholder="Enter product name"
/>

<InputMoneyField
  label="List Price"
  required
  value={formData.pricing?.list_price || 0}
  onChange={(value) => handleInputChange('pricing.list_price', value)}
  error={errors['pricing.list_price']}
  placeholder="0.00"
/>
```

### Category Selection with Validation

```tsx
<MultipleDropdownSearch
  label="Categories"
  values={formData.attributes?.category_ids || []}
  options={categoryOptions}
  onSelect={(values) => handleArrayChange('attributes.category_ids', values)}
  placeholder="No categories selected"
  error={errors['attributes.category_ids']}
  allowSelectAll={true}
  maxSelectedDisplay={3}
/>
```

## Demo Page

Access the validation demo at `/product-validation-demo` to see:

- **Real-time validation** as you type
- **Complete form validation** with the "Validate Form" button
- **Sample data** to test different validation scenarios
- **Error states** for all field types
- **Success states** when validation passes

## Benefits

1. **Consistent Validation**: Same validation logic used across real-time and form submission
2. **User Experience**: Immediate feedback prevents submission errors
3. **Error Prevention**: Comprehensive validation catches edge cases
4. **Maintainable**: Centralized validation rules easy to update
5. **Extensible**: Easy to add new validation rules or field types
6. **Accessible**: Clear error messages improve accessibility
7. **Developer Friendly**: TypeScript interfaces and clear API

## Best Practices

1. **Use real-time validation** for immediate feedback
2. **Always validate on form submission** as a final check
3. **Provide clear, actionable error messages**
4. **Convert internal field names** to user-friendly names in error messages
5. **Use the error handling framework** for consistent user feedback
6. **Test edge cases** with the demo page
7. **Update validation rules** when business requirements change

## Testing

Use the ProductValidationDemo page to test:

- **Empty form submission** - should show all required field errors
- **Invalid data entry** - should show specific validation errors
- **Valid data entry** - should pass all validations
- **Edge cases** - test boundary values and special characters
- **Real-time feedback** - validation should trigger as you type

This validation system provides comprehensive, consistent, and user-friendly validation for all product forms in the application.
