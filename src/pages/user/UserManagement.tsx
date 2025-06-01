import React, { useState, useEffect } from 'react';
import { useTenantStore } from '../../tenants/tenantStore';
import { userService } from '../../services/user';
import type { StoreUser, UserStats } from '../../services/types/user.types';

// Import all our new components
import UserList from './UserList';
import UserDetail from './UserDetail';
import UserEdit from './UserEdit';
import UserActivity from './UserActivity';
import UserTimeTracking from './UserTimeTracking';
import CreateUser from './CreateUser';

type ViewType = 'list' | 'detail' | 'edit' | 'activity' | 'timeTracking' | 'create';

interface UserManagementState {
  currentView: ViewType;
  selectedUserId: string | null;
  users: StoreUser[];
  userStats: UserStats | null;
  isLoading: boolean;
  errors: Record<string, string>;
  successMessage: string | null;
}

const UserManagement: React.FC = () => {
  const { currentStore } = useTenantStore();
  
  const [state, setState] = useState<UserManagementState>({
    currentView: 'list',
    selectedUserId: null,
    users: [],
    userStats: null,
    isLoading: true,
    errors: {},
    successMessage: null
  });

  // Load users and statistics
  useEffect(() => {
    if (currentStore?.store_id) {
      loadUsers();
      loadUserStats();
    }
  }, [currentStore?.store_id]);

  const loadUsers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await userService.getUsers({
        store_id: currentStore?.store_id || '',
        limit: 100
      });
      setState(prev => ({ 
        ...prev, 
        users: response.users,
        isLoading: false,
        errors: {}
      }));
    } catch (error) {
      console.error('Failed to load users:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        errors: { ...prev.errors, load: 'Failed to load users. Please try again.' }
      }));
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await userService.getUserStats(currentStore?.store_id || '');
      setState(prev => ({ ...prev, userStats: stats }));
    } catch (error) {
      console.error('Failed to load user statistics:', error);
    }
  };

  // Navigation handlers
  const handleNavigateToList = () => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'list', 
      selectedUserId: null,
      errors: {},
      successMessage: null
    }));
  };

  const handleNavigateToDetail = (userId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'detail', 
      selectedUserId: userId,
      errors: {},
      successMessage: null
    }));
  };

  const handleNavigateToEdit = (userId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'edit', 
      selectedUserId: userId,
      errors: {},
      successMessage: null
    }));
  };

  const handleNavigateToActivity = (userId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'activity', 
      selectedUserId: userId,
      errors: {},
      successMessage: null
    }));
  };

  const handleNavigateToTimeTracking = (userId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'timeTracking', 
      selectedUserId: userId,
      errors: {},
      successMessage: null
    }));
  };

  const handleNavigateToCreate = () => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'create', 
      selectedUserId: null,
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
    // Reload data after successful operations
    loadUsers();
    loadUserStats();
    // Clear success message after 5 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, successMessage: null }));
    }, 5000);
  };

  // User operations
  const handleUserSave = () => {
    handleSuccess('User saved successfully');
    handleNavigateToList();
  };

  const handleUserCreate = () => {
    handleSuccess('User created successfully');
    handleNavigateToList();
  };

  // Render the appropriate view based on current state
  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'list':
        return (
          <UserList
            onViewUser={handleNavigateToDetail}
            onEditUser={handleNavigateToEdit}
            onViewActivity={handleNavigateToActivity}
            onViewTimeTracking={handleNavigateToTimeTracking}
            onCreateUser={handleNavigateToCreate}
          />
        );

      case 'detail':
        if (!state.selectedUserId) {
          handleNavigateToList();
          return null;
        }
        return (
          <UserDetail
            userId={state.selectedUserId}
            onBack={handleNavigateToList}
            onEdit={handleNavigateToEdit}
            onViewActivity={handleNavigateToActivity}
            onViewTimeTracking={handleNavigateToTimeTracking}
          />
        );

      case 'edit':
        if (!state.selectedUserId) {
          handleNavigateToList();
          return null;
        }
        return (
          <UserEdit
            userId={state.selectedUserId}
            onBack={handleNavigateToList}
            onSave={handleUserSave}
          />
        );

      case 'activity':
        if (!state.selectedUserId) {
          handleNavigateToList();
          return null;
        }
        return (
          <UserActivity
            userId={state.selectedUserId}
            onBack={handleNavigateToList}
          />
        );

      case 'timeTracking':
        if (!state.selectedUserId) {
          handleNavigateToList();
          return null;
        }
        return (
          <UserTimeTracking
            userId={state.selectedUserId}
            onBack={handleNavigateToList}
          />
        );

      case 'create':
        return (
          <CreateUser
            storeId={currentStore?.store_id || ''}
            onBack={handleNavigateToList}
            onSave={handleUserCreate}
          />
        );

      default:
        return (
          <UserList
            onViewUser={handleNavigateToDetail}
            onEditUser={handleNavigateToEdit}
            onViewActivity={handleNavigateToActivity}
            onViewTimeTracking={handleNavigateToTimeTracking}
            onCreateUser={handleNavigateToCreate}
          />
        );
    }
  };

  // Global notifications
  const renderNotifications = () => {
    if (!state.successMessage && !Object.keys(state.errors).length) return null;

    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm space-y-3">
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
                    onClick={() => setState(prev => {
                      const newErrors = { ...prev.errors };
                      delete newErrors[key];
                      return { ...prev, errors: newErrors };
                    })}
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Global Notifications */}
      {renderNotifications()}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default UserManagement;
