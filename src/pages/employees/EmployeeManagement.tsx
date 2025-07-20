import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import {
  PageHeader,
  SearchAndFilter,
  Widget,
  Button,
  Card,
  Alert,
  Badge,
  Loading
} from '../../components/ui';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useTenantStore } from '../../tenants/tenantStore';
import { userService } from '../../services/user';
import type { StoreUser, UserQueryParams, UserStatus } from '../../services/types/user.types';

// Employee Management State
interface EmployeeManagementState {
  employees: StoreUser[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  searchTerm: string;
  statusFilter: UserStatus | 'all';
  departmentFilter: string;
  roleFilter: string;
  viewMode: 'grid' | 'list';
  pagination: {
    currentPage: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  stats: {
    total: number;
    active: number;
    inactive: number;
    clockedIn: number;
    onBreak: number;
  };
}

// Employee Statistics Widget
const EmployeeStatsWidget: React.FC<{ stats: EmployeeManagementState['stats'] }> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
    <Card className="p-4">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          <UsersIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">Total Employees</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
      </div>
    </Card>
    
    <Card className="p-4">
      <div className="flex items-center">
        <div className="p-2 bg-green-100 rounded-lg">
          <CheckCircleIcon className="w-6 h-6 text-green-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">Active</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
        </div>
      </div>
    </Card>
    
    <Card className="p-4">
      <div className="flex items-center">
        <div className="p-2 bg-red-100 rounded-lg">
          <XCircleIcon className="w-6 h-6 text-red-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">Inactive</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
        </div>
      </div>
    </Card>
    
    <Card className="p-4">
      <div className="flex items-center">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <ClockIcon className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">Clocked In</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.clockedIn}</p>
        </div>
      </div>
    </Card>
    
    <Card className="p-4">
      <div className="flex items-center">
        <div className="p-2 bg-orange-100 rounded-lg">
          <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">On Break</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.onBreak}</p>
        </div>
      </div>
    </Card>
  </div>
);

// Employee Card Component for Grid View
const EmployeeCard: React.FC<{
  employee: StoreUser;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManageSchedule: (id: string) => void;
  onTimeTracking: (id: string) => void;
  onPerformance: (id: string) => void;
}> = ({ employee, onView, onEdit, onDelete, onManageSchedule, onTimeTracking, onPerformance }) => {
  
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return { color: 'green' as const, label: 'Active' };
      case 'inactive':
        return { color: 'gray' as const, label: 'Inactive' };
      case 'suspended':
        return { color: 'red' as const, label: 'Suspended' };
      default:
        return { color: 'gray' as const, label: 'Unknown' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statusBadge = getStatusBadge(employee.status as UserStatus);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-sm text-gray-600">{employee.employee_id || 'No ID'}</p>
            </div>
          </div>
          <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
        </div>

        {/* Employee Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm">
            <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{employee.email}</span>
          </div>
          
          {employee.phone && (
            <div className="flex items-center text-sm">
              <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{employee.phone}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <BriefcaseIcon className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{employee.role_name || 'No role assigned'}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{employee.department || 'No department'}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-900">Hired: {formatDate(employee.hire_date)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-900">Last login: {formatDate(employee.last_login)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(employee.user_id)}
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee.user_id)}
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageSchedule(employee.user_id)}
          >
            <CalendarDaysIcon className="w-4 h-4 mr-1" />
            Schedule
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTimeTracking(employee.user_id)}
          >
            <ClockIcon className="w-4 h-4 mr-1" />
            Time
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPerformance(employee.user_id)}
          >
            <ChartBarIcon className="w-4 h-4 mr-1" />
            Performance
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(employee.user_id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Employee Row Component for List View
const EmployeeRow: React.FC<{
  employee: StoreUser;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManageSchedule: (id: string) => void;
  onTimeTracking: (id: string) => void;
  onPerformance: (id: string) => void;
}> = ({ employee, onView, onEdit, onDelete, onManageSchedule, onTimeTracking, onPerformance }) => {
  
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return { color: 'green' as const, label: 'Active' };
      case 'inactive':
        return { color: 'gray' as const, label: 'Inactive' };
      case 'suspended':
        return { color: 'red' as const, label: 'Suspended' };
      default:
        return { color: 'gray' as const, label: 'Unknown' };
    }
  };

  const statusBadge = getStatusBadge(employee.status as UserStatus);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Employee Info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-sm text-gray-600">{employee.email}</p>
            </div>
          </div>
          
          {/* Employee Details - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="text-sm">
              <span className="text-gray-500">ID:</span>
              <span className="ml-1 text-gray-900">{employee.employee_id || 'Not set'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Role:</span>
              <span className="ml-1 text-gray-900">{employee.role_name || 'Not assigned'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Department:</span>
              <span className="ml-1 text-gray-900">{employee.department || 'Not assigned'}</span>
            </div>
            <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(employee.user_id)}
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(employee.user_id)}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageSchedule(employee.user_id)}
            >
              <CalendarDaysIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTimeTracking(employee.user_id)}
            >
              <ClockIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPerformance(employee.user_id)}
            >
              <ChartBarIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(employee.user_id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Details */}
        <div className="lg:hidden mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{employee.role_name || 'No role'}</span>
            <span>{employee.department || 'No dept'}</span>
          </div>
          <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
        </div>
      </div>
    </Card>
  );
};

// Main Employee Management Component
const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const { dialogState, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
  
  const [state, setState] = useState<EmployeeManagementState>({
    employees: [],
    isLoading: true,
    error: null,
    successMessage: null,
    searchTerm: '',
    statusFilter: 'all',
    departmentFilter: '',
    roleFilter: '',
    viewMode: 'grid',
    pagination: {
      currentPage: 1,
      limit: 20,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false
    },
    stats: {
      total: 0,
      active: 0,
      inactive: 0,
      clockedIn: 0,
      onBreak: 0
    }
  });

  // Filter options
  const statusOptions = [
    { id: 'all', label: 'All Statuses' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'suspended', label: 'Suspended' }
  ];

  const departmentOptions = [
    { id: '', label: 'All Departments' },
    { id: 'Management', label: 'Management' },
    { id: 'Sales', label: 'Sales' },
    { id: 'Customer Service', label: 'Customer Service' },
    { id: 'Inventory', label: 'Inventory' },
    { id: 'Security', label: 'Security' },
    { id: 'Maintenance', label: 'Maintenance' },
    { id: 'Finance', label: 'Finance' },
    { id: 'Marketing', label: 'Marketing' }
  ];

  // Load employees data
  const loadEmployees = async () => {
    if (!currentStore?.store_id) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const params: UserQueryParams = {
        store_id: currentStore.store_id,
        page: state.pagination.currentPage,
        limit: state.pagination.limit,
        ...(state.searchTerm && { search: state.searchTerm }),
        ...(state.statusFilter !== 'all' && { status: state.statusFilter as UserStatus }),
        ...(state.departmentFilter && { department: state.departmentFilter }),
        ...(state.roleFilter && { role: state.roleFilter })
      };

      const response = await userService.getUsers(params);
      
      // Calculate statistics
      const stats = {
        total: response.total,
        active: response.users.filter(emp => emp.status === 'active').length,
        inactive: response.users.filter(emp => emp.status === 'inactive').length,
        clockedIn: Math.floor(Math.random() * response.users.length), // Mock data
        onBreak: Math.floor(Math.random() * 5) // Mock data
      };
      
      setState(prev => ({
        ...prev,
        employees: response.users || [],
        stats,
        pagination: {
          ...prev.pagination,
          total: response.total || 0,
          hasNextPage: (response.users?.length || 0) >= state.pagination.limit,
          hasPreviousPage: state.pagination.currentPage > 1
        },
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load employees:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load employees. Please try again.',
        isLoading: false
      }));
    }
  };

