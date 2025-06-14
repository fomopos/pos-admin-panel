import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/role';
import type { UserRole } from '../../services/types/store.types';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  LockClosedIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CubeIcon,
  BanknotesIcon,
  EyeIcon
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sales & Transactions': return BanknotesIcon;
      case 'Products & Inventory': return CubeIcon;
      case 'Customer Management': return UserGroupIcon;
      case 'User & Role Management': return LockClosedIcon;
      case 'Reports & Analytics': return ChartBarIcon;
      case 'System Settings': return Cog6ToothIcon;
      case 'Management Functions': return ClipboardDocumentListIcon;
      default: return EyeIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sales & Transactions': return 'emerald';
      case 'Products & Inventory': return 'blue';
      case 'Customer Management': return 'purple';
      case 'User & Role Management': return 'red';
      case 'Reports & Analytics': return 'orange';
      case 'System Settings': return 'gray';
      case 'Management Functions': return 'indigo';
      default: return 'slate';
    }
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

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Role Details"
          description="Loading role information..."
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </PageHeader>
        
        {/* Modern Loading Skeleton */}
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Role Details"
          description="Error loading role"
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </PageHeader>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Role</h3>
            <p className="text-red-600 mb-6">{state.error || 'Role not found'}</p>
            <Button 
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Back to Roles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
      <PageHeader
        title={state.role.role_name}
        description={state.role.description || 'No description provided'}
      >
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>
      </PageHeader>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Role Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-700">Role Name</h3>
                <p className="text-xl font-bold text-gray-900">{state.role.role_name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 bg-gradient-to-br from-emerald-50/50 to-green-50/50 border border-emerald-200/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-emerald-700">Total Permissions</h3>
                <p className="text-xl font-bold text-gray-900">{state.role.permissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-200/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-purple-700">Users Assigned</h3>
                <p className="text-xl font-bold text-gray-900">
                  {state.userCount} user{state.userCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Role Actions</h2>
                <p className="text-sm text-gray-600">Manage this role and its settings</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onEdit}
                className="flex items-center justify-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Role
              </Button>
              <Button
                variant="outline"
                onClick={onDuplicate}
                className="flex items-center justify-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={onDelete}
                disabled={!state.canDelete}
                className={`flex items-center justify-center backdrop-blur-sm ${
                  !state.canDelete 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' 
                    : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400'
                }`}
                title={!state.canDelete ? `Cannot delete: ${state.userCount} users assigned` : 'Delete role'}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {!state.canDelete && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
              <div className="flex items-center space-x-3">
                <XMarkIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm font-medium text-yellow-800">
                  This role cannot be deleted because it is currently assigned to {state.userCount} user{state.userCount !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Role Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Role Information</h2>
                <p className="text-sm text-gray-600">Basic role details and metadata</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <div className="px-4 py-3 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 text-gray-900 font-medium">
                  {state.role.role_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role ID
                </label>
                <div className="px-4 py-3 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 text-gray-600 font-mono text-sm">
                  {state.role.role_id}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="px-4 py-4 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 text-gray-900 min-h-[100px]">
                {state.role.description || (
                  <span className="text-gray-500 italic">No description provided</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LockClosedIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Permissions</h2>
                  <p className="text-sm text-gray-600">Role access permissions and capabilities</p>
                </div>
              </div>
              <div className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="font-medium text-blue-700">{state.role.permissions.length}</span>
                <span className="text-gray-600"> permission{state.role.permissions.length !== 1 ? 's' : ''} granted</span>
              </div>
            </div>

            {Object.keys(permissionCategories).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XMarkIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No permissions assigned</h3>
                <p className="text-gray-500">
                  This role has no permissions assigned to it.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissionCategories).map(([category, permissions]) => {
                  const IconComponent = getCategoryIcon(category);
                  const categoryColor = getCategoryColor(category);
                  
                  return (
                    <div key={category} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-${categoryColor}-100 rounded-lg flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 text-${categoryColor}-600`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                            <p className="text-xs text-gray-500">{permissions.length} permissions granted</p>
                          </div>
                        </div>
                        <div className={`text-sm px-3 py-1 rounded-lg bg-${categoryColor}-100 text-${categoryColor}-800 border border-${categoryColor}-300`}>
                          {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissions.map((permission) => (
                          <div
                            key={permission}
                            className={`flex items-center p-4 rounded-xl bg-gradient-to-r from-${categoryColor}-50 to-${categoryColor}-100 border-2 border-${categoryColor}-300 shadow-sm`}
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-lg bg-${categoryColor}-600 border-2 border-${categoryColor}-600 flex items-center justify-center shadow-lg`}>
                              <CheckIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className={`ml-3 text-sm font-medium text-${categoryColor}-900`}>
                              {formatPermissionName(permission)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;
