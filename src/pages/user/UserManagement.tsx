import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  PageHeader, 
  Button, 
  SearchAndFilter,
  Card
} from '../../components/ui';
import { useTenantStore } from '../../tenants/tenantStore';
import { userService } from '../../services/user';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import type { 
  StoreUser, 
  UserQueryParams
} from '../../services/types/user.types';

type UserStatus = 'active' | 'inactive' | 'suspended';
type ViewMode = 'grid' | 'list';

interface UserManagementState {
  users: StoreUser[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  searchTerm: string;
  statusFilter: UserStatus | 'all';
  viewMode: ViewMode;
  pagination: {
    currentPage: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const { dialogState, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
  
  const [state, setState] = useState<UserManagementState>({
    users: [],
    isLoading: true,
    error: null,
    successMessage: null,
    searchTerm: '',
    statusFilter: 'all',
    viewMode: 'grid',
    pagination: {
      currentPage: 1,
      limit: 20,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  });

  // Load users with current filters and pagination
  useEffect(() => {
    if (currentTenant?.id && currentStore?.store_id) {
      loadUsers();
    }
  }, [
    currentTenant?.id,
    currentStore?.store_id,
    state.searchTerm,
    state.statusFilter,
    state.pagination.currentPage
  ]);

  const loadUsers = async () => {
    if (!currentStore?.store_id) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const params: UserQueryParams = {
        store_id: currentStore.store_id,
        page: state.pagination.currentPage,
        limit: state.pagination.limit,
        ...(state.searchTerm && { search: state.searchTerm }),
        ...(state.statusFilter !== 'all' && { status: state.statusFilter })
      };

      const response = await userService.getUsers(params);
      
      setState(prev => ({
        ...prev,
        users: response.users || [],
        pagination: {
          ...prev.pagination,
          total: response.total || 0,
          hasNextPage: (response.users?.length || 0) >= state.pagination.limit,
          hasPreviousPage: state.pagination.currentPage > 1
        },
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load users:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load users. Please try again.',
        isLoading: false
      }));
    }
  };

  // Filter options
  const statusOptions = [
    { id: 'all', label: 'All Statuses' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'suspended', label: 'Suspended' }
  ];

  // Event handlers
  const handleSearchChange = (value: string) => {
    setState(prev => ({
      ...prev,
      searchTerm: value,
      pagination: { ...prev.pagination, currentPage: 1 }
    }));
  };

  const handleStatusFilterChange = (value: string) => {
    setState(prev => ({
      ...prev,
      statusFilter: value as UserStatus | 'all',
      pagination: { ...prev.pagination, currentPage: 1 }
    }));
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      searchTerm: '',
      statusFilter: 'all',
      pagination: { ...prev.pagination, currentPage: 1 }
    }));
  };

  const handlePageChange = (direction: 'next' | 'previous') => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: direction === 'next' 
          ? prev.pagination.currentPage + 1 
          : prev.pagination.currentPage - 1
      }
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    const user = state.users.find(u => u.user_id === userId);
    if (!user || !currentStore?.store_id) return;

    openDialog(
      async () => {
        try {
          await userService.deleteUser(userId);
          setState(prev => ({ 
            ...prev, 
            successMessage: 'User deleted successfully' 
          }));
          loadUsers(); // Reload the list
        } catch (error) {
          console.error('Failed to delete user:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to delete user. Please try again.' 
          }));
        }
      },
      {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`
      }
    );
  };

  // Get status badge styling
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format last login date
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render user card (grid view)
  const renderUserCard = (user: StoreUser) => (
    <Card key={user.user_id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(user.status as UserStatus)}`}>
            {user.status}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Department:</span>
            <span className="text-gray-900">{user.department || 'Not assigned'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Role:</span>
            <span className="text-gray-900">{user.role || 'Not assigned'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Login:</span>
            <span className="text-gray-900">{formatLastLogin(user.last_login)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/settings/users/${user.user_id}`)}
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/settings/users/edit/${user.user_id}`)}
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/settings/users/${user.user_id}/activity`)}
            >
              <ChartBarIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/settings/users/${user.user_id}/time-tracking`)}
            >
              <ClockIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(user.user_id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  // Render user row (list view)
  const renderUserRow = (user: StoreUser) => (
    <Card key={user.user_id} className="overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-gray-500">Department:</span>
              <span className="ml-1 text-gray-900">{user.department || 'Not assigned'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Role:</span>
              <span className="ml-1 text-gray-900">{user.role || 'Not assigned'}</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(user.status as UserStatus)}`}>
              {user.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/settings/users/${user.user_id}`)}
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/settings/users/edit/${user.user_id}`)}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/settings/users/${user.user_id}/activity`)}
            >
              <ChartBarIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/settings/users/${user.user_id}/time-tracking`)}
            >
              <ClockIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(user.user_id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="md:hidden mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{user.department || 'No dept'}</span>
            <span>{user.role || 'No role'}</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(user.status as UserStatus)}`}>
            {user.status}
          </span>
        </div>
      </div>
    </Card>
  );

  // Render pagination
  const renderPagination = () => {
    if (state.pagination.total <= state.pagination.limit) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            variant="outline"
            onClick={() => handlePageChange('previous')}
            disabled={!state.pagination.hasPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange('next')}
            disabled={!state.pagination.hasNextPage}
          >
            Next
          </Button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{state.pagination.currentPage}</span> of{' '}
              <span className="font-medium">{Math.ceil(state.pagination.total / state.pagination.limit)}</span>
              {' '}({state.pagination.total} total users)
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('previous')}
              disabled={!state.pagination.hasPreviousPage}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('next')}
              disabled={!state.pagination.hasNextPage}
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (state.isLoading && state.users.length === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
        <PageHeader
          title="Users"
          description="Manage store users and their permissions"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Users"
        description="Manage store users and their permissions"
      >
        <Button onClick={() => navigate('/settings/users/new')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{state.error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                className="inline-flex text-red-400 hover:text-red-600"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {state.successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-800">{state.successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                className="inline-flex text-green-400 hover:text-green-600"
                onClick={() => setState(prev => ({ ...prev, successMessage: null }))}
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <SearchAndFilter
        searchValue={state.searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search users by name, email, or role..."
        filterValue={state.statusFilter}
        onFilterChange={handleStatusFilterChange}
        filterOptions={statusOptions}
        filterLabel="Status"
        filterPlaceholder="All Statuses"
        viewMode={state.viewMode}
        onViewModeChange={handleViewModeChange}
        showViewToggle={true}
        showClearButton={true}
        onClear={handleClear}
      />

      {/* Users Grid/List */}
      {state.users.length === 0 ? (
        <Card className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-2 text-gray-500">
            {state.searchTerm || state.statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first user.'}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/settings/users/new')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Loading overlay for subsequent loads */}
          {state.isLoading && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Updating user list...</p>
                </div>
              </div>
            </div>
          )}

          <div className={state.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {state.users.map(user => 
              state.viewMode === 'grid' ? renderUserCard(user) : renderUserRow(user)
            )}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-base font-semibold leading-6 text-gray-900">Delete User</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {dialogState.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <Button
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={dialogState.isLoading}
                    className="ml-3"
                  >
                    {dialogState.isLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    disabled={dialogState.isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

