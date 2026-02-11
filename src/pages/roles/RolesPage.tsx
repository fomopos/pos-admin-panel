import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Button, ConfirmDialog, SearchAndFilter } from '../../components/ui';
import { roleApiService } from '../../services/role/roleApiService';
import type { ApiRole } from '../../services/role/roleApiService';
import { useTenantStore } from '../../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../../hooks/useConfirmDialog';

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    if (!currentTenant?.id || !currentStore?.store_id) return;
    
    try {
      setLoading(true);
      setError(null);
      const rolesData = await roleApiService.getRoles(currentTenant.id, currentStore.store_id);
      // Ensure rolesData is always an array
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      setError('Failed to load roles. Please try again.');
      setRoles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = (Array.isArray(roles) ? roles : []).filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'active' && role.is_active) ||
                         (filterBy === 'inactive' && !role.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const handleView = (role: ApiRole) => {
    navigate(`/tenant/roles/${role.role_id}`);
  };

  const handleEdit = (role: ApiRole) => {
    navigate(`/tenant/roles/edit/${role.role_id}`);
  };

  const handleDelete = async (roleId: string) => {
    const role = (Array.isArray(roles) ? roles : []).find(r => r.role_id === roleId);
    if (!role || !currentTenant?.id || !currentStore?.store_id) return;

    deleteDialog.openDeleteDialog(
      role.name,
      async () => {
        await roleApiService.deleteRole(currentTenant.id, currentStore.store_id, roleId);
        await loadRoles(); // Reload the list
      }
    );
  };

  const getRoleTypeBadge = (role: ApiRole) => {
    const permissionCount = role.permissions.count;
    
    if (permissionCount >= 15) {
      return { label: 'Admin', color: 'bg-red-100 text-red-800 border-red-200', icon: ShieldCheckIcon };
    } else if (permissionCount >= 8) {
      return { label: 'Manager', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserGroupIcon };
    } else {
      return { label: 'Staff', color: 'bg-green-100 text-green-800 border-green-200', icon: UserGroupIcon };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <PageHeader
        title="Role Management"
        description="Manage user roles and permissions"
      >
        <Button
          onClick={() => navigate('/tenant/roles/new')}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Role</span>
        </Button>
      </PageHeader>

      {/* Search and Filter Bar */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search roles by name or description..."
        filterValue={filterBy === 'all' ? '' : filterBy}
        onFilterChange={(val) => setFilterBy((val || 'all') as 'all' | 'active' | 'inactive')}
        filterOptions={[
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
        ]}
        filterPlaceholder="All Roles"
        showViewToggle={false}
        className="mb-8"
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State */}
          {filteredRoles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No matching roles' : 'No roles yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating your first role.'}
              </p>
              <Button
                onClick={() => navigate('/tenant/roles/new')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Role
              </Button>
            </div>
          ) : (
            /* Roles Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map(role => {
                const badge = getRoleTypeBadge(role);
                const IconComponent = badge.icon;
                
                return (
                  <div
                    key={role.role_id}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                          {role.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {role.description || 'No description provided'}
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Permissions</span>
                          <span className="font-medium text-slate-700">{role.permissions.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-medium ${role.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {role.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Created</span>
                          <span className="font-medium text-slate-700">{formatDate(role.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleView(role)}
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-blue-50/50 hover:bg-blue-100/50 border-blue-200/50 text-blue-600 hover:text-blue-700 transition-all duration-200"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleEdit(role)}
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-200/50 text-emerald-600 hover:text-emerald-700 transition-all duration-200"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(role.role_id)}
                          variant="outline"
                          size="sm"
                          className="bg-red-50/50 hover:bg-red-100/50 border-red-200/50 text-red-600 hover:text-red-700 transition-all duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

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

export default RolesPage;
