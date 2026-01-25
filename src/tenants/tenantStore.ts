import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tenantApiService } from '../services/tenant/tenantApiService';
import type { TenantApiResponse, StoreApiResponse } from '../services/tenant/tenantApiService';
import { useErrorHandler } from '../services/errorHandler';

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
  timezone?: string;
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
    tenant_id: apiStore.tenant_id || '',
    store_id: apiStore.store_id || '',
    status: apiStore.status || 'inactive',
    store_name: apiStore.store_name || 'Unnamed Store',
    description: apiStore.description || undefined,
    location_type: apiStore.location_type || 'retail',
    store_type: apiStore.store_type || 'general',
    address: apiStore.address ? {
      address1: apiStore.address.address1 || '',
      address2: apiStore.address.address2 || undefined,
      address3: apiStore.address.address3 || undefined,
      address4: apiStore.address.address4 || undefined,
      city: apiStore.address.city || '',
      state: apiStore.address.state || '',
      district: apiStore.address.district || '',
      area: apiStore.address.area || '',
      postal_code: apiStore.address.postal_code || '',
      country: apiStore.address.country || '',
      county: apiStore.address.county || '',
    } : {
      address1: '',
      address2: undefined,
      address3: undefined,
      address4: undefined,
      city: '',
      state: '',
      district: '',
      area: '',
      postal_code: '',
      country: '',
      county: '',
    },
    locale: apiStore.locale || 'en-US',
    timezone: apiStore.timezone,
    currency: apiStore.currency || 'USD',
    latitude: apiStore.latitude || undefined,
    longitude: apiStore.longitude || undefined,
    telephone1: apiStore.telephone1 || undefined,
    telephone2: apiStore.telephone2 || undefined,
    telephone3: apiStore.telephone3 || undefined,
    telephone4: apiStore.telephone4 || undefined,
    email: apiStore.email || undefined,
    legal_entity_id: apiStore.legal_entity_id || undefined,
    legal_entity_name: apiStore.legal_entity_name || undefined,
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
  switchStore: (storeId: string) => Promise<void>;
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

