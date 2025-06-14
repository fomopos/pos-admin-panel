import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/role';
import type { UpdateRoleRequest } from '../../services/role';
import type { Permission, UserRole } from '../../services/types/store.types';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon, 
  CheckIcon, 
  UserGroupIcon,
  LockClosedIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CubeIcon,
  BanknotesIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface EditRoleProps {
  roleId: string;
  onBack: () => void;
  onSave: () => void;
}

interface EditRoleState {
  role: UserRole | null;
  formData: UpdateRoleRequest;
  availablePermissions: Permission[];
  selectedPermissions: Set<Permission>;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  successMessage: string | null;
}

const EditRole: React.FC<EditRoleProps> = ({ roleId, onBack, onSave }) => {
  const [state, setState] = useState<EditRoleState>({
    role: null,
    formData: {
      role_name: '',
      permissions: [],
      description: ''
    },
    availablePermissions: [],
    selectedPermissions: new Set(),
    isLoading: true,
    isSaving: false,
    errors: {},
    successMessage: null
  });

  useEffect(() => {
    loadRoleData();
  }, [roleId]);

  const loadRoleData = async () => {
    try {
      const [role, permissions] = await Promise.all([
        roleService.getRoleById(roleId),
        roleService.getAvailablePermissions()
      ]);

      setState(prev => ({
        ...prev,
        role,
        formData: {
          role_name: role.role_name,
          permissions: role.permissions as Permission[],
          description: role.description || ''
        },
        availablePermissions: permissions,
        selectedPermissions: new Set(role.permissions as Permission[]),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load role data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: { load: 'Failed to load role data' }
      }));
    }
  };

  const handleInputChange = (field: keyof UpdateRoleRequest, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const handlePermissionToggle = (permission: Permission) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedPermissions);
      if (newSelected.has(permission)) {
        newSelected.delete(permission);
      } else {
        newSelected.add(permission);
      }
      
      return {
        ...prev,
        selectedPermissions: newSelected,
        formData: {
          ...prev.formData,
          permissions: Array.from(newSelected)
        },
        errors: { ...prev.errors, permissions: '' }
      };
    });
  };

  const handleSelectAllInCategory = (category: Permission[]) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedPermissions);
      const allSelected = category.every(p => newSelected.has(p));
      
      if (allSelected) {
        category.forEach(p => newSelected.delete(p));
      } else {
        category.forEach(p => newSelected.add(p));
      }
      
      return {
        ...prev,
        selectedPermissions: newSelected,
        formData: {
          ...prev.formData,
          permissions: Array.from(newSelected)
        }
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!state.formData.role_name?.trim()) {
      newErrors.role_name = 'Role name is required';
    } else if (state.formData.role_name.trim().length < 2) {
      newErrors.role_name = 'Role name must be at least 2 characters long';
    }

    if (state.selectedPermissions.size === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    setState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setState(prev => ({ ...prev, isSaving: true }));
      await roleService.updateRole(roleId, state.formData);
      setState(prev => ({ ...prev, successMessage: 'Role updated successfully' }));
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { submit: 'Failed to update role. Please try again.' }
      }));
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
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
      default: return ShieldCheckIcon;
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
    const categories: Record<string, Permission[]> = {};
    
    state.availablePermissions.forEach(permission => {
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

  const hasChanges = () => {
    if (!state.role) return false;
    
    return (
      state.formData.role_name !== state.role.role_name ||
      state.formData.description !== (state.role.description || '') ||
      JSON.stringify(Array.from(state.selectedPermissions).sort()) !== JSON.stringify((state.role.permissions as Permission[]).sort())
    );
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Edit Role"
          description="Loading role data..."
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </PageHeader>
        
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.errors.load) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Edit Role"
          description="Error loading role"
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </PageHeader>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Role</h3>
            <p className="text-red-600 mb-6">{state.errors.load}</p>
            <Button 
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300"
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
        title={`Edit Role: ${state.role?.role_name}`}
        description="Update role permissions and information"
      >
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-all duration-300"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>
      </PageHeader>

      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Role Information</h2>
                  <p className="text-gray-600">Basic details about this role</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={state.formData.role_name || ''}
                    onChange={(e) => handleInputChange('role_name', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                      state.errors.role_name ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter role name"
                  />
                  {state.errors.role_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {state.errors.role_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Selected Permissions
                  </label>
                  <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-sm text-gray-700 flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-2 text-blue-600" />
                    {state.selectedPermissions.size} permission(s) selected
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  value={state.formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300"
                  placeholder="Describe the role and its responsibilities..."
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Permissions</h2>
                  <p className="text-gray-600">Choose what this role can access</p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {state.selectedPermissions.size} of {state.availablePermissions.length} selected
                </div>
              </div>

              {state.errors.permissions && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                    {state.errors.permissions}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(permissionCategories).map(([category, permissions]) => {
                  const allSelected = permissions.every(p => state.selectedPermissions.has(p));
                  const someSelected = permissions.some(p => state.selectedPermissions.has(p));
                  const color = getCategoryColor(category);
                  const IconComponent = getCategoryIcon(category);
                  
                  return (
                    <div key={category} className="border-2 border-gray-100 rounded-xl p-6 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center shadow-lg`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                            <p className="text-sm text-gray-600">{permissions.length} permissions</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAllInCategory(permissions)}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                            allSelected 
                              ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg` 
                              : someSelected
                              ? `bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg`
                              : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                          }`}
                        >
                          {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissions.map((permission) => {
                          const isSelected = state.selectedPermissions.has(permission);
                          
                          return (
                            <label
                              key={permission}
                              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                isSelected
                                  ? `bg-gradient-to-r from-${color}-50 to-${color}-100/50 border-${color}-200 shadow-lg`
                                  : 'bg-white/70 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission)}
                                className="sr-only"
                              />
                              <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                isSelected
                                  ? `bg-gradient-to-r from-${color}-500 to-${color}-600 border-${color}-500`
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}>
                                {isSelected && (
                                  <CheckIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <span className={`ml-3 text-sm font-medium transition-colors duration-300 ${
                                isSelected ? `text-${color}-900` : 'text-gray-700'
                              }`}>
                                {formatPermissionName(permission)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                {hasChanges() ? (
                  <span className="text-yellow-600 font-semibold flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="text-gray-500 flex items-center">
                    <CheckIcon className="w-4 h-4 mr-2" />
                    No changes made
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={state.isSaving}
                  className="backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={state.isSaving || !hasChanges()}
                  className="min-w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none"
                >
                  {state.isSaving ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Success Message */}
        {state.successMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-pulse">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-6 shadow-lg">
                <CheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">{state.successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.errors.submit && (
          <div className="fixed bottom-4 right-4 max-w-md">
            <div className="bg-red-50/90 backdrop-blur-md border-2 border-red-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800 font-medium">{state.errors.submit}</p>
                <button
                  onClick={() => setState(prev => ({ ...prev, errors: { ...prev.errors, submit: '' } }))}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditRole;
