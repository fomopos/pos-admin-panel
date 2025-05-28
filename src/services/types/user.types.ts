// User management type definitions for POS system
import type { Permission } from './store.types';

export interface StoreUser {
  user_id: string;
  store_id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  role_name: string;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  profile_picture?: string;
  employee_id?: string;
  department?: string;
  hire_date?: string;
  last_login?: string;
  login_count: number;
  two_factor_enabled: boolean;
  session_active: boolean;
  access_schedule?: AccessSchedule;
  pin_code?: string; // For quick POS login
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface AccessSchedule {
  enabled: boolean;
  schedule: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    start_time: string; // HH:MM format
    end_time: string;   // HH:MM format
    enabled: boolean;
  }[];
  timezone: string;
}

export interface CreateUserRequest {
  store_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  role_name: string;
  permissions: Permission[];
  employee_id?: string;
  department?: string;
  hire_date?: string;
  pin_code?: string;
  access_schedule?: AccessSchedule;
  send_welcome_email?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  role_name?: string;
  permissions?: Permission[];
  status?: 'active' | 'inactive' | 'suspended';
  employee_id?: string;
  department?: string;
  hire_date?: string;
  pin_code?: string;
  access_schedule?: AccessSchedule;
  two_factor_enabled?: boolean;
}

export interface UserActivity {
  activity_id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'transaction' | 'void' | 'refund' | 'settings_change' | 'clock_in' | 'clock_out';
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  device_info?: string;
  location?: string;
  timestamp: string;
  session_id?: string;
}

export interface UserSession {
  session_id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
  location?: string;
  started_at: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
}

export interface UserPermissionGroup {
  group_id: string;
  group_name: string;
  description: string;
  permissions: Permission[];
  color?: string;
  icon?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  users_logged_in_today: number;
  users_clocked_in: number;
  new_users_this_month: number;
  avg_session_duration: string;
  role_distribution: {
    role_name: string;
    count: number;
    percentage: number;
  }[];
  recent_logins: {
    user_id: string;
    user_name: string;
    last_login: string;
    device_info?: string;
  }[];
}

export interface UserTimeTracking {
  tracking_id: string;
  user_id: string;
  clock_in_time: string;
  clock_out_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  total_hours?: number;
  break_duration?: number;
  status: 'clocked_in' | 'on_break' | 'clocked_out';
  notes?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Query parameters
export interface UserQueryParams {
  tenant_id?: string;
  store_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'email' | 'role' | 'last_login' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Response types
export interface UsersResponse {
  users: StoreUser[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface UserActivityResponse {
  activities: UserActivity[];
  total: number;
  page: number;
  limit: number;
}

export interface UserSessionsResponse {
  sessions: UserSession[];
  active_sessions: number;
}

// Error types
export interface UserServiceError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Department types for organization
export const DEPARTMENTS = [
  'Management',
  'Sales',
  'Customer Service',
  'Inventory',
  'Security',
  'Maintenance',
  'Finance',
  'Marketing'
] as const;

export type Department = typeof DEPARTMENTS[number];

// User status types
export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'suspended', label: 'Suspended', color: 'red' }
] as const;

export type UserStatus = 'active' | 'inactive' | 'suspended';

// Activity types for tracking
export const ACTIVITY_TYPES = [
  { value: 'login', label: 'Login', icon: 'UserIcon', color: 'blue' },
  { value: 'logout', label: 'Logout', icon: 'UserIcon', color: 'gray' },
  { value: 'transaction', label: 'Transaction', icon: 'CreditCardIcon', color: 'green' },
  { value: 'void', label: 'Void', icon: 'XMarkIcon', color: 'orange' },
  { value: 'refund', label: 'Refund', icon: 'ArrowUturnLeftIcon', color: 'yellow' },
  { value: 'settings_change', label: 'Settings Change', icon: 'CogIcon', color: 'purple' },
  { value: 'clock_in', label: 'Clock In', icon: 'ClockIcon', color: 'blue' },
  { value: 'clock_out', label: 'Clock Out', icon: 'ClockIcon', color: 'red' }
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number]['value'];
