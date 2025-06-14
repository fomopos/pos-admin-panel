import React, { useState, useEffect } from 'react';
import { useTenantStore } from '../../tenants/tenantStore';
import { roleService } from '../../services/role';
import type { UserRole } from '../../services/types/store.types';
import { RoleManagerGuard } from '../../components/ui';

// Import role management components
import { RoleList } from './RoleList';
import CreateRole from './CreateRole';
import EditRole from './EditRole';
import RoleDetail from './RoleDetail';

type ViewType = 'list' | 'create' | 'edit' | 'detail';

interface RoleManagementState {
  currentView: ViewType;
  selectedRoleId: string | null;
  roles: UserRole[];
  isLoading: boolean;
  errors: Record<string, string>;
  successMessage: string | null;
}

const RoleManagement: React.FC = () => {
  const { currentStore } = useTenantStore();
  
  const [state, setState] = useState<RoleManagementState>({
    currentView: 'list',
    selectedRoleId: null,
    roles: [],
    isLoading: true,
    errors: {},
    successMessage: null
  });

  // Load roles when store changes
  useEffect(() => {
    if (currentStore?.store_id) {
      loadRoles();
    }
  }, [currentStore?.store_id]);

  const loadRoles = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await roleService.getRoles(currentStore?.store_id || '');
      setState(prev => ({ 
        ...prev, 
        roles: response.roles,
        isLoading: false,
        errors: {}
      }));
    } catch (error) {
      console.error('Failed to load roles:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        errors: { ...prev.errors, load: 'Failed to load roles. Please try again.' }
      }));
    }
  };

  // Navigation handlers
  const handleNavigateToList = () => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'list', 
      selectedRoleId: null,
      errors: {},
      successMessage: null
    }));
  };

  const handleNavigateToEdit = (roleId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'edit', 
      selectedRoleId: roleId,
      errors: {},
      successMessage: null
    }));
  };

  const handleNavigateToDetail = (roleId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'detail', 
      selectedRoleId: roleId,
      errors: {},
      successMessage: null
    }));
  };

  // Success/Error handlers
  const handleSuccess = (message: string) => {
    setState(prev => ({ 
      ...prev, 
      successMessage: message,
      errors: {}
    }));
    // Reload roles after successful operations
    loadRoles();
    // Clear success message after 5 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, successMessage: null }));
    }, 5000);
  };

  // Role operations
  const handleRoleCreate = () => {
    handleSuccess('Role created successfully');
    handleNavigateToList();
  };

  const handleRoleUpdate = () => {
    handleSuccess('Role updated successfully');
    handleNavigateToList();
  };

  const handleRoleDelete = async (roleId: string) => {
    try {
      // Check if role can be deleted
      const { canDelete, userCount } = await roleService.canDeleteRole(roleId);
      
      if (!canDelete) {
        setState(prev => ({ 
          ...prev, 
          errors: { delete: `Cannot delete role. It is currently assigned to ${userCount} user(s).` }
        }));
        return;
      }

      const confirmDelete = window.confirm('Are you sure you want to delete this role? This action cannot be undone.');
      if (!confirmDelete) return;

      await roleService.deleteRole(roleId);
      handleSuccess('Role deleted successfully');
    } catch (error) {
      console.error('Failed to delete role:', error);
      setState(prev => ({ 
        ...prev, 
        errors: { delete: 'Failed to delete role. Please try again.' }
      }));
    }
  };

  const handleDuplicateRole = async (roleId: string) => {
    try {
      const role = state.roles.find(r => r.role_id === roleId);
      if (!role) return;

      const newRoleName = prompt('Enter name for the new role:', `${role.role_name} (Copy)`);
      if (!newRoleName || newRoleName.trim() === '') return;

      await roleService.duplicateRole(roleId, newRoleName.trim());
      handleSuccess('Role duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate role:', error);
      setState(prev => ({ 
        ...prev, 
        errors: { duplicate: 'Failed to duplicate role. Please try again.' }
      }));
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'create':
        return (
          <CreateRole
            storeId={currentStore?.store_id || ''}
            onBack={handleNavigateToList}
            onSave={handleRoleCreate}
          />
        );

      case 'edit':
        if (!state.selectedRoleId) {
          handleNavigateToList();
          return null;
        }
        return (
          <EditRole
            roleId={state.selectedRoleId}
            onBack={handleNavigateToList}
            onSave={handleRoleUpdate}
          />
        );

      case 'detail':
        if (!state.selectedRoleId) {
          handleNavigateToList();
          return null;
        }
        return (
          <RoleDetail
            roleId={state.selectedRoleId}
            onBack={handleNavigateToList}
            onEdit={() => handleNavigateToEdit(state.selectedRoleId!)}
            onDelete={() => handleRoleDelete(state.selectedRoleId!)}
            onDuplicate={() => handleDuplicateRole(state.selectedRoleId!)}
          />
        );

      default:
        return (
          <RoleList
            roles={state.roles}
            isLoading={state.isLoading}
            onViewRole={handleNavigateToDetail}
            onEditRole={handleNavigateToEdit}
            onDeleteRole={handleRoleDelete}
          />
        );
    }
  };

  return (
    <RoleManagerGuard 
      fallback={
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600 mb-4">
                You don't have permission to access role management. Please contact your administrator if you need access to this feature.
              </p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50/50">
        {/* Success and Error Messages */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {state.successMessage && (
            <div className="bg-white border border-green-200 rounded-lg p-4 shadow-lg ring-1 ring-black/5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{state.successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setState(prev => ({ ...prev, successMessage: null }))}
                      className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {Object.entries(state.errors).map(([key, message]) => (
            <div key={key} className="bg-white border border-red-200 rounded-lg p-4 shadow-lg ring-1 ring-black/5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{message}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => {
                        setState(prev => {
                          const newErrors = { ...prev.errors };
                          delete newErrors[key];
                          return { ...prev, errors: newErrors };
                        });
                      }}
                      className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {renderCurrentView()}
        </div>
      </div>
    </RoleManagerGuard>
  );
};

export default RoleManagement;
