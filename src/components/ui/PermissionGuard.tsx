import React from 'react';
import { usePermissions } from '../../utils/permissions';
import type { Permission } from '../../services/types/store.types';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: string;
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  fallback?: React.ReactNode;
}

/**
 * Permission-based component guard
 * Conditionally renders children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requireAll = false,
  fallback = null
}) => {
  const { hasAnyPermission, hasAllPermissions, hasRole } = usePermissions();

  // Check role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0) {
    const hasPermission = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * Specialized guards for common use cases
 */

export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard 
    requiredRole="admin" 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const RoleManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard 
    requiredPermissions={['roles_create', 'roles_update', 'roles_delete', 'settings_users']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const UserManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard 
    requiredPermissions={['users_create', 'users_update', 'users_delete', 'settings_users']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export default PermissionGuard;
