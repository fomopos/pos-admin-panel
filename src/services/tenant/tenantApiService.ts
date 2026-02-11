// Tenant and Store API service for real backend integration
import { apiClient, ApiError } from '../api';

// Types for API integration (matching backend schema)
export interface TenantApiResponse {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  status: 'created' | 'active' | 'suspended' | 'inactive';
  plan_id: string;
  settings: {
    max_users: number;
    features: string[];
    custom_configs: Record<string, any>;
  };
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id?: string;
  properties?: any;
}

export interface StoreApiResponse {
  tenant_id: string;
  store_id: string | null;
  status: 'active' | 'inactive' | 'pending';
  billing_plan?: 'free' | 'starter' | 'pro';
  pending_plan?: 'free' | 'starter' | 'pro' | null;
  downgrade_effective_at?: string | null;
  plan_activated_at?: string | null;
  store_name: string;
  description: string | null;
  location_type: string;
  store_type: string;
  address: {
    address1: string | null;
    address2?: string | null;
    address3?: string | null;
    address4?: string | null;
    city: string | null;
    state: string | null;
    district: string | null;
    area: string | null;
    postal_code: string | null;
    country: string;
    county: string | null;
  };
  locale: string;
  timezone?: string;
  currency: string;
  latitude?: string | null;
  longitude?: string | null;
  telephone1?: string | null;
  telephone2?: string | null;
  telephone3?: string | null;
  telephone4?: string | null;
  email?: string | null;
  legal_entity_id?: string | null;
  legal_entity_name?: string | null;
  store_timing?: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
    Holidays: string;
  };
  terminals?: Record<string, {
    terminal_id: string;
    device_id: string;
    status: 'active' | 'inactive';
    platform: string;
    model: string;
    arch: string;
    name: string;
  }>;
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id?: string;
  properties?: any;
}

// Response for getting user tenants (without stores)
export interface UserTenantsApiResponse {
  tenants: TenantApiResponse[];
  total_count: number;
  user_id: string;
}

// Response for getting stores for a tenant
export interface TenantStoresApiResponse {
  stores: StoreApiResponse[];
  total_count?: number;
}

class TenantApiService {
  /**
   * Fetch all tenants for a given user with their stores
   * @param userId - The user ID to fetch tenants for
   * @returns Promise with user tenants and stores
   */
  async getUserTenants(userId: string): Promise<UserTenantsApiResponse> {
    try {
      console.log('🔍 Fetching tenants for user:', userId);

      // Real API call using the API client
      const response = await apiClient.get<UserTenantsApiResponse>(`/v0/tenant`);

      console.log('✅ Successfully fetched tenants from API:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Error fetching tenants from API:', error);

      // Don't return empty data on API failures - let the error bubble up
      // The calling code should handle the error appropriately
      throw error;
    }
  }

  /**
   * Get stores for a specific tenant
   * @param tenantId - The tenant ID to fetch stores for
   * @returns Promise with tenant stores response
   */
  async getTenantStores(tenantId: string): Promise<TenantStoresApiResponse> {
    try {
      console.log('🏪 Fetching stores for tenant:', tenantId);

      // Real API call using the updated Store API endpoint
      const response = await apiClient.get<TenantStoresApiResponse>(`/v0/store`);

      console.log('✅ Successfully fetched stores from API:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Error fetching stores from API:', error);

      // Don't return empty data on API failures - let the error bubble up
      // The calling code should handle the error appropriately
      throw error;
    }
  }

  /**
   * Get details for a specific tenant
   * @param tenantId - The tenant ID to fetch details for
   * @returns Promise with tenant details
   */
  async getTenantDetails(tenantId: string): Promise<TenantApiResponse> {
    try {
      console.log('🏢 Fetching tenant details:', tenantId);

      // Real API call
      const response = await apiClient.get<TenantApiResponse>(`/tenants/${tenantId}`);
      return response.data;

    } catch (error) {
      console.error('❌ Error fetching tenant details:', error);

      // No fallback data available
      throw new ApiError(`Tenant not found: ${tenantId}`, 1001, 'TENANT_NOT_FOUND');
    }
  }

  /**
   * Get a specific store by ID
   * @param tenantId - The tenant ID (for compatibility, but not used in new API)
   * @param storeId - The store ID to fetch
   * @returns Promise with store data
   */
  async getStore(tenantId: string, storeId: string): Promise<StoreApiResponse> {
    try {
      console.log('🏪 Fetching store:', { tenantId, storeId });

      // Real API call using the updated Store API endpoint
      const response = await apiClient.get<StoreApiResponse>(`/v0/store/${storeId}`);

      console.log('✅ Successfully fetched store from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching store:', error);
      throw error;
    }
  }

  /**
   * Create a new store
   * @param storeData - The store data to create
   * @returns Promise with created store details
   */
  async createStore(storeData: Partial<StoreApiResponse>): Promise<StoreApiResponse> {
    try {
      console.log('🏪 Creating new store:', storeData);

      const response = await apiClient.post<StoreApiResponse>(`/v0/store`, storeData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating store:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tenantApiService = new TenantApiService();

// Export for convenience
export default tenantApiService;
