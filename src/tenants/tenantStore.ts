import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
  };
}

interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTenants: (tenants: Tenant[]) => void;
  setCurrentTenant: (tenant: Tenant | null) => void;
  switchTenant: (tenantId: string) => void;
  fetchTenants: (userId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock tenant data
const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Main Store',
    logo: '/logos/main-store.png',
    settings: {
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
    },
  },
  {
    id: 'tenant-2',
    name: 'Branch Store',
    logo: '/logos/branch-store.png',
    settings: {
      currency: 'EUR',
      timezone: 'Europe/London',
      dateFormat: 'DD/MM/YYYY',
    },
  },
  {
    id: 'tenant-3',
    name: 'Online Store',
    logo: '/logos/online-store.png',
    settings: {
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
    },
  },
];

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenants: [],
      currentTenant: null,
      isLoading: false,
      error: null,

      setTenants: (tenants) => set({ tenants }),

      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

      switchTenant: (tenantId) => {
        const { tenants } = get();
        const tenant = tenants.find((t) => t.id === tenantId);
        if (tenant) {
          set({ currentTenant: tenant });
        }
      },

      fetchTenants: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // In a real app, you would fetch tenants from your API
          // const response = await fetch(`/api/users/${userId}/tenants`);
          // const tenants = await response.json();
          
          const tenants = mockTenants;
          
          set({ 
            tenants, 
            currentTenant: tenants[0] || null,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tenants',
            isLoading: false 
          });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        tenants: state.tenants,
      }),
    }
  )
);

export default useTenantStore;
