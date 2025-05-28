// Mock data for User Management development
import type { StoreUser, UserStats, UserActivity, UserTimeTracking, UsersResponse } from '../types/user.types';

// Mock users data
export const mockUsers: StoreUser[] = [
  {
    user_id: '1',
    store_id: '10002',
    tenant_id: 'tenant-123',
    email: 'john.doe@store.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1-555-0123',
    role: 'admin',
    role_name: 'Store Manager',
    permissions: ['sales_create', 'sales_read', 'sales_update', 'sales_delete', 'sales_void', 'sales_refund', 'products_create', 'products_read', 'products_update', 'products_delete', 'users_create', 'users_read', 'users_update', 'users_delete', 'settings_store', 'settings_users', 'manager_functions'],
    status: 'active',
    profile_picture: undefined,
    employee_id: 'EMP001',
    department: 'Management',
    hire_date: '2024-01-15',
    last_login: '2025-05-28T10:30:00Z',
    login_count: 145,
    two_factor_enabled: true,
    session_active: true,
    access_schedule: {
      enabled: true,
      schedule: [
        { day: 'monday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'tuesday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'wednesday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'thursday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'friday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'saturday', start_time: '10:00', end_time: '14:00', enabled: false },
        { day: 'sunday', start_time: '10:00', end_time: '14:00', enabled: false }
      ],
      timezone: 'America/New_York'
    },
    pin_code: '1234',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2025-05-28T08:00:00Z',
    created_by: 'system',
    updated_by: 'admin'
  },
  {
    user_id: '2',
    store_id: '10002',
    tenant_id: 'tenant-123',
    email: 'sarah.wilson@store.com',
    first_name: 'Sarah',
    last_name: 'Wilson',
    phone: '+1-555-0124',
    role: 'cashier',
    role_name: 'Sales Associate',
    permissions: ['sales_create', 'sales_read', 'products_read', 'customers_read', 'customers_create'],
    status: 'active',
    profile_picture: undefined,
    employee_id: 'EMP002',
    department: 'Sales',
    hire_date: '2024-03-01',
    last_login: '2025-05-28T09:15:00Z',
    login_count: 89,
    two_factor_enabled: false,
    session_active: true,
    access_schedule: {
      enabled: true,
      schedule: [
        { day: 'monday', start_time: '10:00', end_time: '18:00', enabled: true },
        { day: 'tuesday', start_time: '10:00', end_time: '18:00', enabled: true },
        { day: 'wednesday', start_time: '10:00', end_time: '18:00', enabled: true },
        { day: 'thursday', start_time: '10:00', end_time: '18:00', enabled: true },
        { day: 'friday', start_time: '10:00', end_time: '18:00', enabled: true },
        { day: 'saturday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'sunday', start_time: '12:00', end_time: '16:00', enabled: false }
      ],
      timezone: 'America/New_York'
    },
    pin_code: '5678',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2025-05-28T08:00:00Z',
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    user_id: '3',
    store_id: '10002',
    tenant_id: 'tenant-123',
    email: 'mike.johnson@store.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    phone: '+1-555-0125',
    role: 'supervisor',
    role_name: 'Shift Supervisor',
    permissions: ['sales_create', 'sales_read', 'sales_update', 'products_read', 'customers_read', 'customers_update', 'manager_functions', 'discount_apply'],
    status: 'active',
    profile_picture: undefined,
    employee_id: 'EMP003',
    department: 'Sales',
    hire_date: '2024-02-15',
    last_login: '2025-05-27T16:45:00Z',
    login_count: 102,
    two_factor_enabled: true,
    session_active: false,
    access_schedule: {
      enabled: true,
      schedule: [
        { day: 'monday', start_time: '14:00', end_time: '22:00', enabled: true },
        { day: 'tuesday', start_time: '14:00', end_time: '22:00', enabled: true },
        { day: 'wednesday', start_time: '14:00', end_time: '22:00', enabled: true },
        { day: 'thursday', start_time: '14:00', end_time: '22:00', enabled: true },
        { day: 'friday', start_time: '14:00', end_time: '22:00', enabled: true },
        { day: 'saturday', start_time: '12:00', end_time: '20:00', enabled: true },
        { day: 'sunday', start_time: '12:00', end_time: '20:00', enabled: true }
      ],
      timezone: 'America/New_York'
    },
    pin_code: '9012',
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2025-05-28T08:00:00Z',
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    user_id: '4',
    store_id: '10002',
    tenant_id: 'tenant-123',
    email: 'lisa.brown@store.com',
    first_name: 'Lisa',
    last_name: 'Brown',
    phone: '+1-555-0126',
    role: 'cashier',
    role_name: 'Sales Associate',
    permissions: ['sales_create', 'sales_read', 'products_read', 'customers_read'],
    status: 'inactive',
    profile_picture: undefined,
    employee_id: 'EMP004',
    department: 'Sales',
    hire_date: '2024-04-10',
    last_login: '2025-05-25T14:20:00Z',
    login_count: 45,
    two_factor_enabled: false,
    session_active: false,
    access_schedule: {
      enabled: false,
      schedule: [
        { day: 'monday', start_time: '10:00', end_time: '18:00', enabled: false },
        { day: 'tuesday', start_time: '10:00', end_time: '18:00', enabled: false },
        { day: 'wednesday', start_time: '10:00', end_time: '18:00', enabled: false },
        { day: 'thursday', start_time: '10:00', end_time: '18:00', enabled: false },
        { day: 'friday', start_time: '10:00', end_time: '18:00', enabled: false },
        { day: 'saturday', start_time: '09:00', end_time: '17:00', enabled: false },
        { day: 'sunday', start_time: '12:00', end_time: '16:00', enabled: false }
      ],
      timezone: 'America/New_York'
    },
    pin_code: '3456',
    created_at: '2024-04-10T08:00:00Z',
    updated_at: '2025-05-28T08:00:00Z',
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    user_id: '5',
    store_id: '10002',
    tenant_id: 'tenant-123',
    email: 'david.garcia@store.com',
    first_name: 'David',
    last_name: 'Garcia',
    phone: '+1-555-0127',
    role: 'inventory',
    role_name: 'Inventory Manager',
    permissions: ['products_read', 'products_update', 'inventory_read', 'inventory_update', 'inventory_adjust', 'reports_inventory'],
    status: 'active',
    profile_picture: undefined,
    employee_id: 'EMP005',
    department: 'Inventory',
    hire_date: '2024-01-20',
    last_login: '2025-05-28T07:30:00Z',
    login_count: 134,
    two_factor_enabled: true,
    session_active: true,
    access_schedule: {
      enabled: true,
      schedule: [
        { day: 'monday', start_time: '08:00', end_time: '16:00', enabled: true },
        { day: 'tuesday', start_time: '08:00', end_time: '16:00', enabled: true },
        { day: 'wednesday', start_time: '08:00', end_time: '16:00', enabled: true },
        { day: 'thursday', start_time: '08:00', end_time: '16:00', enabled: true },
        { day: 'friday', start_time: '08:00', end_time: '16:00', enabled: true },
        { day: 'saturday', start_time: '08:00', end_time: '12:00', enabled: true },
        { day: 'sunday', start_time: '08:00', end_time: '12:00', enabled: false }
      ],
      timezone: 'America/New_York'
    },
    pin_code: '7890',
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2025-05-28T08:00:00Z',
    created_by: 'admin',
    updated_by: 'admin'
  }
];

// Mock user statistics
export const mockUserStats: UserStats = {
  total_users: 5,
  active_users: 4,
  suspended_users: 0,
  users_logged_in_today: 4,
  users_clocked_in: 3,
  new_users_this_month: 1,
  avg_session_duration: '4h 32m',
  role_distribution: [
    { role_name: 'Store Manager', count: 1, percentage: 20 },
    { role_name: 'Sales Associate', count: 2, percentage: 40 },
    { role_name: 'Shift Supervisor', count: 1, percentage: 20 },
    { role_name: 'Inventory Manager', count: 1, percentage: 20 }
  ],
  recent_logins: [
    { user_id: '1', user_name: 'John Doe', last_login: '2025-05-28T10:30:00Z', device_info: 'POS Terminal 1' },
    { user_id: '2', user_name: 'Sarah Wilson', last_login: '2025-05-28T09:15:00Z', device_info: 'POS Terminal 2' },
    { user_id: '5', user_name: 'David Garcia', last_login: '2025-05-28T07:30:00Z', device_info: 'Mobile App' },
    { user_id: '3', user_name: 'Mike Johnson', last_login: '2025-05-27T16:45:00Z', device_info: 'POS Terminal 3' }
  ]
};

// Mock user activities
export const mockUserActivities: UserActivity[] = [
  {
    activity_id: '1',
    user_id: '1',
    activity_type: 'login',
    description: 'User logged in from POS Terminal 1',
    metadata: { terminal_id: 'POS-001', location: 'Front Counter' },
    ip_address: '192.168.1.101',
    device_info: 'POS Terminal 1',
    location: 'Store Floor',
    timestamp: '2025-05-28T10:30:00Z',
    session_id: 'sess_123456'
  },
  {
    activity_id: '2',
    user_id: '1',
    activity_type: 'transaction',
    description: 'Processed sale transaction #12345',
    metadata: { transaction_id: '12345', amount: 45.99, items: 3 },
    ip_address: '192.168.1.101',
    device_info: 'POS Terminal 1',
    location: 'Store Floor',
    timestamp: '2025-05-28T10:45:00Z',
    session_id: 'sess_123456'
  },
  {
    activity_id: '3',
    user_id: '2',
    activity_type: 'clock_in',
    description: 'Clocked in for shift',
    metadata: { shift_type: 'morning', scheduled_start: '10:00' },
    ip_address: '192.168.1.102',
    device_info: 'POS Terminal 2',
    location: 'Store Floor',
    timestamp: '2025-05-28T10:00:00Z',
    session_id: 'sess_789012'
  }
];

// Mock time tracking records
export const mockTimeTracking: UserTimeTracking[] = [
  {
    tracking_id: '1',
    user_id: '1',
    clock_in_time: '2025-05-28T09:00:00Z',
    clock_out_time: undefined,
    break_start_time: undefined,
    break_end_time: undefined,
    total_hours: undefined,
    break_duration: undefined,
    status: 'clocked_in',
    notes: 'Opening shift',
    location: 'Store Floor',
    created_at: '2025-05-28T09:00:00Z',
    updated_at: '2025-05-28T09:00:00Z'
  },
  {
    tracking_id: '2',
    user_id: '2',
    clock_in_time: '2025-05-28T10:00:00Z',
    clock_out_time: undefined,
    break_start_time: undefined,
    break_end_time: undefined,
    total_hours: undefined,
    break_duration: undefined,
    status: 'clocked_in',
    notes: 'Regular shift',
    location: 'Store Floor',
    created_at: '2025-05-28T10:00:00Z',
    updated_at: '2025-05-28T10:00:00Z'
  },
  {
    tracking_id: '3',
    user_id: '5',
    clock_in_time: '2025-05-28T08:00:00Z',
    clock_out_time: undefined,
    break_start_time: undefined,
    break_end_time: undefined,
    total_hours: undefined,
    break_duration: undefined,
    status: 'clocked_in',
    notes: 'Inventory management',
    location: 'Warehouse',
    created_at: '2025-05-28T08:00:00Z',
    updated_at: '2025-05-28T08:00:00Z'
  }
];

// Helper function to create paginated response
export function createMockUsersResponse(
  page: number = 1, 
  limit: number = 20, 
  filters: { search?: string; status?: string; department?: string } = {}
): UsersResponse {
  let filteredUsers = [...mockUsers];

  // Apply filters
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.employee_id?.toLowerCase().includes(search)
    );
  }

  if (filters.status && filters.status !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.status === filters.status);
  }

  if (filters.department && filters.department !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.department === filters.department);
  }

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total: filteredUsers.length,
    page,
    limit,
    has_more: endIndex < filteredUsers.length
  };
}
