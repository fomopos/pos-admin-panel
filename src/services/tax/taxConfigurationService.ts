import { apiClient } from '../api';
import type {
  TaxConfiguration,
  TaxServiceError,
  CreateTaxConfigurationRequest,
  TaxApiResponse,
  TaxApiResponseItem
} from '../types/tax.types';

export class TaxConfigurationService {
  private readonly basePath = '/v0/tenant';

  /**
   * Get tax configuration for a tenant and store
   * @param tenantId - The tenant ID
   * @param storeId - The store ID (optional, defaults to "*")
   * @param country - The country code from store address (optional)
   */
  async getTaxConfiguration(
    tenantId: string, 
    storeId: string = "*", 
    country?: string
  ): Promise<TaxConfiguration | null> {
    try {
      console.log(`Fetching tax configuration for tenant: ${tenantId}, store: ${storeId}${country ? `, country: ${country}` : ''}`);
      
      // Construct the URL with store ID
      let url = `${this.basePath}/${tenantId}/store/${storeId}/tax`;
      
      // Add country parameter if provided
      if (country) {
        url += `?country=${country.toLowerCase()}`;
      }
      
      const response = await apiClient.get<TaxApiResponse>(url);
      
      console.log('Tax configuration API response:', response.data);
      
      // Extract the first tax configuration from tax_list array
      if (response.data && response.data.tax_list && response.data.tax_list.length > 0) {
        const taxData = response.data.tax_list[0];
        
        // Transform API response to our TaxConfiguration format
        const taxConfiguration: TaxConfiguration = {
          tenant_id: taxData.tenant_id,
          store_id: taxData.store_id,
          authority: taxData.authority,
          tax_location: taxData.tax_location,
          tax_group: taxData.tax_group,
          properties: taxData.properties,
          created_at: taxData.created_at,
          create_user_id: taxData.create_user_id,
          updated_at: taxData.updated_at,
          update_user_id: taxData.update_user_id
        };
        
        console.log('Transformed tax configuration:', taxConfiguration);
        return taxConfiguration;
      }
      
      console.warn('No tax configuration found in response');
      return null; // No tax configuration found
    } catch (error) {
      console.error('Failed to fetch tax configuration:', error);
      
      // If 404 or no data found, return null instead of throwing
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        console.log('Tax configuration not found (404), returning null');
        return null;
      }      
      // For other errors, throw them up
      throw this.handleError(error);
    }
  }

  /**
   * Create a new tax configuration for a tenant and store
   * @param tenantId - The tenant ID
   * @param storeId - The store ID
   * @param data - The tax configuration data
   */
  async createTaxConfiguration(
    tenantId: string, 
    storeId: string, 
    data: CreateTaxConfigurationRequest
  ): Promise<TaxConfiguration> {
    try {
      // Prepare the request data with required fields
      const requestData = {
        tenant_id: tenantId,
        store_id: storeId,
        authority: data.authority,
        tax_location: data.tax_location,
        tax_group: data.tax_group,
        properties: null
      };

      console.log(`Creating tax configuration for tenant: ${tenantId}, store: ${storeId}`, requestData);

      // Validate required fields
      this.validateTaxConfigurationData(requestData);
      
      const response = await apiClient.post<TaxApiResponseItem>(`${this.basePath}/${tenantId}/store/${storeId}/tax`, requestData);
      
      console.log('Create tax configuration API response:', response.data);
      
      // Transform API response to our TaxConfiguration format
      const taxConfiguration: TaxConfiguration = {
        tenant_id: response.data.tenant_id,
        store_id: response.data.store_id,
        authority: response.data.authority,
        tax_location: response.data.tax_location,
        tax_group: response.data.tax_group,
        properties: response.data.properties,
        created_at: response.data.created_at,
        create_user_id: response.data.create_user_id,
        updated_at: response.data.updated_at,
        update_user_id: response.data.update_user_id
      };
      
      return taxConfiguration;
    } catch (error) {
      console.error('Failed to create tax configuration:', error);
      
      // For development, you might want to return mock data or handle gracefully
      if (import.meta.env.NODE_ENV === 'development') {
        console.warn('Create operation failed, this might be expected in development');
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Update tax configuration for a tenant and store
   * @param tenantId - The tenant ID
   * @param storeId - The store ID
   * @param data - The tax configuration data
   */
  async updateTaxConfiguration(
    tenantId: string, 
    storeId: string, 
    data: CreateTaxConfigurationRequest
  ): Promise<TaxConfiguration> {
    try {
      // Prepare the request data with required fields
      const requestData = {
        tenant_id: tenantId,
        store_id: storeId,
        authority: data.authority,
        tax_location: data.tax_location,
        tax_group: data.tax_group,
        properties: null
      };

      console.log(`Updating tax configuration for tenant: ${tenantId}, store: ${storeId}`, requestData);

      // Validate required fields
      this.validateTaxConfigurationData(requestData);
      
      // Use POST for both create and update as per the API specification
      const response = await apiClient.post<TaxApiResponseItem>(`${this.basePath}/${tenantId}/store/${storeId}/tax`, requestData);
      
      console.log('Update tax configuration API response:', response.data);
      
      // Transform API response to our TaxConfiguration format
      const taxConfiguration: TaxConfiguration = {
        tenant_id: response.data.tenant_id,
        store_id: response.data.store_id,
        authority: response.data.authority,
        tax_location: response.data.tax_location,
        tax_group: response.data.tax_group,
        properties: response.data.properties,
        created_at: response.data.created_at,
        create_user_id: response.data.create_user_id,
        updated_at: response.data.updated_at,
        update_user_id: response.data.update_user_id
      };
      
      return taxConfiguration;
    } catch (error) {
      console.error(`Failed to update tax configuration for tenant ${tenantId}:`, error);
      
      // For development, you might want to handle gracefully
      if (import.meta.env.NODE_ENV === 'development') {
        console.warn('Update operation failed, this might be expected in development');
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Validate tax configuration data
   */
  private validateTaxConfigurationData(data: Partial<TaxConfiguration>): void {
    const errors: TaxServiceError[] = [];

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
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('An unexpected error occurred while processing tax configuration request');
  }
}

// Create and export a singleton instance
export const taxConfigurationService = new TaxConfigurationService();
