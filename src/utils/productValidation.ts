// Product validation utilities
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  store_id: string;
  uom: string;
  brand?: string;
  tax_group?: string;
  fiscal_id?: string;
  stock_status?: 'in_stock' | 'out_of_stock' | 'low_stock' | 'on_order';
  pricing: {
    list_price: number;
    sale_price?: number;
    tare_value?: number;
    tare_uom?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    min_discount_value?: number;
    max_discount_value?: number;
  };
  settings?: {
    track_inventory?: boolean;
    allow_backorder?: boolean;
    require_serial?: boolean;
    taxable?: boolean;
    measure_required?: boolean;
    non_inventoried?: boolean;
    shippable?: boolean;
    serialized?: boolean;
    active?: boolean;
    disallow_discount?: boolean;
    online_only?: boolean;
  };
  prompts?: {
    prompt_qty?: boolean;
    prompt_price?: boolean;
    prompt_weight?: number;
    prompt_uom?: boolean;
    prompt_description?: boolean;
    prompt_cost?: boolean;
    prompt_serial?: boolean;
    prompt_lot?: boolean;
    prompt_expiry?: boolean;
  };
  attributes?: {
    manufacturer?: string;
    model_number?: string;
    category_ids?: string[];
    tags?: string[];
    custom_attributes?: Record<string, any>;
    properties?: Record<string, any>;
  };
  media?: {
    image_url?: string;
  };
  modifier_groups?: Array<{
    group_id?: string;
    name: string;
    selection_type: 'single' | 'multiple' | 'exact' | 'limited';
    exact_selections?: number;
    max_selections?: number;
    min_selections?: number;
    required: boolean;
    sort_order: number;
    price_delta?: number;
    modifiers: Array<{
      modifier_id?: string;
      name: string;
      price_delta: number;
      default_selected: boolean;
      sort_order: number;
    }>;
  }>;
}

export class ProductValidationRules {
  /**
   * Validate a specific field in the product form
   */
  static validateField(fieldName: string, value: any, formData: ProductFormData): ValidationResult {
    switch (fieldName) {
      case 'name':
        return this.validateName(value);
      case 'description':
        return this.validateDescription(value);
      case 'store_id':
        return this.validateStoreId(value);
      case 'uom':
        return this.validateUom(value);
      case 'brand':
        return this.validateBrand(value);
      case 'tax_group':
        return this.validateTaxGroup(value);
      case 'fiscal_id':
        return this.validateFiscalId(value);
      case 'stock_status':
        return this.validateStockStatus(value);
      case 'pricing.list_price':
        return this.validateListPrice(value);
      case 'pricing.sale_price':
        return this.validateSalePrice(value, formData.pricing?.list_price);
      case 'pricing.tare_value':
        return this.validateTareValue(value);
      case 'pricing.discount_value':
        return this.validateDiscountValue(value, formData.pricing?.discount_type);
      case 'pricing.min_discount_value':
        return this.validateMinDiscountValue(value, formData.pricing?.max_discount_value);
      case 'pricing.max_discount_value':
        return this.validateMaxDiscountValue(value, formData.pricing?.min_discount_value);
      case 'prompts.prompt_weight':
        return this.validatePromptWeight(value);
      case 'attributes.manufacturer':
        return this.validateManufacturer(value);
      case 'attributes.model_number':
        return this.validateModelNumber(value);
      case 'attributes.category_ids':
        return this.validateCategoryIds(value);
      case 'attributes.tags':
        return this.validateTags(value);
      case 'media.image_url':
        return this.validateImageUrl(value);
      case 'modifier_groups':
        return this.validateModifierGroups(value);
      default:
        return { isValid: true };
    }
  }

