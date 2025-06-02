import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tenantApiService } from '../services/tenant/tenantApiService';
import type { TenantApiResponse, StoreApiResponse } from '../services/tenant/tenantApiService';

export interface Address {
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
  county?: string;
}

export interface Terminal {
  terminal_id: string;
  device_id: string;
  status: 'active' | 'inactive';
  platform: string;
  model: string;
  arch: string;
  name: string;
}

export interface StoreTiming {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  Holidays: string;
}

// Tenant represents the top-level organization
export interface Tenant {
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
  properties?: any;
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id?: string;
}

// Store belongs to a tenant
export interface Store {
  tenant_id: string; // Reference to parent tenant ID
  store_id: string;
  status: 'active' | 'inactive' | 'pending'; // Updated to match API response
  store_name: string;
  description?: string;
  location_type: string;
  store_type: string;
  address: Address;
  locale: string;
  currency: string;
  latitude?: string;
  longitude?: string;
  telephone1?: string;
  telephone2?: string;
  telephone3?: string;
  telephone4?: string;
  email?: string;
  store_timing?: StoreTiming;
  terminals?: Record<string, Terminal>;
  properties?: any;
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id?: string;
}

// Combined structure for easy access
export interface TenantWithStores extends Tenant {
  stores: Store[];
}

// Data transformation utilities
const transformApiStoreToStore = (apiStore: StoreApiResponse): Store => {
  return {
    tenant_id: apiStore.tenant_id,
    store_id: apiStore.store_id,
    status: apiStore.status,
    store_name: apiStore.store_name,
    description: apiStore.description,
    location_type: apiStore.location_type,
    store_type: apiStore.store_type,
    address: {
      address1: apiStore.address.address1,
      address2: apiStore.address.address2,
      address3: apiStore.address.address3,
      address4: apiStore.address.address4,
      city: apiStore.address.city,
      state: apiStore.address.state,
      district: apiStore.address.district,
      area: apiStore.address.area,
      postal_code: apiStore.address.postal_code,
      country: apiStore.address.country,
      county: apiStore.address.county,
    },
    locale: apiStore.locale,
    currency: apiStore.currency,
    latitude: apiStore.latitude,
    longitude: apiStore.longitude,
    telephone1: apiStore.telephone1,
    telephone2: apiStore.telephone2,
    telephone3: apiStore.telephone3,
    telephone4: apiStore.telephone4,
    email: apiStore.email,
    store_timing: apiStore.store_timing,
    terminals: apiStore.terminals || {},
    properties: apiStore.properties,
    created_at: apiStore.created_at,
    create_user_id: apiStore.create_user_id,
    updated_at: apiStore.updated_at,
    update_user_id: apiStore.update_user_id,
  };
};

const transformApiTenantToTenant = (apiTenant: TenantApiResponse): Tenant => {
  return {
    id: apiTenant.id,
    name: apiTenant.name,
    contact_email: apiTenant.contact_email,
    contact_phone: apiTenant.contact_phone,
    status: apiTenant.status,
    plan_id: apiTenant.plan_id,
    settings: apiTenant.settings,
    properties: apiTenant.properties,
    created_at: apiTenant.created_at,
    create_user_id: apiTenant.create_user_id,
    updated_at: apiTenant.updated_at,
    update_user_id: undefined, // API doesn't provide this
  };
};

const transformApiTenantToTenantWithStores = (apiTenant: TenantApiResponse, stores: StoreApiResponse[] = []): TenantWithStores => {
  return {
    ...transformApiTenantToTenant(apiTenant),
    stores: stores.map(transformApiStoreToStore),
  };
};

interface TenantState {
  tenants: TenantWithStores[];
  currentTenant: Tenant | null;
  currentStore: Store | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTenants: (tenants: TenantWithStores[]) => void;
  setCurrentTenant: (tenant: Tenant | null) => void;
  setCurrentStore: (store: Store | null) => void;
  switchTenant: (tenantId: string) => void;
  switchStore: (storeId: string) => void;
  fetchTenants: (userId: string, clearSelections?: boolean) => Promise<void>;
  fetchStoresForTenant: (tenantId: string) => Promise<void>;
  createStore: (tenantId: string, storeData: Partial<Store>) => Promise<void>;
  getTenantStores: (tenantId: string) => Store[];
  getCurrentTenantStores: () => Store[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelection: () => void;
  clearAllData: () => void;
}

// Store state with duplicate call prevention
let isCurrentlyFetching = false;

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenants: [],
      currentTenant: null,
      currentStore: null,
      isLoading: false,
      error: null,

      setTenants: (tenants) => set({ tenants }),

      setCurrentTenant: (tenant) => {
        set({ 
          currentTenant: tenant,
          currentStore: null // Reset store when switching tenant
        });
      },

      setCurrentStore: (store) => set({ currentStore: store }),

      switchTenant: (tenantId) => {
        const { tenants } = get();
        const tenant = tenants.find((t) => t.id === tenantId);
        if (tenant) {
          set({ 
            currentTenant: tenant,
            currentStore: null // Reset store when switching tenant
          });
        }
      },

      switchStore: (storeId) => {
        const { tenants, currentTenant } = get();
        if (!currentTenant) return;
        
        const tenant = tenants.find((t) => t.id === currentTenant.id);
        if (tenant) {
          const store = tenant.stores.find((s) => s.store_id === storeId);
          if (store) {
            set({ currentStore: store });
          }
        }
      },

      getTenantStores: (tenantId) => {
        const { tenants } = get();
        const tenant = tenants.find((t) => t.id === tenantId);
        return tenant?.stores || [];
      },

      getCurrentTenantStores: () => {
        const { tenants, currentTenant } = get();
        if (!currentTenant) return [];
        const tenant = tenants.find((t) => t.id === currentTenant.id);
        return tenant?.stores || [];
      },

