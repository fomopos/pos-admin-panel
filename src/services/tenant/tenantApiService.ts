// Tenant and Store API service for real backend integration
import { apiClient, ApiError, USE_MOCK_DATA } from '../api';

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
  store_id: string;
  status: 'active' | 'inactive' | 'pending';
  store_name: string;
  description: string;
  location_type: string;
  store_type: string;
  address: {
    address1: string;
    address2?: string;
    address3?: string;
    address4?: string;
    city: string;
    state: string;
    district: string;
    area: string;
    postal_code: string;
    country: string;
    county: string;
  };
  locale: string;
  currency: string;
  latitude?: string;
  longitude?: string;
  telephone1?: string;
  telephone2?: string;
  telephone3?: string;
  telephone4?: string;
  email?: string;
  legal_entity_id?: string;
  legal_entity_name?: string;
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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode enabled but no mock data available');
        throw new ApiError('Mock data not available', 'NO_MOCK_DATA');
      }

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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode enabled but no mock data available');
        return { stores: [] };
      }

      // Real API call to the separate stores endpoint
      const response = await apiClient.get<TenantStoresApiResponse>(`/v1/tenant/${tenantId}/store`);
      
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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode enabled but no mock data available');
        throw new ApiError(`Tenant not found: ${tenantId}`, 'TENANT_NOT_FOUND');
      }

      // Real API call
      const response = await apiClient.get<TenantApiResponse>(`/tenants/${tenantId}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error fetching tenant details:', error);
      
      // No fallback data available
      throw new ApiError(`Tenant not found: ${tenantId}`, 'TENANT_NOT_FOUND');
    }
  }

  /**
   * Get details for a specific store
   * @param tenantId - The tenant ID
   * @param storeId - The store ID to fetch details for
   * @returns Promise with store details
   */
  async getStoreDetails(tenantId: string, storeId: string): Promise<StoreApiResponse> {
    try {
      console.log('🏪 Fetching store details:', { tenantId, storeId });
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode enabled but no mock data available');
        throw new ApiError(`Store not found: ${storeId}`, 'STORE_NOT_FOUND');
      }

      // Real API call
      const response = await apiClient.get<StoreApiResponse>(`/tenants/${tenantId}/stores/${storeId}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error fetching store details:', error);
      
      // No fallback data available
      throw new ApiError(`Store not found: ${storeId}`, 'STORE_NOT_FOUND');
    }
  }

  /**
   * Create a new store for a tenant
   * @param tenantId - The tenant ID to create store for
   * @param storeData - The store data to create
   * @returns Promise with created store details
   */
  async createStore(tenantId: string, storeData: Partial<StoreApiResponse>): Promise<StoreApiResponse> {
    try {
      console.log('🏪 Creating new store for tenant:', tenantId, storeData);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode enabled but store creation not supported without backend');
        throw new ApiError('Store creation requires real API backend', 'MOCK_CREATE_NOT_SUPPORTED');
      }

      // Real API call using the specified endpoint structure: POST /v1/store with X-Tenant-Id header
      const response = await apiClient.post<StoreApiResponse>('/v1/store', storeData, {
        headers: {
          'X-Tenant-Id': tenantId
        }
      });
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
