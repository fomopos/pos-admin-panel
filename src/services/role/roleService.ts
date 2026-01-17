// Role management service for POS system
import { apiClient } from '../api';
import type { UserRole, Permission } from '../types/store.types';

// Role request types
export interface CreateRoleRequest {
  store_id: string;
  role_name: string;
  permissions: Permission[];
  description?: string;
}

export interface UpdateRoleRequest {
  role_name?: string;
  permissions?: Permission[];
  description?: string;
}

// Response types
export interface RolesResponse {
  roles: UserRole[];
  total: number;
  page: number;
  limit: number;
}

export interface RoleServiceError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export class RoleService {
  private readonly basePath = '/roles';

  /**
   * Get all roles for a store
   */
  async getRoles(storeId: string): Promise<RolesResponse> {
    try {
      const response = await apiClient.get<RolesResponse>(`${this.basePath}`, { store_id: storeId });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  }

  /**
   * Get a specific role by ID
   */
  async getRoleById(roleId: string): Promise<UserRole> {
    try {
      const response = await apiClient.get<UserRole>(`${this.basePath}/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleRequest): Promise<UserRole> {
    try {
      this.validateRoleData(data);
      const response = await apiClient.post<UserRole>(this.basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: string, data: UpdateRoleRequest): Promise<UserRole> {
    try {
      this.validateRoleData(data);
      const response = await apiClient.put<UserRole>(`${this.basePath}/${roleId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/${roleId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw this.handleError(error, `Failed to delete role ${roleId}`);
    }
  }

  /**
   * Get all available permissions
   */
  async getAvailablePermissions(): Promise<Permission[]> {
    try {
      const response = await apiClient.get<{ permissions: Permission[] }>('/permissions');
      return response.data.permissions;
    } catch (error) {
      console.error('Failed to fetch available permissions:', error);
      throw error;
    }
  }

  /**
   * Check if a role can be deleted (not assigned to any users)
   */
  async canDeleteRole(roleId: string): Promise<{ canDelete: boolean; userCount: number }> {
    try {
      const response = await apiClient.get<{ canDelete: boolean; userCount: number }>(`${this.basePath}/${roleId}/can-delete`);
      return response.data;
    } catch (error) {
      console.error('Failed to check if role can be deleted:', error);
      throw error;
    }
  }

  /**
   * Duplicate a role with a new name
   */
  async duplicateRole(roleId: string, newRoleName: string): Promise<UserRole> {
    try {
      const existingRole = await this.getRoleById(roleId);
      const createData: CreateRoleRequest = {
        store_id: '', // This would be provided by the calling component
        role_name: newRoleName,
        permissions: existingRole.permissions as Permission[],
        description: `Copy of ${existingRole.role_name}`
      };
      return await this.createRole(createData);
    } catch (error) {
      console.error('Failed to duplicate role:', error);
      throw this.handleError(error, `Failed to duplicate role ${roleId}`);
    }
  }

  /**
   * Validate role data before sending to API
   */
  private validateRoleData(data: CreateRoleRequest | UpdateRoleRequest): void {
    if ('role_name' in data && data.role_name && data.role_name.trim().length < 2) {
      throw new Error('Role name must be at least 2 characters long');
    }
    
    if ('permissions' in data && data.permissions && data.permissions.length === 0) {
      throw new Error('Role must have at least one permission');
    }
  }

  /**
   * Handle API errors and convert to RoleServiceError
   */
  private handleError(error: any, message: string): RoleServiceError {
    return {
      message,
      code: error.response?.status || 500,
      details: error.response?.data || error.message
    };
  }
}

// Export a singleton instance
export const roleService = new RoleService();
