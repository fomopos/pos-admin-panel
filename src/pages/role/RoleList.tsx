import React from 'react';
import type { UserRole } from '../../services/types/store.types';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface RoleListProps {
  roles: UserRole[];
  isLoading: boolean;
  onViewRole: (roleId: string) => void;
  onEditRole: (roleId: string) => void;
  onDeleteRole: (roleId: string) => void;
  onCreateRole: () => void;
  onDuplicateRole: (roleId: string) => void;
}

const RoleList: React.FC<RoleListProps> = ({
  roles,
  isLoading,
  onViewRole,
  onEditRole,
  onDeleteRole,
  onCreateRole,
  onDuplicateRole
}) => {
  const formatPermissionName = (permission: string): string => {
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPermissionCategory = (permission: string): string => {
    if (permission.startsWith('sales_')) return 'Sales';
    if (permission.startsWith('products_') || permission.startsWith('inventory_')) return 'Inventory';
    if (permission.startsWith('customers_')) return 'Customers';
    if (permission.startsWith('users_') || permission.startsWith('roles_')) return 'User Management';
    if (permission.startsWith('reports_')) return 'Reports';
    if (permission.startsWith('settings_')) return 'Settings';
    return 'General';
  };

  const groupPermissionsByCategory = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {};
    permissions.forEach(permission => {
      const category = getPermissionCategory(permission);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Role Management"
          description="Manage user roles and permissions for your store"
        >
          <Button onClick={onCreateRole} className="flex items-center">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </PageHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="flex flex-wrap gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Role Management"
        description="Manage user roles and permissions for your store"
      >
        <Button onClick={onCreateRole} className="flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </PageHeader>

      {/* Roles Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Roles</h3>
              <p className="text-3xl font-bold text-blue-600">{roles.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Roles</h3>
              <p className="text-3xl font-bold text-green-600">{roles.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentDuplicateIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Math.max(...roles.map(r => r.permissions.length), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Roles Grid */}
      {roles.length === 0 ? (
        <Card className="p-12 text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No roles found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first user role.
          </p>
          <div className="mt-6">
            <Button onClick={onCreateRole} className="inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Role
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const groupedPermissions = groupPermissionsByCategory(role.permissions);
            
            return (
              <Card key={role.role_id} className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <div className="space-y-4">
                  {/* Role Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {role.role_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {role.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>

                  {/* Permissions Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Permissions</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {role.permissions.length} total
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {Object.entries(groupedPermissions).slice(0, 3).map(([category, perms]) => (
                        <div key={category} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{category}</span>
                          <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                            {perms.length}
                          </span>
                        </div>
                      ))}
                      {Object.keys(groupedPermissions).length > 3 && (
                        <div className="text-xs text-gray-500 text-center pt-1">
                          +{Object.keys(groupedPermissions).length - 3} more categories
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sample Permissions */}
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <span
                        key={permission}
                        className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {formatPermissionName(permission)}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewRole(role.role_id)}
                      className="flex-1"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditRole(role.role_id)}
                      className="flex-1"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDuplicateRole(role.role_id)}
                      title="Duplicate Role"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteRole(role.role_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Role"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoleList;
