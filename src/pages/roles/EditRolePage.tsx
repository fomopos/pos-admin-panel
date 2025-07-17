import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Button } from '../../components/ui';
import { CategoryWidget } from '../../components/category';
import { InputTextField } from '../../components/ui';
import { roleApiService } from '../../services/role/roleApiService';
import type { PermissionCategory, Permission, ApiRole } from '../../services/role/roleApiService';
import { useTenantStore } from '../../tenants/tenantStore';

const EditRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTenant, currentStore } = useTenantStore();
  
  const [role, setRole] = useState<ApiRole | null>(null);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (id) {
      loadRoleData();
    }
  }, [id]);

  const loadRoleData = async () => {
    if (!currentTenant?.id || !currentStore?.store_id || !id) return;
    
    try {
      setLoading(true);
      const [roleData, permissions] = await Promise.all([
        roleApiService.getRoles(currentTenant.id, currentStore.store_id),
        roleApiService.getPermissions(currentTenant.id, currentStore.store_id)
      ]);
      
      const currentRole = roleData.find(r => r.role_id === id);
      if (!currentRole) {
        setErrors({ general: 'Role not found' });
        return;
      }
      
      setRole(currentRole);
      setFormData({
        name: currentRole.name,
        description: currentRole.description
      });
      setSelectedPermissions(new Set(currentRole.permissions.permissions));
      setPermissionCategories(permissions);
    } catch (error) {
      console.error('Failed to load role data:', error);
      setErrors({ general: 'Failed to load role data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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

  const handleCategoryToggle = (categoryPermissions: Permission[]) => {
    const categoryNames = categoryPermissions.map(p => p.name);
    const allSelected = categoryNames.every(name => selectedPermissions.has(name));
    
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in category
        categoryNames.forEach(name => newSet.delete(name));
      } else {
        // Select all in category
        categoryNames.forEach(name => newSet.add(name));
      }
      return newSet;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Role name must be at least 2 characters long';
    }

    if (selectedPermissions.size === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentTenant?.id || !currentStore?.store_id || !id) return;

    try {
      setSaving(true);
      await roleApiService.updateRole(currentTenant.id, currentStore.store_id, id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: Array.from(selectedPermissions)
      });
      navigate('/settings/roles');
    } catch (error) {
      console.error('Failed to update role:', error);
      setErrors({ general: 'Failed to update role. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Edit Role"
          description="Loading role data..."
        >
          <Button
            variant="outline"
            onClick={() => navigate('/settings/roles')}
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
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Edit Role"
          description="Error loading role"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/settings/roles')}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </PageHeader>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Role</h3>
            <p className="text-red-600 mb-6">{errors.general}</p>
            <Button 
              onClick={() => navigate('/settings/roles')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300"
            >
              Back to Roles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
      <PageHeader
        title={`Edit Role: ${role?.name}`}
        description="Update role permissions and information"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/settings/roles')}
          className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90 transition-all duration-300"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>
      </PageHeader>

      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Widget */}
          <CategoryWidget
            title="Role Information"
            description="Define basic role details and settings"
            icon={ShieldCheckIcon}
            className="bg-white/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Role Name"
                required
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="Enter role name"
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
                <div className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                  <SparklesIcon className="w-4 h-4 mr-2 text-blue-600 inline" />
                  <span className="font-medium text-blue-700">{selectedPermissions.size}</span>
                  <span className="text-gray-600"> permission(s) selected</span>
                </div>
              </div>
            </div>
          </CategoryWidget>

          {/* Permissions Widget */}
          <CategoryWidget
            title="Permissions"
            description="Configure role access permissions"
            icon={ShieldCheckIcon}
            className="bg-white/80 backdrop-blur-sm"
          >
            <div className="space-y-6">
              {errors.permissions && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-medium text-red-600">{errors.permissions}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {permissionCategories.map((category) => {
                  const categoryPermissions = category.permissions;
                  const allSelected = categoryPermissions.every(p => selectedPermissions.has(p.name));
                  const someSelected = categoryPermissions.some(p => selectedPermissions.has(p.name));
                  const IconComponent = getCategoryIcon(category.category_info.icon);
                  
                  return (
                    <div key={category.category_info.name} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.category_info.name}</h3>
                            <p className="text-sm text-gray-600">{category.category_info.description}</p>
                            <p className="text-xs text-gray-500">{categoryPermissions.length} permissions available</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(categoryPermissions)}
                          className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            allSelected 
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300' 
                              : someSelected
                              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 hover:from-yellow-200 hover:to-orange-200 border border-orange-300'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300'
                          }`}
                        >
                          {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryPermissions.map((permission) => {
                          const isSelected = selectedPermissions.has(permission.name);
                          const riskColor = getRiskLevelColor(permission.risk_level);
                          
                          return (
                            <label
                              key={permission.name}
                              className={`group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                isSelected
                                  ? `bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-lg`
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission.name)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <div className="ml-3 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${riskColor}-100 text-${riskColor}-800`}>
                                    {permission.risk_level}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {permission.description}
                                </p>
                                {permission.requires_approval && (
                                  <p className="text-xs text-amber-600 mt-1 font-medium">
                                    ⚠️ Requires approval
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

          {/* Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/settings/roles')}
                disabled={saving}
                className="backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="min-w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {saving ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRolePage;
