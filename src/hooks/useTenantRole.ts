/**
 * useTenantRole Hook
 * 
 * Provides tenant-level RBAC (Role-Based Access Control) for UI components.
 * Determines the current user's role within the active tenant and exposes
 * permission checks that map to TenantRolePermissions.
 * 
 * Role hierarchy:
 *   owner  → full access (billing + users + stores + settings)
 *   admin  → users + stores + settings (read-only billing)
 *   staff  → no tenant dashboard access
 *   viewer → no tenant dashboard access
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTenantStore } from '../tenants/tenantStore';
import { authService } from '../auth/authService';
import type { TenantRole, TenantRolePermissions } from '../services/types/tenant-dashboard.types';
import { ROLE_PERMISSIONS } from '../services/types/tenant-dashboard.types';

interface UseTenantRoleReturn {
  /** Current user's tenant role */
  role: TenantRole;
  /** Whether the role has been determined yet */
  isLoading: boolean;
  /** Full permission object for the current role */
  permissions: TenantRolePermissions;
  /** Whether the user has access to the tenant dashboard at all */
  hasDashboardAccess: boolean;
  /** Check a specific permission */
  can: (permission: keyof TenantRolePermissions) => boolean;
  /** Whether the user is the tenant owner */
  isOwner: boolean;
  /** Whether the user is an admin */
  isAdmin: boolean;
}

export function useTenantRole(): UseTenantRoleReturn {
  const { currentTenant } = useTenantStore();
  const [role, setRole] = useState<TenantRole>('viewer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineRole = async () => {
      try {
        setIsLoading(true);
        const user = await authService.getCurrentUser();

        if (!user || !currentTenant) {
          setRole('viewer');
          return;
        }

        // TODO: Replace with real API call — GET /tenant/users/me/role
        // For now, infer from tenant data:
        //   - If the user created the tenant, they're the owner
        //   - Otherwise default to admin for development
        if (currentTenant.create_user_id === user.email) {
          setRole('owner');
        } else {
          // TODO: Fetch actual role from backend
          setRole('admin');
        }
      } catch (error) {
        console.error('❌ [useTenantRole] Failed to determine role:', error);
        setRole('viewer');
      } finally {
        setIsLoading(false);
      }
    };

    determineRole();
  }, [currentTenant]);

  const permissions = useMemo(() => ROLE_PERMISSIONS[role], [role]);

  const hasDashboardAccess = useMemo(
    () => role === 'owner' || role === 'admin',
    [role]
  );

  const can = useCallback(
    (permission: keyof TenantRolePermissions) => permissions[permission],
    [permissions]
  );

  return {
    role,
    isLoading,
    permissions,
    hasDashboardAccess,
    can,
    isOwner: role === 'owner',
    isAdmin: role === 'admin',
  };
}