  // Load employees when dependencies change
  useEffect(() => {
    if (currentTenant?.id && currentStore?.store_id) {
      loadEmployees();
    }
  }, [
    currentTenant?.id,
    currentStore?.store_id,
    state.searchTerm,
    state.statusFilter,
    state.departmentFilter,
    state.roleFilter,
    state.pagination.currentPage
  ]);

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

  const handleDepartmentFilterChange = (value: string) => {
    setState(prev => ({
      ...prev,
      departmentFilter: value,
      pagination: { ...prev.pagination, currentPage: 1 }
    }));
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      searchTerm: '',
      statusFilter: 'all',
      departmentFilter: '',
      roleFilter: '',
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

  // Navigation handlers
  const handleViewEmployee = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleEditEmployee = (employeeId: string) => {
    navigate(`/employees/${employeeId}/edit`);
  };

  const handleManageSchedule = (employeeId: string) => {
    navigate(`/employees/${employeeId}/schedule`);
  };

  const handleTimeTracking = (employeeId: string) => {
    navigate(`/employees/${employeeId}/time-tracking`);
  };

  const handlePerformance = (employeeId: string) => {
    navigate(`/employees/${employeeId}/performance`);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    const employee = state.employees.find(emp => emp.user_id === employeeId);
    if (!employee || !currentStore?.store_id) return;

    openDialog(
      async () => {
        try {
          await userService.deleteUser(employeeId);
          setState(prev => ({ 
            ...prev, 
            successMessage: 'Employee deleted successfully' 
          }));
          loadEmployees(); // Reload the list
        } catch (error) {
          console.error('Failed to delete employee:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to delete employee. Please try again.' 
          }));
        }
      },
      {
        title: 'Delete Employee',
        message: `Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone and will remove all associated data including time tracking, schedules, and performance records.`
      }
    );
  };

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
              {' '}({state.pagination.total} total employees)
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('previous')}
              disabled={!state.pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('next')}
              disabled={!state.pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (state.isLoading && state.employees.length === 0) {
    return (
      <Loading
        title="Loading Employees"
        description="Please wait while we fetch employee data..."
      />
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Employee Management"
        description="Comprehensive employee management with schedules, time tracking, and performance"
      >
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/employees/bulk-import')}
          >
            Import Employees
          </Button>
          <Button onClick={() => navigate('/employees/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </PageHeader>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="error" onClose={() => setState(prev => ({ ...prev, error: null }))}>
          {state.error}
        </Alert>
      )}

      {/* Success Alert */}
      {state.successMessage && (
        <Alert variant="success" onClose={() => setState(prev => ({ ...prev, successMessage: null }))}>
          {state.successMessage}
        </Alert>
      )}

      {/* Statistics Dashboard */}
      <EmployeeStatsWidget stats={state.stats} />

      {/* Advanced Search and Filter */}
      <Widget
        title="Search & Filter"
        description="Find employees by name, email, role, or department"
        className="mb-6"
      >
        <div className="space-y-4">
          <SearchAndFilter
            searchValue={state.searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search employees by name, email, or employee ID..."
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
          
          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={state.departmentFilter}
                onChange={(e) => handleDepartmentFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departmentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Widget>

      {/* Employees Grid/List */}
      {state.employees.length === 0 ? (
        <Card className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No employees found</h3>
          <p className="mt-2 text-gray-500">
            {state.searchTerm || state.statusFilter !== 'all' || state.departmentFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first employee.'}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/employees/new')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Employee
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
                  <p className="text-gray-600 mt-2">Updating employee list...</p>
                </div>
              </div>
            </div>
          )}

          <div className={state.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {state.employees.map(employee => 
              state.viewMode === 'grid' ? (
                <EmployeeCard
                  key={employee.user_id}
                  employee={employee}
                  onView={handleViewEmployee}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                  onManageSchedule={handleManageSchedule}
                  onTimeTracking={handleTimeTracking}
                  onPerformance={handlePerformance}
                />
              ) : (
                <EmployeeRow
                  key={employee.user_id}
                  employee={employee}
                  onView={handleViewEmployee}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                  onManageSchedule={handleManageSchedule}
                  onTimeTracking={handleTimeTracking}
                  onPerformance={handlePerformance}
                />
              )
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
                      <h3 className="text-base font-semibold leading-6 text-gray-900">
                        {dialogState.title}
                      </h3>
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

export default EmployeeManagement;
