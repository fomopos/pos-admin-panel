import { authService } from '../auth/authService';
import { userService } from '../services/user';
import type { Permission } from '../services/types/store.types';

/**
 * Permission utility for role-based access control
 */
export class PermissionManager {
  private static currentUserPermissions: Permission[] = [];
  private static currentUserRole: string = '';
  private static isInitialized = false;

  /**
   * Initialize the permission manager with current user data
   */
  static async initialize(): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.email) {
        // Get user details including permissions
        const usersResponse = await userService.getUsers();
        const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.users || [];
        const userData = users.find((u: any) => u.email === currentUser.email);
        
        if (userData) {
          this.currentUserPermissions = userData.permissions as Permission[];
          this.currentUserRole = userData.role;
          this.isInitialized = true;
        } else {
          // Fallback for development: if user not found in mock data, give admin permissions
          console.warn(`User ${currentUser.email} not found in user data. Using admin permissions for development.`);
          this.currentUserPermissions = [
            'sales_create', 'sales_read', 'sales_update', 'sales_delete', 'sales_void', 'sales_refund',
            'products_create', 'products_read', 'products_update', 'products_delete',
            'users_create', 'users_read', 'users_update', 'users_delete',
            'roles_create', 'roles_read', 'roles_update', 'roles_delete',
            'settings_store', 'settings_users', 'manager_functions',
            'customers_create', 'customers_read', 'customers_update', 'customers_delete',
            'reports_sales', 'reports_inventory', 'reports_financial', 'reports_users',
            'inventory_adjust', 'price_override', 'discount_apply', 'cash_management'
          ] as Permission[];
          this.currentUserRole = 'admin';
          this.isInitialized = true;
        }
      }
    } catch (error) {
      console.error('Failed to initialize permission manager:', error);
      // Even on error, provide basic permissions for development
      this.currentUserPermissions = [
        'sales_create', 'sales_read', 'users_create', 'users_read', 'roles_create', 'roles_read', 'settings_users'
      ] as Permission[];
      this.currentUserRole = 'admin';
      this.isInitialized = true;
    }
  }

  /**
   * Check if current user has a specific permission
   */
  static hasPermission(permission: Permission): boolean {
    if (!this.isInitialized) {
      console.warn('Permission manager not initialized. Call PermissionManager.initialize() first.');
      return false;
    }
    return this.currentUserPermissions.includes(permission);
  }

  /**
   * Check if current user has any of the specified permissions
   */
  static hasAnyPermission(permissions: Permission[]): boolean {
    if (!this.isInitialized) {
      console.warn('Permission manager not initialized. Call PermissionManager.initialize() first.');
      return false;
    }
    return permissions.some(permission => this.currentUserPermissions.includes(permission));
  }

  /**
   * Check if current user has all of the specified permissions
   */
  static hasAllPermissions(permissions: Permission[]): boolean {
    if (!this.isInitialized) {
      console.warn('Permission manager not initialized. Call PermissionManager.initialize() first.');
      return false;
    }
    return permissions.every(permission => this.currentUserPermissions.includes(permission));
  }

  /**
   * Check if current user has a specific role
   */
  static hasRole(role: string): boolean {
    if (!this.isInitialized) {
      console.warn('Permission manager not initialized. Call PermissionManager.initialize() first.');
      return false;
    }
    return this.currentUserRole === role;
  }

  /**
   * Check if current user is an admin
   */
  static isAdmin(): boolean {
    return this.hasRole('admin') || this.hasPermission('users_create');
  }

  /**
   * Check if current user can manage roles
   */
  static canManageRoles(): boolean {
    return this.hasAnyPermission(['roles_create', 'roles_update', 'roles_delete', 'settings_users']);
  }

  /**
   * Check if current user can manage users
   */
  static canManageUsers(): boolean {
    return this.hasAnyPermission(['users_create', 'users_update', 'users_delete', 'settings_users']);
  }

  /**
   * Get current user permissions
   */
  static getCurrentUserPermissions(): Permission[] {
    return [...this.currentUserPermissions];
  }

  /**
   * Get current user role
   */
  static getCurrentUserRole(): string {
    return this.currentUserRole;
  }

  /**
   * Reset permission data (useful for logout)
   */
  static reset(): void {
    this.currentUserPermissions = [];
    this.currentUserRole = '';
    this.isInitialized = false;
  }

  /**
   * Refresh permission data from the server
   */
  static async refresh(): Promise<void> {
    this.reset();
    await this.initialize();
  }

  /**
   * Debug method to log current permission state
   */
  static debug(): void {
    console.log('Permission Manager Debug Info:', {
      isInitialized: this.isInitialized,
      currentUserRole: this.currentUserRole,
      currentUserPermissions: this.currentUserPermissions,
      canManageUsers: this.canManageUsers(),
      canManageRoles: this.canManageRoles(),
      isAdmin: this.isAdmin()
    });
  }
}

/**
 * React hook for permission checking
 */
export const usePermissions = () => {
  return {
    hasPermission: (permission: Permission) => PermissionManager.hasPermission(permission),
    hasAnyPermission: (permissions: Permission[]) => PermissionManager.hasAnyPermission(permissions),
    hasAllPermissions: (permissions: Permission[]) => PermissionManager.hasAllPermissions(permissions),
    hasRole: (role: string) => PermissionManager.hasRole(role),
    isAdmin: () => PermissionManager.isAdmin(),
    canManageRoles: () => PermissionManager.canManageRoles(),
    canManageUsers: () => PermissionManager.canManageUsers(),
    getCurrentUserPermissions: () => PermissionManager.getCurrentUserPermissions(),
    getCurrentUserRole: () => PermissionManager.getCurrentUserRole(),
    debug: () => PermissionManager.debug(),
  };
};

/**
 * Permission-based routing guard
 */
export const hasRequiredPermissions = (requiredPermissions: Permission[], userPermissions: Permission[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * Role management specific permissions
 */
export const ROLE_MANAGEMENT_PERMISSIONS: Permission[] = [
  'roles_create',
  'roles_read', 
  'roles_update',
  'roles_delete',
  'settings_users'
];

/**
 * User management specific permissions
 */
export const USER_MANAGEMENT_PERMISSIONS: Permission[] = [
  'users_create',
  'users_read',
  'users_update', 
  'users_delete',
  'settings_users'
];
