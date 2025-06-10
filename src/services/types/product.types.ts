// Product Types - Based on API response structure

export interface ProductPricing {
  list_price: number;
  sale_price?: number;
  tare_value?: number;
  tare_uom?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_discount_value?: number;
  max_discount_value?: number;
}

export interface ProductSettings {
  track_inventory: boolean;
  allow_backorder: boolean;
  require_serial: boolean;
  taxable: boolean;
  measure_required: boolean;
  non_inventoried: boolean;
  shippable: boolean;
  serialized: boolean;
  active: boolean;
  disallow_discount: boolean;
  online_only: boolean;
}

export interface ProductPrompts {
  prompt_qty: boolean;
  prompt_price: boolean;
  prompt_weight: number; // Weight threshold for prompting
  prompt_uom: boolean;
  prompt_description: boolean;
  prompt_cost: boolean;
  prompt_serial: boolean;
  prompt_lot: boolean;
  prompt_expiry: boolean;
}

export interface ProductAttributes {
  manufacturer?: string;
  model_number?: string;
  category_id?: string;
  tags?: string[];
  custom_attributes?: Record<string, any>;
  properties?: Record<string, any>;
}

export interface ProductMedia {
  image_url?: string;
}

// API Response Product structure - matches actual API response
export interface ApiProduct {
  item_id: string;
  tenant_id: string;
  store_id: string;
  name: string;
  description?: string;
  merch_level1?: string | null;
  merch_level2?: string | null;
  merch_level3?: string | null;
  merch_level4?: string | null;
  image_url?: string | null;
  list_price: number;
  sale_price?: number;
  measure_required?: boolean | null;
  parent_item_id?: string | null;
  non_inventoried?: boolean | null;
  brand?: string | null;
  serialized?: boolean | null;
  tax_group?: string;
  uom?: string | null;
  active?: boolean | null;
  categories?: string[];
  custom_attribute?: Record<string, any> | null;
  properties?: Record<string, any> | null;
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id?: string | null;
  // Additional API fields
  shippable?: boolean;
  fiscal_item_id?: string;
  fiscal_item_description?: string;
  disallow_discount?: boolean;
  prompt_qty?: boolean;
  prompt_price?: boolean;
  prompt_description?: boolean;
  non_returnable?: boolean;
  food_stamp_eligible?: boolean;
  stock_status?: string;
  tare_value?: number;
  tare_uom?: string | null;
  online_only?: boolean;
}

export interface Product {
  // Basic Information
  item_id?: string;
  store_id: string;
  name: string;
  description?: string;
  uom: string; // Unit of Measure
  brand?: string;
  tax_group?: string;
  fiscal_id?: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock' | 'on_order';

  // Nested structures
  pricing: ProductPricing;
  settings: ProductSettings;
  prompts: ProductPrompts;
  attributes: ProductAttributes;
  media: ProductMedia;

  // Audit Fields
  created_at?: string;
  create_user_id?: string;
  updated_at?: string;
  update_user_id?: string;
}

export interface CreateProductRequest {
  store_id: string;
  name: string;
  description?: string;
  uom: string;
  brand?: string;
  tax_group?: string;
  fiscal_id?: string;
  stock_status?: 'in_stock' | 'out_of_stock' | 'low_stock' | 'on_order';
  pricing: ProductPricing;
  settings: ProductSettings;
  prompts: ProductPrompts;
  attributes: ProductAttributes;
  media: ProductMedia;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  item_id: string;
}

// Legacy Product interface for backward compatibility
export interface LegacyProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  discount: number;
  tax: number;
  category: string;
  inventory: number;
  status: 'active' | 'inactive';
  image?: string;
  rating?: number;
  isFavorite?: boolean;
  soldCount?: number;
  brand?: string;
}

// Form validation types
export interface ProductFormErrors {
  [key: string]: string | undefined;
  name?: string;
  'pricing.list_price'?: string;
  uom?: string;
  store_id?: string;
  general?: string;
}

// Form data type for the product form
export interface ProductFormData extends Partial<Product> {
  // Additional form-only fields for UI state
  _tab?: string;
  _imagePreview?: string;
}

// Common dropdown options
export interface ProductDropdownOptions {
  uomOptions: Array<{ value: string; label: string }>;
  taxGroupOptions: Array<{ value: string; label: string }>;
  stockStatusOptions: Array<{ value: string; label: string }>;
  tareUomOptions: Array<{ value: string; label: string }>;
}

// Default values for new products
export const DEFAULT_PRODUCT_VALUES: Partial<Product> = {
  store_id: '',
  name: '',
  description: '',
  uom: 'EACH',
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
    custom_attributes: {},
    properties: {},
    tags: []
  },
  media: {
    image_url: ''
  }
};
