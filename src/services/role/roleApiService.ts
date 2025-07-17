import { apiClient } from '../api';

// Types for the API response
export interface PermissionCategory {
  category_info: {
    name: string;
    description: string;
    icon: string;
    order: number;
  };
  permissions: Permission[];
}

export interface Permission {
  name: string;
  description: string;
  category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_approval: boolean;
}

export interface ApiRole {
  role_id: string;
  tenant_id: string;
  store_id: string;
  name: string;
  description: string;
  permissions: {
    permissions: string[];
    count: number;
  };
  is_active: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface GetRolesResponse {
  roles: ApiRole[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

class RoleApiService {
  private baseUrl = '/v0';

  private getBaseUrl(tenantId: string, storeId: string): string {
    return `${this.baseUrl}/tenant/${tenantId}/store/${storeId}/role`;
  }

  /**
   * Get list of permission categories with permissions
   */
  async getPermissions(tenantId: string, storeId: string): Promise<PermissionCategory[]> {
    const url = `${this.getBaseUrl(tenantId, storeId)}/permissions`;
    const response = await apiClient.get<PermissionCategory[]>(url);
    return response.data;
  }

  /**
   * Get all roles
   */
  async getRoles(tenantId: string, storeId: string): Promise<ApiRole[]> {
    const url = this.getBaseUrl(tenantId, storeId);
    const response = await apiClient.get<GetRolesResponse>(url);
    // Extract the roles array from the response
    return Array.isArray(response.data.roles) ? response.data.roles : [];
  }

  /**
   * Create a new role
   */
  async createRole(tenantId: string, storeId: string, data: CreateRoleRequest): Promise<ApiRole> {
    try {
      const url = this.getBaseUrl(tenantId, storeId);
      const response = await apiClient.post<ApiRole>(url, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Update a role
   */
  async updateRole(tenantId: string, storeId: string, roleId: string, data: Partial<CreateRoleRequest>): Promise<ApiRole> {
    const url = `${this.getBaseUrl(tenantId, storeId)}/${roleId}`;
    const response = await apiClient.put<ApiRole>(url, data);
    return response.data;
  }

  /**
   * Delete a role
   */
  async deleteRole(tenantId: string, storeId: string, roleId: string): Promise<void> {
    const url = `${this.getBaseUrl(tenantId, storeId)}/${roleId}`;
    await apiClient.delete(url);
  }

}

export const roleApiService = new RoleApiService();