      fetchTenants: async (userId, clearSelections = false) => {
        // Prevent duplicate calls
        if (isCurrentlyFetching) {
          console.log('⚠️ fetchTenants already in progress, skipping duplicate call');
          return;
        }
        
        const callId = Math.random().toString(36).substr(2, 9);
        console.log(`🚀 [${callId}] fetchTenants called:`, {
          userId,
          clearSelections,
          timestamp: new Date().toISOString(),
          stackTrace: new Error().stack?.split('\n').slice(1, 5)
        });
        
        isCurrentlyFetching = true;
        set({ isLoading: true, error: null });
        
        try {
          console.log(`🔄 [${callId}] Fetching tenants (without stores) using API service for user:`, userId);
          
          // Use the tenant API service to fetch tenants only (no stores)
          const response = await tenantApiService.getUserTenants(userId);
          
          console.log('📦 Raw API response structure:', response);
          console.log('📦 Response tenants array:', response.tenants);
          
          // Transform API response to store format (tenants without stores initially)
          const transformedTenants: TenantWithStores[] = response.tenants.map(tenant => 
            transformApiTenantToTenantWithStores(tenant, [])
          );
          
          console.log(`✅ [${callId}] Successfully fetched and transformed tenants:`, transformedTenants);
          
          // Get current state to preserve selections if needed
          const { currentTenant, currentStore } = get();
          
          set({ 
            tenants: transformedTenants, 
            currentTenant: clearSelections ? null : currentTenant, // Only clear if explicitly requested
            currentStore: clearSelections ? null : currentStore, // Only clear if explicitly requested
            isLoading: false 
          });
          
          console.log(`🏁 [${callId}] fetchTenants completed successfully`);
        } catch (error) {
          console.error(`❌ [${callId}] Error in fetchTenants:`, error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tenants',
            isLoading: false 
          });
        } finally {
          isCurrentlyFetching = false;
        }
      },

      fetchStoresForTenant: async (tenantId) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🏪 Fetching stores for tenant:', tenantId);
          
          // Use the tenant API service to fetch stores for the specific tenant
          const response = await tenantApiService.getTenantStores(tenantId);
          
          console.log('📦 Stores API response:', response);
          
          // Transform stores
          const transformedStores = response.stores.map(transformApiStoreToStore);
          
          // Update the specific tenant with its stores
          const { tenants } = get();
          const updatedTenants = tenants.map(tenant => {
            if (tenant.id === tenantId) {
              return {
                ...tenant,
                stores: transformedStores
              };
            }
            return tenant;
          });
          
          console.log('✅ Successfully fetched and added stores to tenant:', tenantId);
          
          set({ 
            tenants: updatedTenants,
            isLoading: false 
          });
        } catch (error) {
          console.error('❌ Error in fetchStoresForTenant:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch stores',
            isLoading: false 
          });
        }
      },

      createStore: async (tenantId, storeData) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🏪 Creating store using API service for tenant:', tenantId, storeData);
          
          // Transform store data to API format if needed
          const apiStoreData: Partial<StoreApiResponse> = {
            store_name: storeData.store_name || 'New Store',
            description: storeData.description || '',
            location_type: storeData.location_type || 'retail',
            store_type: storeData.store_type || 'general',
            address: storeData.address ? {
              address1: storeData.address.address1 || '',
              address2: storeData.address.address2,
              address3: storeData.address.address3,
              address4: storeData.address.address4,
              city: storeData.address.city || '',
              state: storeData.address.state || '',
              district: storeData.address.district || '',
              area: storeData.address.area || '',
              postal_code: storeData.address.postal_code || '',
              country: storeData.address.country || 'India',
              county: storeData.address.county || '',
            } : {
              address1: '',
              city: '',
              state: '',
              district: '',
              area: '',
              postal_code: '',
              country: 'India',
              county: '',
            },
            locale: storeData.locale || 'en-IN',
            currency: storeData.currency || 'INR',
            latitude: storeData.latitude,
            longitude: storeData.longitude,
            telephone1: storeData.telephone1,
            telephone2: storeData.telephone2,
            telephone3: storeData.telephone3,
            telephone4: storeData.telephone4,
            email: storeData.email,
            store_timing: storeData.store_timing || {
              Monday: "09:00-18:00",
              Tuesday: "09:00-18:00",
              Wednesday: "09:00-18:00",
              Thursday: "09:00-18:00",
              Friday: "09:00-18:00",
              Saturday: "09:00-18:00",
              Sunday: "10:00-17:00",
              Holidays: "Closed"
            }
          };

          // Use the tenant API service to create the store
          const apiResponse = await tenantApiService.createStore(tenantId, apiStoreData);
          
          // Transform API response to store format
          const newStore = transformApiStoreToStore(apiResponse);
          
          console.log('✅ Successfully created store:', newStore);

          const { tenants } = get();
          const updatedTenants = tenants.map(tenant => {
            if (tenant.id === tenantId) {
              return {
                ...tenant,
                stores: [...tenant.stores, newStore]
              };
            }
            return tenant;
          });

          set({ 
            tenants: updatedTenants,
            currentStore: newStore,
            isLoading: false 
          });
        } catch (error) {
          console.error('❌ Error in createStore:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create store',
            isLoading: false 
          });
        }
      },

      clearSelection: () => {
        set({ 
          currentTenant: null,
          currentStore: null 
        });
      },

      clearAllData: () => {
        console.log('🧹 Clearing all tenant store data on logout');
        set({ 
          tenants: [],
          currentTenant: null,
          currentStore: null,
          isLoading: false,
          error: null
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        currentStore: state.currentStore,
        tenants: state.tenants,
      }),
    }
  )
);

export default useTenantStore;
