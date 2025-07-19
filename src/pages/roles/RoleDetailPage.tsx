import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Button, ConfirmDialog } from '../../components/ui';
import { CategoryWidget } from '../../components/category';
import { roleApiService } from '../../services/role/roleApiService';
import type { PermissionCategory, Permission, ApiRole } from '../../services/role/roleApiService';
import { useTenantStore } from '../../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../../hooks/useConfirmDialog';

const RoleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTenant, currentStore } = useTenantStore();
  
  const [role, setRole] = useState<ApiRole | null>(null);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    if (id) {
      loadRoleData();
    }
  }, [id]);

  const loadRoleData = async () => {
    if (!currentTenant?.id || !currentStore?.store_id || !id) return;
    
    try {
      setLoading(true);
      const [rolesData, permissions] = await Promise.all([
        roleApiService.getRoles(currentTenant.id, currentStore.store_id),
        roleApiService.getPermissions(currentTenant.id, currentStore.store_id)
      ]);
      
      const currentRole = rolesData.find(r => r.role_id === id);
      if (!currentRole) {
        setError('Role not found');
        return;
      }
      
      setRole(currentRole);
      setPermissionCategories(permissions);
    } catch (error) {
      console.error('Failed to load role data:', error);
      setError('Failed to load role data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/settings/roles/edit/${id}`);
  };

  const handleDelete = () => {
    if (!role) return;
    
    deleteDialog.openDeleteDialog(
      role.name,
      async () => {
        if (!currentTenant?.id || !currentStore?.store_id || !id) return;
        await roleApiService.deleteRole(currentTenant.id, currentStore.store_id, id);
        navigate('/settings/roles');
      }
    );
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

  const getPermissionsByCategory = () => {
    if (!role || !permissionCategories.length) return {};
    
    const categorizedPermissions: Record<string, Permission[]> = {};
    
    permissionCategories.forEach(category => {
      const rolePermissions = category.permissions.filter(permission => 
        role.permissions.permissions.includes(permission.name)
      );
      
      if (rolePermissions.length > 0) {
        categorizedPermissions[category.category_info.name] = rolePermissions;
      }
    });
    
    return categorizedPermissions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Role Details"
          description="Loading role information..."
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

  if (error || !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
        <PageHeader
          title="Role Details"
          description="Error loading role"
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
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Role</h3>
            <p className="text-red-600 mb-6">{error || 'Role not found'}</p>
            <Button 
              onClick={() => navigate('/settings/roles')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Back to Roles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
      <PageHeader
        title={role.name}
        description={role.description || 'No description provided'}
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
                <p className="text-xl font-bold text-gray-900">{role.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 bg-gradient-to-br from-emerald-50/50 to-green-50/50 border border-emerald-200/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-emerald-700">Total Permissions</h3>
                <p className="text-xl font-bold text-gray-900">{role.permissions.count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 border border-amber-200/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-amber-700">Status</h3>
                <p className="text-xl font-bold text-gray-900">
                  {role.is_active ? 'Active' : 'Inactive'}
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
                onClick={handleEdit}
                className="bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-200/50 text-emerald-600 hover:text-emerald-700 transition-all duration-200"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Role
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="bg-red-50/50 hover:bg-red-100/50 border-red-200/50 text-red-600 hover:text-red-700 transition-all duration-200"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Role
              </Button>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <CategoryWidget
          title="Role Information"
          description="Detailed role information and metadata"
          icon={ShieldCheckIcon}
          className="bg-white/80 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">{new Date(role.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <p className="text-sm text-gray-900">{role.created_by}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <p className="text-sm text-gray-900">{new Date(role.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
              <p className="text-sm text-gray-900">{role.updated_by}</p>
            </div>
          </div>
        </CategoryWidget>

        {/* Permissions by Category */}
        <CategoryWidget
          title="Assigned Permissions"
          description="Permissions granted to this role organized by category"
          icon={ShieldCheckIcon}
          className="bg-white/80 backdrop-blur-sm"
        >
          {Object.keys(permissionsByCategory).length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Permissions Assigned</h3>
              <p className="text-gray-400">This role has no permissions assigned to it.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([categoryName, permissions]) => {
                const categoryInfo = permissionCategories.find(c => c.category_info.name === categoryName)?.category_info;
                const IconComponent = getCategoryIcon(categoryInfo?.icon || 'shield-check');
                
                return (
                  <div key={categoryName} className="border-2 border-gray-100 rounded-xl p-6 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                        <p className="text-sm text-gray-600">{categoryInfo?.description}</p>
                        <p className="text-xs text-gray-500">{permissions.length} permissions</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((permission) => {
                        const riskColor = getRiskLevelColor(permission.risk_level);
                        
                        return (
                          <div
                            key={permission.name}
                            className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-blue-900">
                                {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${riskColor}-100 text-${riskColor}-800`}>
                                {permission.risk_level}
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 mb-2 line-clamp-2">
                              {permission.description}
                            </p>
                            {permission.requires_approval && (
                              <p className="text-xs text-amber-600 font-medium">
                                ⚠️ Requires approval
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CategoryWidget>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        variant={deleteDialog.dialogState.variant}
        isLoading={deleteDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default RoleDetailPage;
