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

// Mock data for development
const mockRoles: UserRole[] = [
  {
    role_id: 'role-1',
    role_name: 'Store Manager',
    permissions: [
      'sales_create', 'sales_read', 'sales_update', 'sales_delete', 'sales_void', 'sales_refund',
      'products_create', 'products_read', 'products_update', 'products_delete',
      'users_create', 'users_read', 'users_update', 'users_delete',
      'roles_create', 'roles_read', 'roles_update', 'roles_delete',
      'settings_store', 'settings_users', 'manager_functions',
      'cash_management', 'reports_sales', 'reports_inventory', 'reports_financial'
    ],
    description: 'Full access to store operations and management'
  },
  {
    role_id: 'role-2',
    role_name: 'Assistant Manager',
    permissions: [
      'sales_create', 'sales_read', 'sales_update', 'sales_void', 'sales_refund',
      'products_read', 'products_update',
      'users_read', 'users_update',
      'roles_read',
      'manager_functions', 'discount_apply',
      'reports_sales', 'reports_inventory'
    ],
    description: 'Limited management access with supervisory permissions'
  },
  {
    role_id: 'role-3',
    role_name: 'Sales Associate',
    permissions: [
      'sales_create', 'sales_read', 'products_read',
      'customers_create', 'customers_read', 'customers_update'
    ],
    description: 'Standard sales operations and customer management'
  },
  {
    role_id: 'role-4',
    role_name: 'Cashier',
    permissions: [
      'sales_create', 'sales_read', 'products_read', 'customers_read'
    ],
    description: 'Basic point-of-sale operations'
  },
  {
    role_id: 'role-5',
    role_name: 'Inventory Manager',
    permissions: [
      'products_read', 'products_update', 'products_create',
      'inventory_read', 'inventory_update', 'inventory_adjust',
      'reports_inventory'
    ],
    description: 'Inventory management and product catalog maintenance'
  }
];

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
      console.warn('API call failed, using mock data for development:', error);
      // Fallback to mock data for development
      return {
        roles: mockRoles,
        total: mockRoles.length,
        page: 1,
        limit: 50
      };
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
      console.warn('API call failed, using mock data for development:', error);
      // Fallback to mock data for development
      const role = mockRoles.find(r => r.role_id === roleId);
      if (!role) {
        throw this.handleError(error, `Role ${roleId} not found`);
      }
      return role;
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
      console.warn('API call failed, using mock data for development:', error);
      // Fallback to mock data for development - create a mock role
      const newRole: UserRole = {
        role_id: `role-${Date.now()}`,
        role_name: data.role_name,
        permissions: data.permissions,
        description: data.description
      };
      return newRole;
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
      console.warn('API call failed, using mock data for development:', error);
      // Fallback to mock data for development - simulate an updated role
      const existingRole = mockRoles.find(r => r.role_id === roleId);
      if (!existingRole) {
        throw this.handleError(error, `Role ${roleId} not found`);
      }
      
      const updatedRole: UserRole = {
        ...existingRole,
        ...data
      };
      return updatedRole;
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
      console.warn('API call failed, using mock permissions for development:', error);
      // Fallback to hardcoded permissions for development
      return [
        'sales_create', 'sales_read', 'sales_update', 'sales_delete', 'sales_void', 'sales_refund',
        'products_create', 'products_read', 'products_update', 'products_delete',
        'inventory_read', 'inventory_update', 'inventory_adjust',
        'customers_create', 'customers_read', 'customers_update', 'customers_delete',
        'reports_sales', 'reports_inventory', 'reports_customers', 'reports_financial',
        'settings_store', 'settings_users', 'settings_payment', 'settings_tax', 'settings_system',
        'users_create', 'users_read', 'users_update', 'users_delete',
        'roles_create', 'roles_read', 'roles_update', 'roles_delete',
        'cash_management', 'discount_apply', 'discount_override', 'price_override', 'manager_functions'
      ] as Permission[];
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
      console.warn('API call failed, using mock data for development:', error);
      // Fallback - allow deletion in development mode
      return { canDelete: true, userCount: 0 };
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
