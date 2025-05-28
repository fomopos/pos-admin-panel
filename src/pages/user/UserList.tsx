import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../../tenants/tenantStore';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import { userService } from '../../services/user';
import type {
  StoreUser,
  UserStats,
  Department,
  UserQueryParams
} from '../../services/types/user.types';

// Define UserStatus type based on StoreUser status
type UserStatus = StoreUser['status'];

interface UserListProps {
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onCreateUser: () => void;
  onViewActivity: (userId: string) => void;
  onViewTimeTracking: (userId: string) => void;
}

interface UserListState {
  users: StoreUser[];
  userStats: UserStats | null;
  isLoading: boolean;
  selectedUsers: string[];
  searchQuery: string;
  statusFilter: UserStatus | 'all';
  departmentFilter: Department | 'all';
  errors: Record<string, string>;
  successMessage: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const UserList: React.FC<UserListProps> = ({
  onViewUser,
  onEditUser,
  onCreateUser,
  onViewActivity,
  onViewTimeTracking
}) => {
  const { currentTenant } = useTenantStore();
  const [state, setState] = useState<UserListState>({
    users: [],
    userStats: null,
    isLoading: false,
    selectedUsers: [],
    searchQuery: '',
    statusFilter: 'all',
    departmentFilter: 'all',
    errors: {},
    successMessage: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  });

  // Fetch users and statistics
  useEffect(() => {
    if (currentTenant?.id) {
      loadUsers();
      loadUserStats();
    }
  }, [currentTenant?.id, state.pagination.page, state.statusFilter, state.departmentFilter, state.searchQuery]);

  const loadUsers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const params: UserQueryParams = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        store_id: currentTenant?.id,
        ...(state.searchQuery && { search: state.searchQuery }),
        ...(state.statusFilter !== 'all' && { status: state.statusFilter }),
        ...(state.departmentFilter !== 'all' && { department: state.departmentFilter })
      };

      const response = await userService.getUsers(params);
      
      setState(prev => ({
        ...prev,
        users: response.users,
        pagination: { ...prev.pagination, total: response.total },
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load users:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: { ...prev.errors, load: 'Failed to load users' }
      }));
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await userService.getUserStats();
      setState(prev => ({ ...prev, userStats: stats }));
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userService.deleteUser(userId);
      setState(prev => ({
        ...prev,
        successMessage: 'User deleted successfully',
        users: prev.users.filter(u => u.user_id !== userId)
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, delete: 'Failed to delete user' }
      }));
    }
  };

  const columns = [
    {
      key: 'user_info',
      title: 'User',
      render: (_: any, user: StoreUser) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <UserGroupIcon className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (_: any, user: StoreUser) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{user.role_name}</div>
          <div className="text-sm text-gray-500">{user.department}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, user: StoreUser) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
            : user.status === 'inactive'
            ? 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
            : 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
        }`}>
          {user.status === 'active' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      )
    },
    {
      key: 'last_login',
      title: 'Last Login',
      render: (_: any, user: StoreUser) => (
        <div className="text-sm text-gray-600">
          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'actions',
            title: 'Actions',
      render: (_: any, user: StoreUser) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewUser(user.user_id)}
            className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditUser(user.user_id)}
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit User"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewActivity(user.user_id)}
            className="text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
            title="View Activity"
          >
            <ChartBarIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewTimeTracking(user.user_id)}
            className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="Time Tracking"
          >
            <ClockIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(user.user_id)}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete User"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <Button onClick={onCreateUser} className="bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      {state.userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.userStats.total_users}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.userStats.active_users}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Clocked In</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.userStats.users_clocked_in}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Logins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.userStats.users_logged_in_today}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="input-base pl-10 w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <select
            value={state.statusFilter}
            onChange={(e) => setState(prev => ({ ...prev, statusFilter: e.target.value as UserStatus | 'all' }))}
            className="input-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={state.departmentFilter}
            onChange={(e) => setState(prev => ({ ...prev, departmentFilter: e.target.value as Department | 'all' }))}
            className="input-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[160px]"
          >
            <option value="all">All Departments</option>
            <option value="Management">Management</option>
            <option value="Sales">Sales</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Inventory">Inventory</option>
            <option value="Security">Security</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500 mt-1">
            {state.users.length} users found
          </p>
        </div>
        <DataTable
          data={state.users}
          columns={columns}
          loading={state.isLoading}
          pagination={true}
          pageSize={state.pagination.limit}
          searchable={false}
          className="border-0"
        />
      </Card>

    </div>
  );
};

export default UserList;
