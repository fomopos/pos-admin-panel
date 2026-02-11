// User management service for POS system
import { apiClient } from '../api';
import type {
  StoreUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserActivity,
  UserTimeTracking,
  UserStats,
  UserQueryParams,
  UsersResponse,
  UserActivityResponse,
  UserSessionsResponse,
  UserServiceError
} from '../types/user.types';

export class UserService {
  private readonly basePath = '/users';

  /**
   * Get all users for a store with filtering and pagination
   */
  async getUsers(params: UserQueryParams = {}): Promise<UsersResponse> {
    try {
      const response = await apiClient.get<UsersResponse>(this.basePath, params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw this.handleError(error, 'Failed to fetch users');
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUserById(userId: string): Promise<StoreUser> {
    try {
      const response = await apiClient.get<StoreUser>(`${this.basePath}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw this.handleError(error, `User ${userId} not found`);
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<StoreUser> {
    try {
      this.validateUserData(data);
      const response = await apiClient.post<StoreUser>(this.basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw this.handleError(error, 'Failed to create user');
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<StoreUser> {
    try {
      this.validateUserData(data);
      const response = await apiClient.put<StoreUser>(`${this.basePath}/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw this.handleError(error, `Failed to update user ${userId}`);
    }
  }

  /**
   * Delete a user (soft delete)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw this.handleError(error, `Failed to delete user ${userId}`);
    }
  }

  /**
   * Update user status (active, inactive, suspended)
   */
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<StoreUser> {
    try {
      const response = await apiClient.post<StoreUser>(`${this.basePath}/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw this.handleError(error, `Failed to update user status for ${userId}`);
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(userId: string, newPassword?: string): Promise<{ temporaryPassword?: string }> {
    try {
      const payload = newPassword ? { password: newPassword } : {};
      const response = await apiClient.post<{ temporaryPassword?: string }>(`${this.basePath}/${userId}/reset-password`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw this.handleError(error, `Failed to reset password for user ${userId}`);
    }
  }

  /**
   * Get user activity with filtering
   */
  async getUserActivity(
    userId: string,
    params: { page?: number; limit?: number; activity_type?: string; start_date?: string; end_date?: string } = {}
  ): Promise<UserActivityResponse> {
    try {
      const response = await apiClient.get<UserActivityResponse>(`${this.basePath}/${userId}/activity`, params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      throw this.handleError(error, `Failed to fetch activity for user ${userId}`);
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<UserSessionsResponse> {
    try {
      const response = await apiClient.get<UserSessionsResponse>(`${this.basePath}/${userId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
      throw this.handleError(error, `Failed to fetch sessions for user ${userId}`);
    }
  }

  /**
   * Terminate a user session
   */
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/sessions/${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to terminate session:', error);
      throw this.handleError(error, `Failed to terminate session ${sessionId}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId?: string): Promise<UserStats> {
    try {
      const endpoint = userId ? `${this.basePath}/${userId}/stats` : `${this.basePath}/stats`;
      const response = await apiClient.get<UserStats>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw this.handleError(error, 'Failed to fetch user statistics');
    }
  }

  /**
   * Clock in/out functionality for time tracking
   */
  async clockIn(userId: string, location?: string): Promise<UserTimeTracking> {
    try {
      const response = await apiClient.post<UserTimeTracking>(`${this.basePath}/${userId}/clock-in`, { location });
      return response.data;
    } catch (error) {
      console.error('Failed to clock in user:', error);
      throw this.handleError(error, `Failed to clock in user ${userId}`);
    }
  }

  async clockOut(userId: string, location?: string): Promise<UserTimeTracking> {
    try {
      const response = await apiClient.post<UserTimeTracking>(`${this.basePath}/${userId}/clock-out`, { location });
      return response.data;
    } catch (error) {
      console.error('Failed to clock out user:', error);
      throw this.handleError(error, `Failed to clock out user ${userId}`);
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<UpdateUserRequest>
  ): Promise<{ success: string[]; failed: string[] }> {
    try {
      const response = await apiClient.post<{ success: string[]; failed: string[] }>(
        `${this.basePath}/bulk-update`,
        { user_ids: userIds, updates }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update users:', error);
      throw this.handleError(error, 'Failed to bulk update users');
    }
  }

  /**
   * Get time tracking records for a user
   */
  async getTimeTracking(
    userId: string,
    params: { start_date?: string; end_date?: string; page?: number; limit?: number } = {}
  ): Promise<{ records: UserTimeTracking[]; total: number }> {
    try {
      const response = await apiClient.get<{ records: UserTimeTracking[]; total: number }>(
        `${this.basePath}/${userId}/time-tracking`,
        params
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch time tracking:', error);
      throw this.handleError(error, `Failed to fetch time tracking for user ${userId}`);
    }
  }

  /**
   * PIN-based quick authentication for POS terminals
   */
  async authenticateWithPIN(employeeId: string, pin: string): Promise<StoreUser> {
    try {
      const response = await apiClient.post<StoreUser>('/auth/pin', { employee_id: employeeId, pin });
      return response.data;
    } catch (error) {
      console.error('PIN authentication failed:', error);
      throw this.handleError(error, 'Invalid PIN or employee ID');
    }
  }

  /**
   * Log user activity
   */
  async logActivity(userId: string, activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<UserActivity> {
    try {
      const response = await apiClient.post<UserActivity>(`${this.basePath}/${userId}/activity`, activity);
      return response.data;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw this.handleError(error, 'Failed to log user activity');
    }
  }

  /**
   * Update user permissions
   */
  async updatePermissions(userId: string, permissions: string): Promise<StoreUser> {
    try {
      const response = await apiClient.put<StoreUser>(`${this.basePath}/${userId}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error('Failed to update permissions:', error);
      throw this.handleError(error, `Failed to update permissions for user ${userId}`);
    }
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    try {
      const response = await apiClient.post<{ success: string[]; failed: string[] }>(
        `${this.basePath}/bulk-delete`,
        { user_ids: userIds }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
      throw this.handleError(error, 'Failed to bulk delete users');
    }
  }

  /**
   * Validate user data before sending to API
   */
  private validateUserData(data: CreateUserRequest | UpdateUserRequest): void {
    if ('email' in data && data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    if ('phone' in data && data.phone && !this.isValidPhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }

    if ('pin_code' in data && data.pin_code && (data.pin_code.length < 4 || data.pin_code.length > 8)) {
      throw new Error('PIN code must be between 4 and 8 characters');
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Handle API errors and convert to UserServiceError
   */
  private handleError(error: any, message: string): UserServiceError {
    // Handle HTTP response errors that might have the new error format
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Check if it has the new structured format
      if (errorData.code && errorData.slug && errorData.message) {
        const { ApiError } = require('../api');
        throw new ApiError(
          errorData.message,
          errorData.code,
          errorData.slug,
          errorData.details
        );
      }
    }
    
    // Fallback to legacy UserServiceError format
    return {
      message,
      code: error.response?.status || 500,
      details: error.response?.data || error.message
    };
  }
}

// Export a singleton instance
export const userService = new UserService();
