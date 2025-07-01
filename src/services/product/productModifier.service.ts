import { apiClient } from '../api';
import type { 
  ProductModifierGroup, 
  ProductModifier 
} from '../types/product.types';

// API interfaces for modifier operations
export interface ApiModifierGroup {
  group_id: string;
  item_id: string;
  name: string;
  selection_type: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;
  max_selections?: number;
  min_selections?: number;
  required: boolean;
  sort_order: number;
  price_delta?: number; // Base price adjustment for the entire group
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiModifier {
  modifier_id: string;
  group_id: string;
  name: string;
  price_delta: number;
  default_selected: boolean;
  sort_order: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateModifierGroupRequest {
  item_id: string;
  name: string;
  selection_type: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;
  max_selections?: number;
  min_selections?: number;
  required: boolean;
  sort_order: number;
  price_delta?: number; // Base price adjustment for the entire group
  active?: boolean;
}

export interface UpdateModifierGroupRequest extends Partial<CreateModifierGroupRequest> {
  group_id: string;
}

export interface CreateModifierRequest {
  group_id: string;
  name: string;
  price_delta: number;
  default_selected: boolean;
  sort_order: number;
  active?: boolean;
}

export interface UpdateModifierRequest extends Partial<CreateModifierRequest> {
  modifier_id: string;
}

export interface ModifierGroupsResponse {
  items: ApiModifierGroup[];
  next: string | null;
}

export interface ModifiersResponse {
  items: ApiModifier[];
  next: string | null;
}

class ProductModifierService {
  // ===============================
  // MODIFIER GROUPS API METHODS
  // ===============================

  /**
   * Get all modifier groups for a product
   */
  async getModifierGroups(
    tenantId: string, 
    storeId: string, 
    itemId: string
  ): Promise<ModifierGroupsResponse> {
    try {
      const response = await apiClient.get<ModifierGroupsResponse>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching modifier groups:', error);
      throw new Error('Failed to fetch modifier groups');
    }
  }

  /**
   * Get a single modifier group by ID
   */
  async getModifierGroup(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string
  ): Promise<ApiModifierGroup> {
    try {
      const response = await apiClient.get<ApiModifierGroup>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching modifier group:', error);
      throw new Error('Failed to fetch modifier group');
    }
  }

  /**
   * Create a new modifier group
   */
  async createModifierGroup(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupData: CreateModifierGroupRequest
  ): Promise<ApiModifierGroup> {
    try {
      const response = await apiClient.post<ApiModifierGroup>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups`,
        groupData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating modifier group:', error);
      throw new Error('Failed to create modifier group');
    }
  }

  /**
   * Update an existing modifier group
   */
  async updateModifierGroup(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string, 
    groupData: UpdateModifierGroupRequest
  ): Promise<ApiModifierGroup> {
    try {
      const response = await apiClient.put<ApiModifierGroup>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}`,
        groupData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating modifier group:', error);
      throw new Error('Failed to update modifier group');
    }
  }

  /**
   * Delete a modifier group
   */
  async deleteModifierGroup(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string
  ): Promise<void> {
    try {
      await apiClient.delete(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}`
      );
    } catch (error) {
      console.error('Error deleting modifier group:', error);
      throw new Error('Failed to delete modifier group');
    }
  }

  // ===============================
  // MODIFIERS API METHODS
  // ===============================

  /**
   * Get all modifiers for a modifier group
   */
  async getModifiers(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string
  ): Promise<ModifiersResponse> {
    try {
      const response = await apiClient.get<ModifiersResponse>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}/modifiers`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching modifiers:', error);
      throw new Error('Failed to fetch modifiers');
    }
  }

  /**
   * Get a single modifier by ID
   */
  async getModifier(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string, 
    modifierId: string
  ): Promise<ApiModifier> {
    try {
      const response = await apiClient.get<ApiModifier>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}/modifiers/${modifierId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching modifier:', error);
      throw new Error('Failed to fetch modifier');
    }
  }

  /**
   * Create a new modifier
   */
  async createModifier(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string, 
    modifierData: CreateModifierRequest
  ): Promise<ApiModifier> {
    try {
      const response = await apiClient.post<ApiModifier>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}/modifiers`,
        modifierData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating modifier:', error);
      throw new Error('Failed to create modifier');
    }
  }

  /**
   * Update an existing modifier
   */
  async updateModifier(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string, 
    modifierId: string, 
    modifierData: UpdateModifierRequest
  ): Promise<ApiModifier> {
    try {
      const response = await apiClient.put<ApiModifier>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}/modifiers/${modifierId}`,
        modifierData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating modifier:', error);
      throw new Error('Failed to update modifier');
    }
  }

  /**
   * Delete a modifier
   */
  async deleteModifier(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string, 
    modifierId: string
  ): Promise<void> {
    try {
      await apiClient.delete(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}/modifiers/${modifierId}`
      );
    } catch (error) {
      console.error('Error deleting modifier:', error);
      throw new Error('Failed to delete modifier');
    }
  }

  // ===============================
  // BULK OPERATIONS
  // ===============================

  /**
   * Create multiple modifier groups for a product
   */
  async createModifierGroupsBulk(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groups: CreateModifierGroupRequest[]
  ): Promise<ApiModifierGroup[]> {
    try {
      const response = await apiClient.post<ApiModifierGroup[]>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/bulk`,
        { groups }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating modifier groups in bulk:', error);
      throw new Error('Failed to create modifier groups in bulk');
    }
  }

  /**
   * Create multiple modifiers for a group
   */
  async createModifiersBulk(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string, 
    modifiers: CreateModifierRequest[]
  ): Promise<ApiModifier[]> {
    try {
      const response = await apiClient.post<ApiModifier[]>(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}/modifiers/bulk`,
        { modifiers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating modifiers in bulk:', error);
      throw new Error('Failed to create modifiers in bulk');
    }
  }

  /**
   * Update sort orders for modifier groups
   */
  async updateModifierGroupSortOrders(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    sortOrders: Array<{ group_id: string; sort_order: number }>
  ): Promise<void> {
    try {
      await apiClient.patch(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/sort-orders`,
        { sort_orders: sortOrders }
      );
    } catch (error) {
      console.error('Error updating modifier group sort orders:', error);
      throw new Error('Failed to update modifier group sort orders');
    }
  }

