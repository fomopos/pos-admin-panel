import { apiClient } from '../api';
import type {
  StoreSettings,
  CreateStoreSettingsRequest,
  UpdateStoreSettingsRequest,
  StoreSettingsQueryParams,
  StoreServiceError,
  SupportedCurrency,
  SupportedTimezone,
  BusinessHours
} from '../types/store.types';

export class StoreSettingsService {
  private readonly basePath = '/v0/store';

  /**
   * Get store settings for a store
   */
  async getStoreSettings(params: StoreSettingsQueryParams): Promise<StoreSettings | null> {
    try {
      const { store_id } = params;
      const endpoint = `${this.basePath}/${store_id}/settings`;
      const response = await apiClient.get<StoreSettings>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch store settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all store settings for current tenant
   */
  async getAllStoreSettings(): Promise<StoreSettings[]> {
    try {
      // Note: This might need to be updated based on actual API structure
      // For now, getting all stores and their settings might require multiple calls
      const endpoint = `${this.basePath}/settings`;
      const response = await apiClient.get<{ settings: StoreSettings[] }>(endpoint);
      return response.data.settings || [];
    } catch (error) {
      console.error('Failed to fetch store settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new store settings
   */
  async createStoreSettings(data: CreateStoreSettingsRequest): Promise<StoreSettings> {
    try {
      // Validate required fields
      this.validateStoreSettingsData(data);
      
      const { store_id } = data;
      const endpoint = `${this.basePath}/${store_id}/settings`;
      const response = await apiClient.post<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create store settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update store settings
   */
  async updateStoreSettings(storeId: string, data: UpdateStoreSettingsRequest): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings`;
      const response = await apiClient.put<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update store settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete store settings
   */
  async deleteStoreSettings(storeId: string): Promise<void> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings`;
      await apiClient.delete<void>(endpoint);
    } catch (error) {
      console.error(`Failed to delete store settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Update specific settings section
   */
  async updateStoreInformation(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/information`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update store information for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateRegionalSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/regional`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update regional settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateReceiptSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/receipt`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update receipt settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateHardwareConfig(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/hardware`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update hardware config for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateOperationalSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/operational`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update operational settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateUserManagement(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/users`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update user management for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateIntegrationSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/integrations`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update integration settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateApiInformation(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/api`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update API information for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateSecuritySettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/security`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update security settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Array<{ code: SupportedCurrency; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
    ];
  }

  /**
   * Get supported timezones
   */
  getSupportedTimezones(): Array<{ code: SupportedTimezone; name: string; offset: string }> {
    return [
      { code: 'America/New_York', name: 'Eastern Time (US)', offset: 'UTC-5/-4' },
      { code: 'America/Chicago', name: 'Central Time (US)', offset: 'UTC-6/-5' },
      { code: 'America/Denver', name: 'Mountain Time (US)', offset: 'UTC-7/-6' },
      { code: 'America/Los_Angeles', name: 'Pacific Time (US)', offset: 'UTC-8/-7' },
      { code: 'Europe/London', name: 'Greenwich Mean Time', offset: 'UTC+0/+1' },
      { code: 'Europe/Paris', name: 'Central European Time', offset: 'UTC+1/+2' },
      { code: 'Europe/Berlin', name: 'Central European Time', offset: 'UTC+1/+2' },
      { code: 'Asia/Dubai', name: 'Gulf Standard Time', offset: 'UTC+4' },
      { code: 'Asia/Kolkata', name: 'India Standard Time', offset: 'UTC+5:30' },
      { code: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+9' },
      { code: 'Asia/Shanghai', name: 'China Standard Time', offset: 'UTC+8' },
      { code: 'Australia/Sydney', name: 'Australian Eastern Time', offset: 'UTC+10/+11' }
    ];
  }

  /**
   * Get default business hours
   */
  getDefaultBusinessHours(): BusinessHours[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      is_open: !['Saturday', 'Sunday'].includes(day),
      open_time: '09:00',
      close_time: '18:00'
    }));
  }

  /**
   * Validate store settings data
   */
  private validateStoreSettingsData(data: CreateStoreSettingsRequest): void {
    const errors: StoreServiceError[] = [];

    if (!data.tenant_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tenant ID is required',
        field: 'tenant_id'
      });
    }

    if (!data.store_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Store ID is required',
        field: 'store_id'
      });
    }

    if (!data.store_information?.store_name) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Store name is required',
        field: 'store_information.store_name'
      });
    }

    if (!data.regional_settings?.currency) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Currency is required',
        field: 'regional_settings.currency'
      });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    // Check if it's already our structured ApiError
    if (error.name === 'ApiError') {
      return error;
    }
    
    // Handle HTTP response errors that might have the new error format
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Check if it has the new structured format
      if (errorData.code && errorData.slug && errorData.message) {
        const { ApiError } = require('../api');
        return new ApiError(
          errorData.message,
          errorData.code,
          errorData.slug,
          errorData.details
        );
      }
      
      // Fallback to legacy format
      if (errorData.message) {
        return new Error(errorData.message);
      }
    }
    
    // Default error handling
    return new Error(error.message || 'An unexpected error occurred');
  }
}

// Create and export a singleton instance
export const storeSettingsService = new StoreSettingsService();
