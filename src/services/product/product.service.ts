import { apiClient } from '../api';
import type { ApiProduct, Product } from '../types/product.types';

export interface ProductsResponse {
  items: ApiProduct[];
  next: string | null;
}

export interface CreateProductRequest {
  item_id: string;
  store_id: string;
  name: string;
  description?: string;
  image_url?: string;
  list_price: number;
  sale_price?: number;
  measure_required?: boolean;
  parent_item_id?: string | null;
  non_inventoried?: boolean;
  shippable?: boolean;
  brand?: string;
  serialized?: boolean;
  tax_group?: string;
  fiscal_item_id?: string;
  fiscal_item_description?: string;
  uom?: string;
  active?: boolean;
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
  custom_attribute?: Record<string, any>;
  properties?: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  item_id: string;
}

class ProductService {
  /**
   * Get all products for a store
   */
  async getProducts(tenantId: string, storeId: string): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get<ProductsResponse>(
        `/v0/tenant/${tenantId}/store/${storeId}/item`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(tenantId: string, storeId: string, itemId: string): Promise<ApiProduct> {
    try {
      const response = await apiClient.get<ApiProduct>(
        `/v1/tenant/${tenantId}/store/${storeId}/item/${itemId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Create a new product
   */
  async createProduct(tenantId: string, storeId: string, productData: CreateProductRequest): Promise<ApiProduct> {
    try {
      const response = await apiClient.post<ApiProduct>(
        `/v0/tenant/${tenantId}/store/${storeId}/item`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(tenantId: string, storeId: string, itemId: string, productData: UpdateProductRequest): Promise<ApiProduct> {
    try {
      const response = await apiClient.put<ApiProduct>(
        `/v1/tenant/${tenantId}/store/${storeId}/item/${itemId}`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(tenantId: string, storeId: string, itemId: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/tenant/${tenantId}/store/${storeId}/item/${itemId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Convert API Product to internal Product format
   */
  mapApiProductToProduct(apiProduct: ApiProduct): Product {
    return {
      item_id: apiProduct.item_id,
      store_id: apiProduct.store_id,
      name: apiProduct.name,
      description: apiProduct.description || '',
      uom: apiProduct.uom || '',
      brand: apiProduct.brand || '',
      tax_group: apiProduct.tax_group || '',
      fiscal_id: apiProduct.fiscal_item_id || '',
      stock_status: this.mapStockStatus(apiProduct.stock_status),
      pricing: {
        list_price: apiProduct.list_price,
        sale_price: apiProduct.sale_price || 0,
        tare_value: apiProduct.tare_value || 0,
        tare_uom: apiProduct.tare_uom || '',
        discount_type: 'percentage',
        discount_value: 0,
        min_discount_value: 0,
        max_discount_value: 0
      },
      settings: {
        track_inventory: !apiProduct.non_inventoried,
        allow_backorder: false,
        require_serial: apiProduct.serialized || false,
        taxable: true,
        measure_required: apiProduct.measure_required || false,
        non_inventoried: apiProduct.non_inventoried || false,
        shippable: apiProduct.shippable || true,
        serialized: apiProduct.serialized || false,
        active: apiProduct.active !== false,
        disallow_discount: apiProduct.disallow_discount || false,
        online_only: apiProduct.online_only || false
      },
      prompts: {
        prompt_qty: apiProduct.prompt_qty || false,
        prompt_price: apiProduct.prompt_price || false,
        prompt_weight: 0,
        prompt_uom: false,
        prompt_description: apiProduct.prompt_description || false,
        prompt_cost: false,
        prompt_serial: false,
        prompt_lot: false,
        prompt_expiry: false
      },
      attributes: {
        manufacturer: apiProduct.brand || '',
        model_number: '',
        category_id: apiProduct.categories?.[0] || '',
        tags: apiProduct.categories || [],
        custom_attributes: apiProduct.custom_attribute || {},
        properties: apiProduct.properties || {}
      },
      media: {
        image_url: apiProduct.image_url || ''
      },
      created_at: apiProduct.created_at,
      create_user_id: apiProduct.create_user_id,
      updated_at: apiProduct.updated_at,
      update_user_id: apiProduct.update_user_id || undefined
    };
  }

  /**
   * Convert internal Product to API CreateProductRequest format
   */
  mapProductToCreateRequest(product: Product): CreateProductRequest {
    return {
      item_id: product.item_id || this.generateItemId(),
      store_id: product.store_id,
      name: product.name,
      description: product.description,
      image_url: product.media.image_url,
      list_price: product.pricing.list_price,
      sale_price: product.pricing.sale_price,
      measure_required: product.settings.measure_required,
      parent_item_id: null,
      non_inventoried: product.settings.non_inventoried,
      shippable: product.settings.shippable,
      brand: product.brand,
      serialized: product.settings.serialized,
      tax_group: product.tax_group,
      fiscal_item_id: product.fiscal_id,
      fiscal_item_description: product.description,
      uom: product.uom,
      active: product.settings.active,
      disallow_discount: product.settings.disallow_discount,
      prompt_qty: product.prompts.prompt_qty,
      prompt_price: product.prompts.prompt_price,
      prompt_description: product.prompts.prompt_description,
      non_returnable: false,
      food_stamp_eligible: false,
      stock_status: product.stock_status,
      tare_value: product.pricing.tare_value,
      tare_uom: product.pricing.tare_uom,
      online_only: product.settings.online_only,
      custom_attribute: product.attributes.custom_attributes,
      properties: product.attributes.properties
    };
  }

  /**
   * Map stock status from API to internal format
   */
  private mapStockStatus(status?: string): 'in_stock' | 'out_of_stock' | 'low_stock' | 'on_order' {
    switch (status) {
      case 'in_stock':
        return 'in_stock';
      case 'out_of_stock':
        return 'out_of_stock';
      case 'low_stock':
        return 'low_stock';
      case 'on_order':
        return 'on_order';
      default:
        return 'in_stock';
    }
  }

  /**
   * Generate a unique item ID
   */
  private generateItemId(): string {
    return 'ITEM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export const productService = new ProductService();
