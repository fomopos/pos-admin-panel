import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/role';
import type { CreateRoleRequest } from '../../services/role';
import type { Permission } from '../../services/types/store.types';
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
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CreateRoleProps {
  storeId: string;
  onBack: () => void;
  onSave: () => void;
}

interface CreateRoleState {
  formData: CreateRoleRequest;
  availablePermissions: Permission[];
  selectedPermissions: Set<Permission>;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  successMessage: string | null;
}

const CreateRole: React.FC<CreateRoleProps> = ({ storeId, onBack, onSave }) => {
  const [state, setState] = useState<CreateRoleState>({
    formData: {
      store_id: storeId,
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
    loadAvailablePermissions();
  }, []);

  const loadAvailablePermissions = async () => {
    try {
      const permissions = await roleService.getAvailablePermissions();
      setState(prev => ({
        ...prev,
        availablePermissions: permissions,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: { permissions: 'Failed to load available permissions' }
      }));
    }
  };

  const handleInputChange = (field: keyof CreateRoleRequest, value: string) => {
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
        // Deselect all in category
        category.forEach(p => newSelected.delete(p));
      } else {
        // Select all in category
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

    if (!state.formData.role_name.trim()) {
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
      await roleService.createRole(state.formData);
      setState(prev => ({ ...prev, successMessage: 'Role created successfully' }));
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { submit: 'Failed to create role. Please try again.' }
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

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Create Role"
          description="Loading available permissions..."
        />
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
      <PageHeader
        title="Create Role"
        description="Create a new user role with specific permissions"
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

      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Role Information</h2>
                  <p className="text-sm text-gray-600">Define basic role details and settings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={state.formData.role_name}
                    onChange={(e) => handleInputChange('role_name', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                      state.errors.role_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter role name"
                  />
                  {state.errors.role_name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.role_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Permissions
                  </label>
                  <div className="px-4 py-3 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 text-sm">
                    <span className="font-medium text-blue-700">{state.selectedPermissions.size}</span>
                    <span className="text-gray-600"> permission(s) selected</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={state.formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Describe the role and its responsibilities..."
                />
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
                    <p className="text-sm text-gray-600">Configure role access permissions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-700">{state.selectedPermissions.size}</span>
                    <span className="text-gray-600"> of {state.availablePermissions.length} selected</span>
                  </div>
                </div>
              </div>

              {state.errors.permissions && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <XMarkIcon className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-medium text-red-600">{state.errors.permissions}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(permissionCategories).map(([category, permissions]) => {
                  const allSelected = permissions.every(p => state.selectedPermissions.has(p));
                  const someSelected = permissions.some(p => state.selectedPermissions.has(p));
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
                            <p className="text-xs text-gray-500">{permissions.length} permissions available</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAllInCategory(permissions)}
                          className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            allSelected 
                              ? `bg-${categoryColor}-100 text-${categoryColor}-700 hover:bg-${categoryColor}-200 border border-${categoryColor}-300` 
                              : someSelected
                              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 hover:from-yellow-200 hover:to-orange-200 border border-orange-300'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300'
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
                              className={`group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                isSelected
                                  ? `bg-gradient-to-r from-${categoryColor}-50 to-${categoryColor}-100 border-${categoryColor}-300 shadow-lg`
                                  : 'bg-white border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 hover:shadow-md'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission)}
                                className="sr-only"
                              />
                              <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? `bg-${categoryColor}-600 border-${categoryColor}-600 shadow-lg`
                                  : 'border-gray-300 group-hover:border-blue-400'
                              }`}>
                                {isSelected && (
                                  <CheckIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <span className={`ml-3 text-sm font-medium transition-colors duration-200 ${
                                isSelected ? `text-${categoryColor}-900` : 'text-gray-700 group-hover:text-gray-900'
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={state.isSaving}
                className="backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={state.isSaving}
                className="min-w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {state.isSaving ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Message */}
      {state.successMessage && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-white/20">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 mb-6 shadow-lg">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Success!</h3>
            <p className="text-gray-600 leading-relaxed">{state.successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRole;
