import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/role';
import type { UserRole } from '../../services/types/store.types';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface RoleDetailProps {
  roleId: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

interface RoleDetailState {
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  canDelete: boolean;
  userCount: number;
}

const RoleDetail: React.FC<RoleDetailProps> = ({ 
  roleId, 
  onBack, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) => {
  const [state, setState] = useState<RoleDetailState>({
    role: null,
    isLoading: true,
    error: null,
    canDelete: true,
    userCount: 0
  });

  useEffect(() => {
    loadRoleData();
  }, [roleId]);

  const loadRoleData = async () => {
    try {
      const [role, deleteCheck] = await Promise.all([
        roleService.getRoleById(roleId),
        roleService.canDeleteRole(roleId)
      ]);

      setState(prev => ({
        ...prev,
        role,
        canDelete: deleteCheck.canDelete,
        userCount: deleteCheck.userCount,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load role data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load role data',
        isLoading: false
      }));
    }
  };

  const formatPermissionName = (permission: string): string => {
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPermissionsByCategory = () => {
    if (!state.role) return {};
    
    const categories: Record<string, string[]> = {};
    
    state.role.permissions.forEach(permission => {
      let category = 'General';
      
      if (permission.startsWith('sales_')) category = 'Sales & Transactions';
      else if (permission.startsWith('products_') || permission.startsWith('inventory_')) category = 'Products & Inventory';
      else if (permission.startsWith('customers_')) category = 'Customer Management';
      else if (permission.startsWith('users_') || permission.startsWith('roles_')) category = 'User & Role Management';
      else if (permission.startsWith('reports_')) category = 'Reports & Analytics';
      else if (permission.startsWith('settings_')) category = 'System Settings';
      else if (permission.includes('manager') || permission.includes('cash') || permission.includes('discount') || permission.includes('price')) category = 'Management Functions';
      
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(permission);
    });
    
    return categories;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Sales & Transactions': 'bg-green-100 text-green-800 border-green-200',
      'Products & Inventory': 'bg-blue-100 text-blue-800 border-blue-200',
      'Customer Management': 'bg-purple-100 text-purple-800 border-purple-200',
      'User & Role Management': 'bg-red-100 text-red-800 border-red-200',
      'Reports & Analytics': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'System Settings': 'bg-gray-100 text-gray-800 border-gray-200',
      'Management Functions': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'General': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors['General'];
  };

  if (state.isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Role Details"
          description="Loading role information..."
        >
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={onBack} className="hover:text-gray-700">Role Management</button>
            <span>/</span>
            <span>Role Details</span>
          </div>
        </PageHeader>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (state.error || !state.role) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Role Details"
          description="Error loading role"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={onBack} className="hover:text-gray-700">Role Management</button>
            <span>/</span>
            <span>Role Details</span>
          </div>
        </PageHeader>
        <Card className="p-6 text-center">
          <p className="text-red-600">{state.error || 'Role not found'}</p>
          <Button onClick={onBack} className="mt-4">Back to Roles</Button>
        </Card>
      </div>
    );
  }

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className="space-y-8">
      <PageHeader
        title={state.role.role_name}
        description={state.role.description || 'No description provided'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={onBack} className="hover:text-gray-700">Role Management</button>
            <span>/</span>
            <span>Role Details</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Roles</span>
          </Button>
        </div>
      </PageHeader>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Role Name</h3>
              <p className="text-lg font-semibold text-gray-900">{state.role.role_name}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Permissions</h3>
              <p className="text-lg font-semibold text-gray-900">{state.role.permissions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">{state.userCount}</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Users Assigned</h3>
              <p className="text-lg font-semibold text-gray-900">
                {state.userCount} user{state.userCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Role Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Role Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Manage this role and its settings</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onEdit}
              className="inline-flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Role
            </Button>
            <Button
              variant="outline"
              onClick={onDuplicate}
              className="inline-flex items-center"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={!state.canDelete}
              className={`inline-flex items-center ${
                !state.canDelete 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
              title={!state.canDelete ? `Cannot delete: ${state.userCount} users assigned` : 'Delete role'}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {!state.canDelete && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <XMarkIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                This role cannot be deleted because it is currently assigned to {state.userCount} user{state.userCount !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Role Information */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Role Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900">
                {state.role.role_name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role ID
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 font-mono text-sm">
                {state.role.role_id}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 min-h-[80px]">
              {state.role.description || (
                <span className="text-gray-500 italic">No description provided</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
            <div className="text-sm text-gray-500">
              {state.role.permissions.length} permission{state.role.permissions.length !== 1 ? 's' : ''} granted
            </div>
          </div>

          {Object.keys(permissionCategories).length === 0 ? (
            <div className="text-center py-8">
              <XMarkIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No permissions assigned</h3>
              <p className="mt-2 text-sm text-gray-500">
                This role has no permissions assigned to it.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-md font-medium px-3 py-1 rounded-full border ${getCategoryColor(category)}`}>
                      {category}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center p-3 rounded-lg bg-green-50 border border-green-200"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded border-2 bg-green-600 border-green-600 flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-green-900">
                          {formatPermissionName(permission)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RoleDetail;