// Helper function to convert empty strings to null
const cleanEmptyStrings = (value: any): any => {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const cleaned: any = {};
    for (const [key, val] of Object.entries(value)) {
      cleaned[key] = cleanEmptyStrings(val);
    }
    return cleaned;
  }
  return value;
};

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
          // Set currentTenant so that subsequent API calls have the X-Tenant-Id header
          set({
            currentTenant: tenant,
            currentStore: null // Reset store when switching tenant
          });
          console.log('✅ Tenant switched successfully:', tenantId);
        }
      },

      switchStore: async (storeId) => {
        const { tenants, currentTenant } = get();
        if (!currentTenant) return;

        const tenant = tenants.find((t) => t.id === currentTenant.id);
        if (tenant) {
          const store = tenant.stores.find((s) => s.store_id === storeId);
          if (store) {
            console.log('🏪 Switching store:', { tenantId: currentTenant.id, storeId });

            // Set the store from local data for immediate UI update
            set({ currentStore: store });

            console.log('✅ Store switched successfully:', storeId);

            // Fetch fresh store details from API in the background
            try {
              console.log('🔄 Fetching fresh store details after store switch:', { tenantId: currentTenant.id, storeId });

              // Import the store service to fetch store details
              const { storeServices } = await import('../services/store');

              // Fetch fresh store details from API
              const freshStoreDetails = await storeServices.store.getStoreDetails(storeId);

              // Transform the API response to match our Store interface
              const updatedStore: Store = {
                ...store, // Keep the existing store data as base
                // Update with fresh data from API
                status: freshStoreDetails.status === 'suspended' ? 'inactive' : freshStoreDetails.status as 'active' | 'inactive' | 'pending',
                store_name: freshStoreDetails.store_name,
                description: freshStoreDetails.description,
                location_type: freshStoreDetails.location_type,
                store_type: freshStoreDetails.store_type,
                address: {
                  address1: freshStoreDetails.address.address1 || '',
                  address2: freshStoreDetails.address.address2 || undefined,
                  address3: freshStoreDetails.address.address3 || undefined,
                  address4: freshStoreDetails.address.address4 || undefined,
                  city: freshStoreDetails.address.city || '',
                  state: freshStoreDetails.address.state || '',
                  district: freshStoreDetails.address.district || '',
                  area: freshStoreDetails.address.area || '',
                  postal_code: freshStoreDetails.address.postal_code || '',
                  country: freshStoreDetails.address.country || '',
                  county: freshStoreDetails.address.county || '',
                },
                locale: freshStoreDetails.locale || 'en-US',
                timezone: freshStoreDetails.timezone,
                currency: freshStoreDetails.currency || 'USD',
                latitude: freshStoreDetails.latitude,
                longitude: freshStoreDetails.longitude,
                telephone1: freshStoreDetails.telephone1,
                telephone2: freshStoreDetails.telephone2,
                telephone3: freshStoreDetails.telephone3,
                telephone4: freshStoreDetails.telephone4,
                email: freshStoreDetails.email,
                legal_entity_id: freshStoreDetails.legal_entity_id,
                legal_entity_name: freshStoreDetails.legal_entity_name,
                store_timing: freshStoreDetails.store_timing ? {
                  Monday: freshStoreDetails.store_timing.Monday || store.store_timing?.Monday || '09:00-18:00',
                  Tuesday: freshStoreDetails.store_timing.Tuesday || store.store_timing?.Tuesday || '09:00-18:00',
                  Wednesday: freshStoreDetails.store_timing.Wednesday || store.store_timing?.Wednesday || '09:00-18:00',
                  Thursday: freshStoreDetails.store_timing.Thursday || store.store_timing?.Thursday || '09:00-18:00',
                  Friday: freshStoreDetails.store_timing.Friday || store.store_timing?.Friday || '09:00-18:00',
                  Saturday: freshStoreDetails.store_timing.Saturday || store.store_timing?.Saturday || '09:00-18:00',
                  Sunday: freshStoreDetails.store_timing.Sunday || store.store_timing?.Sunday || '10:00-17:00',
                  Holidays: freshStoreDetails.store_timing.Holidays || store.store_timing?.Holidays || 'Closed',
                } : store.store_timing,
                terminals: freshStoreDetails.terminals,
                properties: freshStoreDetails.properties,
                created_at: freshStoreDetails.created_at,
                create_user_id: freshStoreDetails.create_user_id,
                updated_at: freshStoreDetails.updated_at,
                update_user_id: freshStoreDetails.update_user_id,
              };

              // Update the store in the tenants array
              const updatedTenants = tenants.map(t => {
                if (t.id === currentTenant.id) {
                  return {
                    ...t,
                    stores: t.stores.map(s => s.store_id === storeId ? updatedStore : s)
                  };
                }
                return t;
              });

              // Update the state with fresh store details
              set({
                tenants: updatedTenants,
                currentStore: updatedStore
              });

              console.log('✅ Store details refreshed successfully after switch');
            } catch (error) {
              console.error('❌ Failed to refresh store details after switch:', error);
              // Don't throw error - the store switch already succeeded with cached data
              // The UI will still work with the cached store data
            }
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

          // Use the error handler to process the error
          const { handleError } = useErrorHandler.getState();
          const appError = handleError(error, {
            showToast: true,
            autoClose: 5000
          });

          set({
            error: appError.message,
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

          // Use the error handler to process the error
          const { handleError } = useErrorHandler.getState();
          const appError = handleError(error, {
            showToast: true,
            autoClose: 5000
          });

          set({
            error: appError.message,
            isLoading: false
          });
        }
      },

      createStore: async (tenantId, storeData) => {
        set({ isLoading: true, error: null });

        try {
          console.log('🏪 Creating store using API service for tenant:', tenantId, storeData);

          // Helper function to convert empty strings to null
          const toNullIfEmpty = (value: string | undefined): string | null => {
            if (!value || value.trim() === '') return null;
            return value.trim();
          };

          // Transform store data to API format with null for empty strings
          const apiStoreData: Partial<StoreApiResponse> = {
            tenant_id: tenantId, // Add tenant_id to the API data
            store_id: toNullIfEmpty(storeData.store_id),
            store_name: storeData.store_name?.trim() || 'New Store',
            description: toNullIfEmpty(storeData.description),
            location_type: storeData.location_type || 'retail',
            store_type: storeData.store_type || 'general',
            address: storeData.address ? {
              address1: toNullIfEmpty(storeData.address.address1),
              address2: toNullIfEmpty(storeData.address.address2),
              address3: toNullIfEmpty(storeData.address.address3),
              address4: toNullIfEmpty(storeData.address.address4),
              city: toNullIfEmpty(storeData.address.city),
              state: toNullIfEmpty(storeData.address.state),
              district: toNullIfEmpty(storeData.address.district),
              area: toNullIfEmpty(storeData.address.area),
              postal_code: toNullIfEmpty(storeData.address.postal_code),
              country: storeData.address.country?.trim() || '',
              county: toNullIfEmpty(storeData.address.county),
            } : {
              address1: null,
              address2: null,
              address3: null,
              address4: null,
              city: null,
              state: null,
              district: null,
              area: null,
              postal_code: null,
              country: '',
              county: null,
            },
            locale: storeData.locale || 'en-IN',
            currency: storeData.currency || 'INR',
            latitude: toNullIfEmpty(storeData.latitude),
            longitude: toNullIfEmpty(storeData.longitude),
            telephone1: toNullIfEmpty(storeData.telephone1),
            telephone2: toNullIfEmpty(storeData.telephone2),
            telephone3: toNullIfEmpty(storeData.telephone3),
            telephone4: toNullIfEmpty(storeData.telephone4),
            email: toNullIfEmpty(storeData.email),
            legal_entity_id: toNullIfEmpty(storeData.legal_entity_id),
            legal_entity_name: toNullIfEmpty(storeData.legal_entity_name),
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
          const apiResponse = await tenantApiService.createStore(apiStoreData);

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
          // Re-throw the error to allow components to handle it
          throw error;
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

        // Clear the state
        set({
          tenants: [],
          currentTenant: null,
          currentStore: null,
          isLoading: false,
          error: null
        });

        // Explicitly clear the persisted data from localStorage
        try {
          localStorage.removeItem('tenant-storage');
          console.log('✅ Cleared tenant-storage from localStorage');
        } catch (error) {
          console.error('❌ Failed to clear localStorage:', error);
        }
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