  /**
   * Update sort orders for modifiers within a group
   */
  async updateModifierSortOrders(
    tenantId: string, 
    storeId: string, 
    itemId: string, 
    groupId: string, 
    sortOrders: Array<{ modifier_id: string; sort_order: number }>
  ): Promise<void> {
    try {
      await apiClient.patch(
        `/v0/tenant/${tenantId}/store/${storeId}/item/${itemId}/modifier-groups/${groupId}/modifiers/sort-orders`,
        { sort_orders: sortOrders }
      );
    } catch (error) {
      console.error('Error updating modifier sort orders:', error);
      throw new Error('Failed to update modifier sort orders');
    }
  }

  // ===============================
  // DATA MAPPING METHODS
  // ===============================

  /**
   * Convert API ModifierGroup to internal ProductModifierGroup format
   */
  mapApiModifierGroupToInternal(apiGroup: ApiModifierGroup, modifiers: ApiModifier[] = []): ProductModifierGroup {
    return {
      group_id: apiGroup.group_id,
      name: apiGroup.name,
      selection_type: apiGroup.selection_type,
      exact_selections: apiGroup.exact_selections,
      max_selections: apiGroup.max_selections,
      min_selections: apiGroup.min_selections,
      required: apiGroup.required,
      sort_order: apiGroup.sort_order,
      price_delta: apiGroup.price_delta,
      modifiers: modifiers.map(modifier => this.mapApiModifierToInternal(modifier))
    };
  }

  /**
   * Convert API Modifier to internal ProductModifier format
   */
  mapApiModifierToInternal(apiModifier: ApiModifier): ProductModifier {
    return {
      modifier_id: apiModifier.modifier_id,
      name: apiModifier.name,
      price_delta: apiModifier.price_delta,
      default_selected: apiModifier.default_selected,
      sort_order: apiModifier.sort_order
    };
  }

  /**
   * Convert internal ProductModifierGroup to API CreateModifierGroupRequest format
   */
  mapInternalToCreateGroupRequest(group: ProductModifierGroup, itemId: string): CreateModifierGroupRequest {
    return {
      item_id: itemId,
      name: group.name,
      selection_type: group.selection_type,
      exact_selections: group.exact_selections,
      max_selections: group.max_selections,
      min_selections: group.min_selections,
      required: group.required,
      sort_order: group.sort_order,
      price_delta: group.price_delta,
      active: true
    };
  }

  /**
   * Convert internal ProductModifier to API CreateModifierRequest format
   */
  mapInternalToCreateModifierRequest(modifier: ProductModifier, groupId: string): CreateModifierRequest {
    return {
      group_id: groupId,
      name: modifier.name,
      price_delta: modifier.price_delta,
      default_selected: modifier.default_selected,
      sort_order: modifier.sort_order,
      active: true
    };
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Generate a unique group ID
   */
  generateGroupId(): string {
    return 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate a unique modifier ID
   */
  generateModifierId(): string {
    return 'mod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export const productModifierService = new ProductModifierService();
