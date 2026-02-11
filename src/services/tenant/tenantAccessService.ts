// Tenant access service for handling user tenant permissions and creating new tenants
import { apiClient } from '../api';

// Types for tenant access
export interface TenantAccess {
  user_id: string;
  tenant_id: string;
  role_id: string;
  properties?: any;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by?: string;
}

export interface TenantAccessResponse {
  tenant_access: TenantAccess[];
  size: number;
}

export interface CreateTenantRequest {
  name: string;
  contact_email: string;
  contact_phone: string;
}

export interface CreateTenantResponse {
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
  created_by: string;
  updated_at: string;
  updated_by?: string;
}

class TenantAccessService {
  private baseUrl = '/v0';

  /**
   * Get tenant access for the current user
   * @returns Promise with tenant access information
   */
  async getTenantAccess(): Promise<TenantAccessResponse> {
    try {
      const url = `${this.baseUrl}/tenant/access`;
      console.log('🔍 Fetching tenant access from:', url);
      
      const response = await apiClient.get<TenantAccessResponse>(url);
      console.log('✅ Tenant access response:', response.data);
      
      return response.data;
    } catch (error) {
      console.log('❌ Error fetching tenant access:', error);
      throw error;
    }
  }

  /**
   * Check if user has super admin role but no tenant access
   * @returns Promise<boolean> - true if user should be offered to create a new tenant
   */
  async shouldOfferTenantCreation(): Promise<boolean> {
    try {
      const tenantAccess = await this.getTenantAccess();
      
      // Check if user has super_admin role but no tenant access
      const hasSuperAdminRole = tenantAccess.tenant_access.some(
        access => access.role_id === 'super_admin'
      );
      
      const hasNoTenantAccess = tenantAccess.tenant_access.length === 0;
      
      console.log('🔍 Tenant access check:', {
        hasSuperAdminRole,
        hasNoTenantAccess,
        totalAccess: tenantAccess.tenant_access.length,
        shouldOffer: hasSuperAdminRole && hasNoTenantAccess
      });
      
      return hasSuperAdminRole && hasNoTenantAccess;
    } catch (error: any) {
      console.log('❌ Error checking tenant creation eligibility:', error);
      
      // Handle ApiError thrown by apiClient
      // ApiError has code, slug, message directly on the error object
      if (error?.code === 4000 || 
          error?.message === "No Tenant Found For the User." ||
          error?.message === "No TenantAccess Found.") {
        console.log('🏢 User has no tenant access, offering tenant creation');
        return true;
      }
      
      // Also handle HTTP 404 status code
      if (error?.code === 404) {
        return true;
      }
      
      return false;
    }
  }

  /**
   * Create a new tenant
   * @param tenantData - The tenant data to create
   * @returns Promise with created tenant information
   */
  async createTenant(tenantData: CreateTenantRequest): Promise<CreateTenantResponse> {
    try {
      const url = `${this.baseUrl}/tenant`;
      console.log('🏢 Creating new tenant:', { url, tenantData });
      
      const response = await apiClient.post<CreateTenantResponse>(url, tenantData);
      console.log('✅ Tenant created successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Check if user has super admin role in any tenant
   * @returns Promise<boolean>
   */
  async hasSuperAdminRole(): Promise<boolean> {
    try {
      const tenantAccess = await this.getTenantAccess();
      
      const hasSuperAdmin = tenantAccess.tenant_access.some(
        access => access.role_id === 'super_admin'
      );
      
      console.log('🔍 Super admin role check:', {
        hasSuperAdmin,
        totalAccess: tenantAccess.tenant_access.length
      });
      
      return hasSuperAdmin;
    } catch (error) {
      console.error('❌ Error checking super admin role:', error);
      return false;
    }
  }

  /**
   * Get all tenant IDs that the user has access to
   * @returns Promise<string[]>
   */
  async getUserTenantIds(): Promise<string[]> {
    try {
      const tenantAccess = await this.getTenantAccess();
      
      const tenantIds = tenantAccess.tenant_access.map(access => access.tenant_id);
      
      console.log('🔍 User tenant IDs:', tenantIds);
      
      return tenantIds;
    } catch (error) {
      console.error('❌ Error getting user tenant IDs:', error);
      return [];
    }
  }
}

export const tenantAccessService = new TenantAccessService();
