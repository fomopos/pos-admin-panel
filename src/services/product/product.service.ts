import { apiClient } from '../api';
import type { ApiProduct, Product, ProductModifierGroup, ProductModifier } from '../types/product.types';
import { productModifierService } from './productModifier.service';
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
  modifier_groups?: ProductModifierGroup[];
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
  async getProduct(
    tenantId: string, 
    storeId: string, 
    itemId: string,
    options?: {
      includeModifierGroups?: boolean;
    }
  ): Promise<ApiProduct> {
    try {
      const params = new URLSearchParams();
      if (options?.includeModifierGroups) {
        params.append('include_modifier_groups', 'true');
      }
      
      const queryString = params.toString();
      const url = `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<ApiProduct>(url);
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
      // For new product creation, try to send everything in a single API call with nested modifiers
      // This optimizes for NoSQL databases where nested data is preferred
      
      // First, try the optimized single API call with nested modifier groups
      try {
        // Prepare clean data for nested creation (remove IDs that should be generated)
        const cleanedProductData = {
          ...productData,
          modifier_groups: productData.modifier_groups ? 
            this.prepareModifierGroupsForCreation(productData.modifier_groups) : []
        };
        
        const response = await apiClient.post<ApiProduct>(
          `/v0/tenant/${tenantId}/store/${storeId}/item?include_nested_modifiers=true`,
          cleanedProductData // Send complete data including cleaned modifier_groups
        );
        return response.data;
      } catch (error) {
        console.warn('Nested modifier creation not supported, falling back to separate API calls:', error);
        
        // Fallback: Use separate API calls for backward compatibility
        const { modifier_groups, ...productApiData } = productData;
        
        const response = await apiClient.post<ApiProduct>(
          `/v0/tenant/${tenantId}/store/${storeId}/item`,
          productApiData
        );
        
        // If modifier groups exist, save them after product creation
        if (modifier_groups && modifier_groups.length > 0) {
          await this.saveModifierGroups(tenantId, storeId, response.data.item_id, modifier_groups);
        }
        
        return response.data;
      }
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
      // Extract modifier groups before sending to API
      const { modifier_groups, ...productApiData } = productData;
      
      const response = await apiClient.put<ApiProduct>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}`,
        productApiData
      );
      
      // Save modifier groups after product update
      if (modifier_groups !== undefined) {
        await this.saveModifierGroups(tenantId, storeId, itemId, modifier_groups);
      }
      
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
      await apiClient.delete(`/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Convert API Product to internal Product format
   */
  async mapApiProductToProduct(apiProduct: ApiProduct, tenantId: string, storeId: string): Promise<Product> {
    // Use embedded modifier groups if available, otherwise fetch them separately
    let modifierGroups: ProductModifierGroup[] = [];
    
    if (apiProduct.modifier_groups) {
      // Use embedded modifier groups to avoid additional API calls
      modifierGroups = apiProduct.modifier_groups.map(group => ({
        group_id: group.group_id,
        item_id: group.item_id,
        name: group.name,
        selection_type: group.selection_type,
        exact_selections: group.exact_selections,
        max_selections: group.max_selections,
        min_selections: group.min_selections,
        required: group.required,
        sort_order: group.sort_order,
        price_delta: group.price_delta,
        modifiers: (group.modifiers || []).map(modifier => ({
          modifier_id: modifier.modifier_id,
          name: modifier.name,
          price_delta: modifier.price_delta,
          default_selected: modifier.default_selected,
          sort_order: modifier.sort_order
        }))
      }));
    } else {
      // Fallback: Load modifier groups with separate API calls (backward compatibility)
      try {
        const modifierGroupsResponse = await productModifierService.getModifierGroups(
          tenantId, 
          storeId, 
          apiProduct.item_id
        );
        // Map API modifier groups to internal format
        modifierGroups = await Promise.all(
          modifierGroupsResponse.items.map(async (group) => {
            const modifiersResponse = await productModifierService.getModifiers(
              tenantId, 
              storeId, 
              apiProduct.item_id, 
              group.group_id
            );
            return productModifierService.mapApiModifierGroupToInternal(group, modifiersResponse.items);
          })
        );
      } catch (error) {
        console.warn('Could not load modifier groups for product:', apiProduct.item_id, error);
        // Continue without modifier groups if they fail to load
      }
    }

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
      modifier_groups: modifierGroups,
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
      properties: product.attributes.properties,
      modifier_groups: product.modifier_groups || []
    };
  }

  /**
   * Save modifier groups for a product (create, update, delete as needed)
   */
  async saveModifierGroups(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    modifierGroups: ProductModifierGroup[]
  ): Promise<void> {
    try {
      // Get current modifier groups from API
      let existingGroups: ProductModifierGroup[] = [];
      try {
        const response = await productModifierService.getModifierGroups(tenantId, storeId, itemId);
        existingGroups = await Promise.all(
          response.items.map(async (group) => {
            const modifiersResponse = await productModifierService.getModifiers(
              tenantId, 
              storeId, 
              itemId, 
              group.group_id
            );
            return productModifierService.mapApiModifierGroupToInternal(group, modifiersResponse.items);
          })
        );
      } catch (error) {
        console.log('No existing modifier groups found, will create new ones');
      }

      // Determine which groups to create, update, or delete
      const existingGroupIds = existingGroups.map(g => g.group_id).filter(Boolean);
      const newGroupIds = modifierGroups.map(g => g.group_id).filter(Boolean);

      // Delete groups that are no longer present
      for (const existingGroup of existingGroups) {
        if (existingGroup.group_id && !newGroupIds.includes(existingGroup.group_id)) {
          await productModifierService.deleteModifierGroup(
            tenantId, 
            storeId, 
            itemId, 
            existingGroup.group_id
          );
        }
      }

      // Create or update modifier groups
      for (const group of modifierGroups) {
        if (group.group_id && existingGroupIds.includes(group.group_id)) {
          // Update existing group
          await productModifierService.updateModifierGroup(
            tenantId, 
            storeId, 
            itemId, 
            group.group_id,
            {
              group_id: group.group_id,
              name: group.name,
              selection_type: group.selection_type,
              exact_selections: group.exact_selections,
              max_selections: group.max_selections,
              min_selections: group.min_selections,
              required: group.required,
              sort_order: group.sort_order,
              price_delta: group.price_delta
            }
          );

          // Handle modifiers for this group
          await this.saveModifiersForGroup(tenantId, storeId, itemId, group);
        } else {
          // Create new group
          const createdGroup = await productModifierService.createModifierGroup(
            tenantId, 
            storeId, 
            itemId,
            {
              item_id: itemId,
              name: group.name,
              selection_type: group.selection_type,
              exact_selections: group.exact_selections,
              max_selections: group.max_selections,
              min_selections: group.min_selections,
              required: group.required,
              sort_order: group.sort_order,
              price_delta: group.price_delta
            }
          );

          // Create modifiers for the new group
          group.group_id = createdGroup.group_id;
          await this.saveModifiersForGroup(tenantId, storeId, itemId, group);
        }
      }
    } catch (error) {
      console.error('Error saving modifier groups:', error);
      throw new Error('Failed to save modifier groups');
    }
  }

  /**
   * Save modifiers for a specific group
   */
  private async saveModifiersForGroup(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    group: ProductModifierGroup
  ): Promise<void> {
    if (!group.group_id) return;

    try {
      // Get existing modifiers for this group
      let existingModifiers: ProductModifier[] = [];
      try {
        const response = await productModifierService.getModifiers(
          tenantId, 
          storeId, 
          itemId, 
          group.group_id
        );
        existingModifiers = response.items.map(m => productModifierService.mapApiModifierToInternal(m));
      } catch (error) {
        console.log('No existing modifiers found for group, will create new ones');
      }

      // Determine which modifiers to create, update, or delete
      const existingModifierIds = existingModifiers.map(m => m.modifier_id).filter(Boolean);
      const newModifierIds = group.modifiers.map(m => m.modifier_id).filter(Boolean);

      // Delete modifiers that are no longer present
      for (const existingModifier of existingModifiers) {
        if (existingModifier.modifier_id && !newModifierIds.includes(existingModifier.modifier_id)) {
          await productModifierService.deleteModifier(
            tenantId, 
            storeId, 
            itemId, 
            group.group_id, 
            existingModifier.modifier_id
          );
        }
      }

      // Create or update modifiers
      for (const modifier of group.modifiers) {
        if (modifier.modifier_id && existingModifierIds.includes(modifier.modifier_id)) {
          // Update existing modifier
          await productModifierService.updateModifier(
            tenantId, 
            storeId, 
            itemId, 
            group.group_id, 
            modifier.modifier_id,
            {
              modifier_id: modifier.modifier_id,
              name: modifier.name,
              price_delta: modifier.price_delta,
              default_selected: modifier.default_selected,
              sort_order: modifier.sort_order
            }
          );
        } else {
          // Create new modifier
          await productModifierService.createModifier(
            tenantId, 
            storeId, 
            itemId, 
            group.group_id,
            {
              group_id: group.group_id,
              name: modifier.name,
              price_delta: modifier.price_delta,
              default_selected: modifier.default_selected,
              sort_order: modifier.sort_order
            }
          );
        }
      }
    } catch (error) {
      console.error('Error saving modifiers for group:', group.group_id, error);
      throw new Error(`Failed to save modifiers for group ${group.name}`);
    }
  }

  /**
   * Prepare modifier groups for nested creation by removing IDs that should be generated by the API
   */
  private prepareModifierGroupsForCreation(modifierGroups: ProductModifierGroup[]): ProductModifierGroup[] {
    return modifierGroups.map(group => ({
      ...group,
      group_id: undefined, // Remove group_id so API generates new one
      modifiers: group.modifiers.map(modifier => ({
        ...modifier,
        modifier_id: undefined // Remove modifier_id so API generates new one
      }))
    }));
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
