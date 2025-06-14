import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/role';
import type { CreateRoleRequest } from '../../services/role';
import type { Permission } from '../../services/types/store.types';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { ArrowLeftIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';

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
      <div className="space-y-8">
        <PageHeader
          title="Create Role"
          description="Loading available permissions..."
        />
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Create Role"
        description="Create a new user role with specific permissions"
      >
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                  Role Name *
                </label>
                <input
                  type="text"
                  value={state.formData.role_name}
                  onChange={(e) => handleInputChange('role_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                <div className="px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-sm text-gray-600">
                  {state.selectedPermissions.size} permission(s) selected
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the role and its responsibilities..."
              />
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
              <div className="text-sm text-gray-500">
                {state.selectedPermissions.size} of {state.availablePermissions.length} selected
              </div>
            </div>

            {state.errors.permissions && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{state.errors.permissions}</p>
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(permissionCategories).map(([category, permissions]) => {
                const allSelected = permissions.every(p => state.selectedPermissions.has(p));
                const someSelected = permissions.some(p => state.selectedPermissions.has(p));
                
                return (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-medium text-gray-900">{category}</h3>
                      <button
                        type="button"
                        onClick={() => handleSelectAllInCategory(permissions)}
                        className={`text-sm px-3 py-1 rounded-full transition-colors ${
                          allSelected 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : someSelected
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePermissionToggle(permission)}
                              className="sr-only"
                            />
                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <CheckIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className={`ml-3 text-sm font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-700'
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
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={state.isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={state.isSaving}
              className="min-w-[120px]"
            >
              {state.isSaving ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </Card>
      </form>

      {/* Success Message */}
      {state.successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
            <p className="text-sm text-gray-500">{state.successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRole;