  /**
   * Validate product name
   */
  static validateName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Product name is required' };
    }

    if (name.trim().length < 2) {
      return { isValid: false, error: 'Product name must be at least 2 characters long' };
    }

    if (name.trim().length > 200) {
      return { isValid: false, error: 'Product name must be less than 200 characters' };
    }

    // Check for special characters (allow letters, numbers, spaces, hyphens, underscores, parentheses, and common punctuation)
    const validNamePattern = /^[a-zA-Z0-9\s\-_&().,'"!]+$/;
    if (!validNamePattern.test(name.trim())) {
      return { isValid: false, error: 'Product name contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate product description
   */
  static validateDescription(description?: string): ValidationResult {
    if (!description) {
      return { isValid: true }; // Description is optional
    }

    if (description.trim().length > 1000) {
      return { isValid: false, error: 'Description must be less than 1000 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate store ID
   */
  static validateStoreId(storeId: string): ValidationResult {
    if (!storeId || storeId.trim().length === 0) {
      return { isValid: false, error: 'Store selection is required' };
    }

    return { isValid: true };
  }

  /**
   * Validate unit of measure
   */
  static validateUom(uom: string): ValidationResult {
    if (!uom || uom.trim().length === 0) {
      return { isValid: false, error: 'Unit of measure is required' };
    }

    if (uom.trim().length > 20) {
      return { isValid: false, error: 'Unit of measure must be less than 20 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate brand
   */
  static validateBrand(brand?: string): ValidationResult {
    if (!brand) {
      return { isValid: true }; // Brand is optional
    }

    if (brand.trim().length > 100) {
      return { isValid: false, error: 'Brand must be less than 100 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate tax group
   */
  static validateTaxGroup(taxGroup?: string): ValidationResult {
    if (!taxGroup) {
      return { isValid: true }; // Tax group is optional
    }

    if (taxGroup.trim().length > 50) {
      return { isValid: false, error: 'Tax group must be less than 50 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate fiscal ID
   */
  static validateFiscalId(fiscalId?: string): ValidationResult {
    if (!fiscalId) {
      return { isValid: true }; // Fiscal ID is optional
    }

    if (fiscalId.trim().length > 50) {
      return { isValid: false, error: 'Fiscal ID must be less than 50 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate stock status
   */
  static validateStockStatus(stockStatus?: string): ValidationResult {
    const validStatuses = ['in_stock', 'out_of_stock', 'low_stock', 'on_order'];
    
    if (!stockStatus) {
      return { isValid: true }; // Stock status is optional, defaults to 'in_stock'
    }

    if (!validStatuses.includes(stockStatus)) {
      return { isValid: false, error: 'Invalid stock status' };
    }

    return { isValid: true };
  }

  /**
   * Validate list price
   */
  static validateListPrice(listPrice: number): ValidationResult {
    if (listPrice === undefined || listPrice === null) {
      return { isValid: false, error: 'List price is required' };
    }

    if (!Number.isFinite(listPrice)) {
      return { isValid: false, error: 'List price must be a valid number' };
    }

    if (listPrice < 0) {
      return { isValid: false, error: 'List price cannot be negative' };
    }

    if (listPrice === 0) {
      return { isValid: false, error: 'List price must be greater than 0' };
    }

    if (listPrice > 999999.99) {
      return { isValid: false, error: 'List price cannot exceed $999,999.99' };
    }

    // Check for reasonable decimal places (max 2)
    if (Number(listPrice.toFixed(2)) !== listPrice) {
      return { isValid: false, error: 'List price can have at most 2 decimal places' };
    }

    return { isValid: true };
  }

  /**
   * Validate sale price
   */
  static validateSalePrice(salePrice?: number, listPrice?: number): ValidationResult {
    if (salePrice === undefined || salePrice === null) {
      return { isValid: true }; // Sale price is optional
    }

    if (!Number.isFinite(salePrice)) {
      return { isValid: false, error: 'Sale price must be a valid number' };
    }

    if (salePrice < 0) {
      return { isValid: false, error: 'Sale price cannot be negative' };
    }

    if (salePrice > 999999.99) {
      return { isValid: false, error: 'Sale price cannot exceed $999,999.99' };
    }

    // Check for reasonable decimal places (max 2)
    if (Number(salePrice.toFixed(2)) !== salePrice) {
      return { isValid: false, error: 'Sale price can have at most 2 decimal places' };
    }

    // Sale price should not exceed list price
    if (listPrice && salePrice > listPrice) {
      return { isValid: false, error: 'Sale price cannot exceed list price' };
    }

    return { isValid: true };
  }

  /**
   * Validate tare value
   */
  static validateTareValue(tareValue?: number): ValidationResult {
    if (tareValue === undefined || tareValue === null) {
      return { isValid: true }; // Tare value is optional
    }

    if (!Number.isFinite(tareValue)) {
      return { isValid: false, error: 'Tare value must be a valid number' };
    }

    if (tareValue < 0) {
      return { isValid: false, error: 'Tare value cannot be negative' };
    }

    if (tareValue > 9999.99) {
      return { isValid: false, error: 'Tare value cannot exceed 9999.99' };
    }

    return { isValid: true };
  }

  /**
   * Validate discount value
   */
  static validateDiscountValue(discountValue?: number, discountType?: string): ValidationResult {
    if (discountValue === undefined || discountValue === null) {
      return { isValid: true }; // Discount value is optional
    }

    if (!Number.isFinite(discountValue)) {
      return { isValid: false, error: 'Discount value must be a valid number' };
    }

    if (discountValue < 0) {
      return { isValid: false, error: 'Discount value cannot be negative' };
    }

    if (discountType === 'percentage') {
      if (discountValue > 100) {
        return { isValid: false, error: 'Percentage discount cannot exceed 100%' };
      }
    } else if (discountType === 'fixed') {
      if (discountValue > 999999.99) {
        return { isValid: false, error: 'Fixed discount cannot exceed $999,999.99' };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate minimum discount value
   */
  static validateMinDiscountValue(minValue?: number, maxValue?: number): ValidationResult {
    if (minValue === undefined || minValue === null) {
      return { isValid: true }; // Min discount is optional
    }

    if (!Number.isFinite(minValue)) {
      return { isValid: false, error: 'Minimum discount must be a valid number' };
    }

    if (minValue < 0) {
      return { isValid: false, error: 'Minimum discount cannot be negative' };
    }

    if (maxValue && minValue > maxValue) {
      return { isValid: false, error: 'Minimum discount cannot exceed maximum discount' };
    }

    return { isValid: true };
  }

  /**
   * Validate maximum discount value
   */
  static validateMaxDiscountValue(maxValue?: number, minValue?: number): ValidationResult {
    if (maxValue === undefined || maxValue === null) {
      return { isValid: true }; // Max discount is optional
    }

    if (!Number.isFinite(maxValue)) {
      return { isValid: false, error: 'Maximum discount must be a valid number' };
    }

    if (maxValue < 0) {
      return { isValid: false, error: 'Maximum discount cannot be negative' };
    }

    if (minValue && maxValue < minValue) {
      return { isValid: false, error: 'Maximum discount cannot be less than minimum discount' };
    }

    return { isValid: true };
  }

  /**
   * Validate prompt weight
   */
  static validatePromptWeight(promptWeight?: number): ValidationResult {
    if (promptWeight === undefined || promptWeight === null) {
      return { isValid: true }; // Prompt weight is optional
    }

    if (!Number.isFinite(promptWeight)) {
      return { isValid: false, error: 'Prompt weight must be a valid number' };
    }

    if (promptWeight < 0) {
      return { isValid: false, error: 'Prompt weight cannot be negative' };
    }

    if (promptWeight > 9999.99) {
      return { isValid: false, error: 'Prompt weight cannot exceed 9999.99' };
    }

    return { isValid: true };
  }

  /**
   * Validate manufacturer
   */
  static validateManufacturer(manufacturer?: string): ValidationResult {
    if (!manufacturer) {
      return { isValid: true }; // Manufacturer is optional
    }

    if (manufacturer.trim().length > 100) {
      return { isValid: false, error: 'Manufacturer must be less than 100 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate model number
   */
  static validateModelNumber(modelNumber?: string): ValidationResult {
    if (!modelNumber) {
      return { isValid: true }; // Model number is optional
    }

    if (modelNumber.trim().length > 50) {
      return { isValid: false, error: 'Model number must be less than 50 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate category IDs
   */
  static validateCategoryIds(categoryIds?: string[]): ValidationResult {
    if (!categoryIds || categoryIds.length === 0) {
      return { isValid: true }; // Categories are optional
    }

    if (!Array.isArray(categoryIds)) {
      return { isValid: false, error: 'Category IDs must be an array' };
    }

    if (categoryIds.length > 10) {
      return { isValid: false, error: 'Cannot assign more than 10 categories to a product' };
    }

    for (const categoryId of categoryIds) {
      if (typeof categoryId !== 'string' || categoryId.trim().length === 0) {
        return { isValid: false, error: 'Invalid category ID' };
      }
    }

    // Check for duplicates
    const uniqueIds = new Set(categoryIds);
    if (uniqueIds.size !== categoryIds.length) {
      return { isValid: false, error: 'Duplicate categories are not allowed' };
    }

    return { isValid: true };
  }

  /**
   * Validate tags array
   */
  static validateTags(tags?: string[]): ValidationResult {
    if (!tags || tags.length === 0) {
      return { isValid: true }; // Tags are optional
    }

    if (!Array.isArray(tags)) {
      return { isValid: false, error: 'Tags must be an array' };
    }

    if (tags.length > 20) {
      return { isValid: false, error: 'Cannot have more than 20 tags' };
    }

    for (const tag of tags) {
      if (typeof tag !== 'string') {
        return { isValid: false, error: 'All tags must be text' };
      }

      if (tag.trim().length === 0) {
        return { isValid: false, error: 'Tags cannot be empty' };
      }

      if (tag.trim().length > 50) {
        return { isValid: false, error: 'Each tag must be less than 50 characters' };
      }

      // Check for valid tag characters
      const validTagPattern = /^[a-zA-Z0-9\s\-_]+$/;
      if (!validTagPattern.test(tag.trim())) {
        return { isValid: false, error: `Tag "${tag}" contains invalid characters` };
      }
    }

    // Check for duplicate tags
    const uniqueTags = new Set(tags.map(tag => tag.trim().toLowerCase()));
    if (uniqueTags.size !== tags.length) {
      return { isValid: false, error: 'Duplicate tags are not allowed' };
    }

    return { isValid: true };
  }

  /**
   * Validate image URL
   */
  static validateImageUrl(imageUrl?: string): ValidationResult {
    if (!imageUrl) {
      return { isValid: true }; // Image URL is optional
    }

    if (imageUrl.trim().length > 500) {
      return { isValid: false, error: 'Image URL must be less than 500 characters' };
    }

    // Basic URL format validation
    try {
      new URL(imageUrl);
    } catch {
      return { isValid: false, error: 'Invalid image URL format' };
    }

    // Check for common image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const hasValidExtension = imageExtensions.some(ext => 
      imageUrl.toLowerCase().includes(ext)
    );

    if (!hasValidExtension) {
      return { isValid: false, error: 'Image URL should point to a valid image file (jpg, png, gif, webp, svg, bmp)' };
    }

    return { isValid: true };
  }

  /**
   * Validate modifier groups
   */
  static validateModifierGroups(modifierGroups?: any[]): ValidationResult {
    if (!modifierGroups || modifierGroups.length === 0) {
      return { isValid: true }; // Modifier groups are optional
    }

    if (!Array.isArray(modifierGroups)) {
      return { isValid: false, error: 'Modifier groups must be an array' };
    }

    if (modifierGroups.length > 20) {
      return { isValid: false, error: 'Cannot have more than 20 modifier groups' };
    }

    for (let i = 0; i < modifierGroups.length; i++) {
      const group = modifierGroups[i];

      if (!group.name || group.name.trim().length === 0) {
        return { isValid: false, error: `Modifier group ${i + 1} name is required` };
      }

      if (group.name.trim().length > 100) {
        return { isValid: false, error: `Modifier group ${i + 1} name must be less than 100 characters` };
      }

      const validSelectionTypes = ['single', 'multiple', 'exact', 'limited'];
      if (!validSelectionTypes.includes(group.selection_type)) {
        return { isValid: false, error: `Modifier group ${i + 1} has invalid selection type` };
      }

      if (group.selection_type === 'exact' && (!group.exact_selections || group.exact_selections <= 0)) {
        return { isValid: false, error: `Modifier group ${i + 1} with 'exact' selection type must have exact_selections > 0` };
      }

      if (group.selection_type === 'limited' && (!group.max_selections || group.max_selections <= 0)) {
        return { isValid: false, error: `Modifier group ${i + 1} with 'limited' selection type must have max_selections > 0` };
      }

      if (!group.modifiers || !Array.isArray(group.modifiers) || group.modifiers.length === 0) {
        return { isValid: false, error: `Modifier group ${i + 1} must have at least one modifier` };
      }

      for (let j = 0; j < group.modifiers.length; j++) {
        const modifier = group.modifiers[j];

        if (!modifier.name || modifier.name.trim().length === 0) {
          return { isValid: false, error: `Modifier ${j + 1} in group ${i + 1} name is required` };
        }

        if (modifier.name.trim().length > 100) {
          return { isValid: false, error: `Modifier ${j + 1} in group ${i + 1} name must be less than 100 characters` };
        }

        if (modifier.price_delta !== undefined && !Number.isFinite(modifier.price_delta)) {
          return { isValid: false, error: `Modifier ${j + 1} in group ${i + 1} price delta must be a valid number` };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Validate the entire form
   */
  static validateForm(formData: ProductFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Core required fields
    const coreFields = [
      'name',
      'store_id',
      'uom',
      'pricing.list_price'
    ];

    for (const field of coreFields) {
      const validation = this.validateField(field, this.getNestedValue(formData, field), formData);
      if (!validation.isValid) {
        errors[field] = validation.error || 'Invalid value';
        isValid = false;
      }
    }

    // Optional fields that should be validated if present
    const optionalFields = [
      'description',
      'brand',
      'tax_group',
      'fiscal_id',
      'stock_status',
      'pricing.sale_price',
      'pricing.tare_value',
      'pricing.discount_value',
      'pricing.min_discount_value',
      'pricing.max_discount_value',
      'prompts.prompt_weight',
      'attributes.manufacturer',
      'attributes.model_number',
      'attributes.category_ids',
      'attributes.tags',
      'media.image_url',
      'modifier_groups'
    ];

    for (const field of optionalFields) {
      const value = this.getNestedValue(formData, field);
      if (value !== undefined && value !== null && value !== '') {
        const validation = this.validateField(field, value, formData);
        if (!validation.isValid) {
          errors[field] = validation.error || 'Invalid value';
          isValid = false;
        }
      }
    }

    return { isValid, errors };
  }

  /**
   * Helper function to get nested values from form data
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate file uploads for product images
   */
  static validateImageFile(file: File): ValidationResult {
    // Check file size (max 10MB for product images)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return { isValid: false, error: 'Product image must be smaller than 10MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Product image must be JPEG, PNG, GIF, or WebP format' };
    }

    return { isValid: true };
  }

  /**
   * Validate product SKU/Item ID format
   */
  static validateItemId(itemId: string): ValidationResult {
    if (!itemId || itemId.trim().length === 0) {
      return { isValid: false, error: 'Product SKU/Item ID is required' };
    }

    if (itemId.trim().length > 50) {
      return { isValid: false, error: 'Product SKU/Item ID must be less than 50 characters' };
    }

    // Check for valid SKU characters (letters, numbers, hyphens, underscores)
    const validSkuPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!validSkuPattern.test(itemId.trim())) {
      return { isValid: false, error: 'Product SKU/Item ID can only contain letters, numbers, hyphens, and underscores' };
    }

    return { isValid: true };
  }
}
