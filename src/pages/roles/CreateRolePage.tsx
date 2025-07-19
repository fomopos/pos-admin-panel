import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  XMarkIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Button } from '../../components/ui';
import { CategoryWidget } from '../../components/category';
import { InputTextField } from '../../components/ui';
import { roleApiService } from '../../services/role/roleApiService';
import type { PermissionCategory, Permission } from '../../services/role/roleApiService';
import { useTenantStore } from '../../tenants/tenantStore';

const CreateRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  // Track changes to determine if there are unsaved changes
  useEffect(() => {
    const hasData = formData.name.trim() !== '' || 
                   formData.description.trim() !== '' ||
                   selectedPermissions.size > 0;
    setHasChanges(hasData);
  }, [formData, selectedPermissions]);

  const loadPermissions = async () => {
    if (!currentTenant?.id || !currentStore?.store_id) return;
    
    try {
      setLoading(true);
      const permissions = await roleApiService.getPermissions(currentTenant.id, currentStore.store_id);
      setPermissionCategories(permissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setErrors({ general: 'Failed to load permissions. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionName)) {
        newSet.delete(permissionName);
      } else {
        newSet.add(permissionName);
      }
      return newSet;
    });
    setErrors(prev => ({ ...prev, permissions: '' }));
  };

  const handleSelectAllInCategory = (categoryPermissions: Permission[]) => {
    const permissionNames = categoryPermissions.map(p => p.name);
    const allSelected = permissionNames.every(name => selectedPermissions.has(name));
    
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in category
        permissionNames.forEach(name => newSet.delete(name));
      } else {
        // Select all in category
        permissionNames.forEach(name => newSet.add(name));
      }
      return newSet;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }
    
    if (selectedPermissions.size === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const discardChanges = () => {
    setFormData({
      name: '',
      description: ''
    });
    setSelectedPermissions(new Set());
    setErrors({});
  };

  const saveAllChanges = async () => {
    if (!validateForm() || !currentTenant?.id || !currentStore?.store_id) return;
    
    try {
      setSaving(true);
      await roleApiService.createRole(currentTenant.id, currentStore.store_id, {
        name: formData.name,
        description: formData.description,
        permissions: Array.from(selectedPermissions)
      });
      
      navigate('/settings/roles');
    } catch (error) {
      console.error('Failed to create role:', error);
      setErrors({ general: 'Failed to create role. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    // Map icon names to actual icons
    switch (iconName) {
      case 'store':
      case 'shopping-cart':
      case 'package':
        return ShieldCheckIcon;
      case 'building':
      case 'users':
        return ShieldCheckIcon;
      case 'chart-bar':
      case 'bar-chart':
      case 'trending-up':
        return ShieldCheckIcon;
      case 'settings-2':
      case 'settings':
      case 'server':
        return ShieldCheckIcon;
      case 'shield-check':
      case 'warehouse':
      case 'user-check':
      case 'percent':
      case 'file-search':
      case 'folder-tree':
      default:
        return ShieldCheckIcon;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <PageHeader
          title="Create Role"
          description="Loading permissions..."
        >
          <Button
            variant="outline"
            onClick={() => navigate('/settings/roles')}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </PageHeader>
        
        <div className="animate-pulse">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <PageHeader
        title="Create Role"
        description="Create a new user role with specific permissions"
      >
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <div className="hidden sm:flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Unsaved changes
            </div>
          )}
          
          {hasChanges ? (
            <>
              <Button
                onClick={discardChanges}
                variant="outline"
                className="flex items-center space-x-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Discard Changes</span>
              </Button>
              
              <Button
                onClick={saveAllChanges}
                disabled={saving}
                variant="primary"
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>Create Role</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/settings/roles')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Roles</span>
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {/* Basic Information Widget */}
          <CategoryWidget
            title="Basic Information"
            description="Essential role details and identification"
            icon={ShieldCheckIcon}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Role Name"
                required
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="Enter role name (e.g., Store Manager)"
                error={errors.name}
                colSpan="md:col-span-2"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe the role and its responsibilities..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selected Permissions
                </label>
                <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-sm text-gray-700 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-2 text-blue-600" />
                  {selectedPermissions.size} permission(s) selected
                </div>
                {errors.permissions && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.permissions}
                  </p>
                )}
              </div>
            </div>
          </CategoryWidget>

          {/* Permissions Widget */}
          <CategoryWidget
            title="Permissions"
            description="Configure role access permissions"
            icon={ShieldCheckIcon}
            className="lg:col-span-2"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Permission Categories</h3>
                  <p className="text-gray-600">Choose what this role can access</p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {selectedPermissions.size} of {permissionCategories.reduce((total, cat) => total + cat.permissions.length, 0)} selected
                </div>
              </div>

              {errors.permissions && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                    {errors.permissions}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {permissionCategories.map((category) => {
                  const allSelected = category.permissions.every(p => selectedPermissions.has(p.name));
                  const someSelected = category.permissions.some(p => selectedPermissions.has(p.name));
                  const IconComponent = getCategoryIcon(category.category_info.icon);
                  
                  return (
                    <div key={category.category_info.name} className="border-2 border-gray-100 rounded-xl p-6 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{category.category_info.name}</h4>
                            <p className="text-sm text-gray-600">{category.category_info.description}</p>
                            <p className="text-xs text-gray-500">{category.permissions.length} permissions</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAllInCategory(category.permissions)}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                            allSelected 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                              : someSelected
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.permissions.map((permission) => {
                          const isSelected = selectedPermissions.has(permission.name);
                          const riskColor = getRiskLevelColor(permission.risk_level);
                          
                          return (
                            <label
                              key={permission.name}
                              className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission.name)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${riskColor}`}>
                                    {permission.risk_level}
                                  </span>
                                </div>
                                <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                  {permission.description}
                                </p>
                                {permission.requires_approval && (
                                  <p className="text-xs text-amber-600 mt-1 flex items-center">
                                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                                    Requires approval
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CategoryWidget>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRolePage;
