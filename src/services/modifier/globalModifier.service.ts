import { apiClient } from '../api';
import type { 
  ProductModifierGroup, 
  ProductModifier 
} from '../types/product.types';

// API interfaces for global modifier operations
export interface ApiGlobalModifierGroup {
  group_id: string;
  store_id: string;
  name: string;
  description?: string;
  selection_type: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;
  max_selections?: number;
  min_selections?: number;
  required: boolean;
  sort_order: number;
  price_delta?: number;
  active: boolean;
  modifiers: ApiGlobalModifier[]; // Embedded modifiers in the group
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ApiGlobalModifier {
  modifier_id: string;
  name: string;
  description?: string;
  price_delta: number;
  default_selected: boolean;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGlobalModifierGroupRequest {
  store_id: string;
  name: string;
  description?: string;
  selection_type: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;
  max_selections?: number;
  min_selections?: number;
  required: boolean;
  sort_order: number;
  price_delta?: number;
  active?: boolean;
  modifiers?: CreateGlobalModifierRequest[]; // Include modifiers in group creation
}

export interface UpdateGlobalModifierGroupRequest {
  group_id: string;
  store_id?: string;
  name?: string;
  description?: string;
  selection_type?: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;
  max_selections?: number;
  min_selections?: number;
  required?: boolean;
  sort_order?: number;
  price_delta?: number;
  active?: boolean;
  modifiers?: (CreateGlobalModifierRequest | UpdateGlobalModifierRequest)[]; // Allow both create and update modifiers
}

export interface CreateGlobalModifierRequest {
  name: string;
  description?: string;
  price_delta: number;
  default_selected: boolean;
  sort_order: number;
  active?: boolean;
}

export interface UpdateGlobalModifierRequest extends Partial<CreateGlobalModifierRequest> {
  modifier_id: string;
}

export interface GlobalModifierGroupsResponse {
  items: ApiGlobalModifierGroup[];
  next: string | null;
  total_count?: number;
}

// Global Modifier Templates (for reusable modifier groups)
export interface GlobalModifierTemplate extends ProductModifierGroup {
  template_id?: string;
  store_id: string;
  description?: string;
  active?: boolean; // Whether the template is active
  usage_count?: number; // How many products use this template
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

class GlobalModifierService {
  // ===============================
  // GLOBAL MODIFIER GROUPS API METHODS
  // ===============================

  /**
   * Get all global modifier groups for a store
   */
  async getGlobalModifierGroups(
    _tenantId: string, 
    storeId: string,
    filters?: {
      active?: boolean;
      search?: string;
      page?: number;
      limit?: number;
      includeModifiers?: boolean; // Add option to include embedded modifiers
    }
  ): Promise<GlobalModifierGroupsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.includeModifiers) params.append('include_modifiers', 'true'); // Add parameter for embedded modifiers

      const queryString = params.toString();
      const url = `/v0/store/${storeId}/global-modifier-groups${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<GlobalModifierGroupsResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching global modifier groups:', error);
      throw new Error('Failed to fetch global modifier groups');
    }
  }

  /**
   * Get a single global modifier group by ID (includes modifiers)
   */
  async getGlobalModifierGroup(
    _tenantId: string, 
    storeId: string, 
    groupId: string
  ): Promise<ApiGlobalModifierGroup> {
    try {
      const response = await apiClient.get<ApiGlobalModifierGroup>(
        `/v0/store/${storeId}/global-modifier-groups/${groupId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching global modifier group:', error);
      throw new Error('Failed to fetch global modifier group');
    }
  }

  /**
   * Create a new global modifier group
   */
  async createGlobalModifierGroup(
    _tenantId: string, 
    storeId: string, 
    groupData: CreateGlobalModifierGroupRequest
  ): Promise<ApiGlobalModifierGroup> {
    try {
      const response = await apiClient.post<ApiGlobalModifierGroup>(
        `/v0/store/${storeId}/global-modifier-groups`,
        groupData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating global modifier group:', error);
      throw new Error('Failed to create global modifier group');
    }
  }

  /**
   * Update an existing global modifier group
   */
  async updateGlobalModifierGroup(
    _tenantId: string, 
    storeId: string, 
    groupId: string, 
    groupData: UpdateGlobalModifierGroupRequest
  ): Promise<ApiGlobalModifierGroup> {
    try {
      const response = await apiClient.put<ApiGlobalModifierGroup>(
        `/v0/store/${storeId}/global-modifier-groups/${groupId}`,
        groupData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating global modifier group:', error);
      throw new Error('Failed to update global modifier group');
    }
  }

  /**
   * Delete a global modifier group
   */
  async deleteGlobalModifierGroup(
    _tenantId: string, 
    storeId: string, 
    groupId: string
  ): Promise<void> {
    try {
      await apiClient.delete(
        `/v0/store/${storeId}/global-modifier-groups/${groupId}`
      );
    } catch (error) {
      console.error('Error deleting global modifier group:', error);
      throw new Error('Failed to delete global modifier group');
    }
  }

  // ===============================
  // TEMPLATE OPERATIONS
  // ===============================

  /**
   * Apply a global modifier group template to a product
   */
  async applyTemplateToProduct(
    _tenantId: string,
    storeId: string,
    templateGroupId: string,
    itemId: string
  ): Promise<void> {
    try {
      await apiClient.post(
        `/v0/store/${storeId}/global-modifier-groups/${templateGroupId}/apply-to-product`,
        { item_id: itemId }
      );
    } catch (error) {
      console.error('Error applying template to product:', error);
      throw new Error('Failed to apply template to product');
    }
  }

  /**
   * Get usage statistics for a global modifier group
   */
  async getTemplateUsageStats(
    _tenantId: string,
    storeId: string,
    groupId: string
  ): Promise<{
    usage_count: number;
    products: Array<{ item_id: string; name: string }>;
  }> {
    try {
      const response = await apiClient.get<{
        usage_count: number;
        products: Array<{ item_id: string; name: string }>;
      }>(
        `/v0/store/${storeId}/global-modifier-groups/${groupId}/usage`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching template usage stats:', error);
      throw new Error('Failed to fetch template usage stats');
    }
  }

  // ===============================
  // DATA MAPPING METHODS
  // ===============================

  /**
   * Convert API GlobalModifierGroup to internal ProductModifierGroup format
   */
  mapApiGlobalModifierGroupToInternal(
    apiGroup: ApiGlobalModifierGroup
  ): GlobalModifierTemplate {
    return {
      template_id: apiGroup.group_id,
      group_id: apiGroup.group_id,
      store_id: apiGroup.store_id,
      name: apiGroup.name,
      description: apiGroup.description,
      selection_type: apiGroup.selection_type,
      exact_selections: apiGroup.exact_selections,
      max_selections: apiGroup.max_selections,
      min_selections: apiGroup.min_selections,
      required: apiGroup.required,
      sort_order: apiGroup.sort_order,
      price_delta: apiGroup.price_delta,
      active: apiGroup.active,
      modifiers: (apiGroup.modifiers || []).map(modifier => this.mapApiGlobalModifierToInternal(modifier)),
      created_at: apiGroup.created_at,
      updated_at: apiGroup.updated_at,
      created_by: apiGroup.created_by,
      updated_by: apiGroup.updated_by
    };
  }

  /**
   * Convert API GlobalModifier to internal ProductModifier format
   */
  mapApiGlobalModifierToInternal(apiModifier: ApiGlobalModifier): ProductModifier {
    return {
      modifier_id: apiModifier.modifier_id,
      name: apiModifier.name,
      price_delta: apiModifier.price_delta,
      default_selected: apiModifier.default_selected,
      sort_order: apiModifier.sort_order
    };
  }

  /**
   * Convert internal GlobalModifierTemplate to API CreateGlobalModifierGroupRequest format
   */
  mapInternalToCreateGlobalGroupRequest(
    template: GlobalModifierTemplate, 
    storeId: string
  ): CreateGlobalModifierGroupRequest {
    return {
      store_id: storeId,
      name: template.name,
      description: template.description,
      selection_type: template.selection_type,
      exact_selections: template.exact_selections,
      max_selections: template.max_selections,
      min_selections: template.min_selections,
      required: template.required,
      sort_order: template.sort_order,
      price_delta: template.price_delta,
      active: true,
      modifiers: (template.modifiers || []).map(modifier => this.mapInternalToCreateGlobalModifierRequest(modifier))
    };
  }

  /**
   * Convert internal ProductModifier to API CreateGlobalModifierRequest format
   */
  mapInternalToCreateGlobalModifierRequest(
    modifier: ProductModifier
  ): CreateGlobalModifierRequest {
    return {
      name: modifier.name,
      price_delta: modifier.price_delta,
      default_selected: modifier.default_selected,
      sort_order: modifier.sort_order,
      active: true
    };
  }

  /**
   * Convert GlobalModifierTemplate to ProductModifierGroup for product use
   */
  convertTemplateToProductModifierGroup(template: GlobalModifierTemplate): ProductModifierGroup {
    return {
      group_id: undefined, // Will be assigned when applied to product
      name: template.name,
      selection_type: template.selection_type,
      exact_selections: template.exact_selections,
      max_selections: template.max_selections,
      min_selections: template.min_selections,
      required: template.required,
      sort_order: template.sort_order,
      price_delta: template.price_delta,
      modifiers: template.modifiers.map(modifier => ({
        modifier_id: undefined, // Will be assigned when applied to product
        name: modifier.name,
        price_delta: modifier.price_delta,
        default_selected: modifier.default_selected,
        sort_order: modifier.sort_order
      }))
    };
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Generate a unique global group ID
   */
  generateGlobalGroupId(): string {
    return 'global_group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate a unique global modifier ID
   */
  generateGlobalModifierId(): string {
    return 'global_mod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export const globalModifierService = new GlobalModifierService();
