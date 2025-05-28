import { apiClient } from '../api';
import type {
  TaxConfiguration,
  TaxLocation,
  UpdateTaxLocationRequest,
  TaxConfigurationQueryParams,
  TaxConfigurationResponse,
  TaxServiceError
} from '../types/tax.types';

export class TaxConfigurationService {
  private readonly basePath = '/tax/configuration';

  /**
   * Get tax configuration for a tenant/store
   */
  async getTaxConfiguration(params?: TaxConfigurationQueryParams): Promise<TaxConfiguration | null> {
    try {
      const response = await apiClient.get<TaxConfigurationResponse>(this.basePath, params);
      return response.data.tax_list.length > 0 ? response.data.tax_list[0] : null;
    } catch (error) {
      console.error('Failed to fetch tax configuration:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all tax configurations
   */
  async getAllTaxConfigurations(params?: TaxConfigurationQueryParams): Promise<TaxConfiguration[]> {
    try {
      const response = await apiClient.get<TaxConfigurationResponse>(this.basePath, params);
      return response.data.tax_list;
    } catch (error) {
      console.error('Failed to fetch tax configurations:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new tax configuration
   */
  async createTaxConfiguration(data: Partial<TaxConfiguration>): Promise<TaxConfiguration> {
    try {
      // Validate required fields
      this.validateTaxConfigurationData(data);
      
      const response = await apiClient.post<TaxConfiguration>(this.basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create tax configuration:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update tax configuration
   */
  async updateTaxConfiguration(tenantId: string, storeId: string, data: Partial<TaxConfiguration>): Promise<TaxConfiguration> {
    try {
      const response = await apiClient.put<TaxConfiguration>(`${this.basePath}/${tenantId}/${storeId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update tax configuration for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete tax configuration
   */
  async deleteTaxConfiguration(tenantId: string, storeId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${tenantId}/${storeId}`);
    } catch (error) {
      console.error(`Failed to delete tax configuration for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get tax location
   */
  async getTaxLocation(tenantId: string, storeId: string): Promise<TaxLocation> {
    try {
      const response = await apiClient.get<TaxLocation>(`${this.basePath}/${tenantId}/${storeId}/location`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch tax location for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Update tax location
   */
  async updateTaxLocation(tenantId: string, storeId: string, data: UpdateTaxLocationRequest): Promise<TaxLocation> {
    try {
      // Validate required fields
      this.validateTaxLocationData(data);
      
      const response = await apiClient.put<TaxLocation>(`${this.basePath}/${tenantId}/${storeId}/location`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update tax location for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get tax configuration statistics
   */
  async getTaxConfigurationStats(tenantId: string, storeId: string): Promise<{
    totalAuthorities: number;
    totalGroups: number;
    totalRules: number;
    isActive: boolean;
  }> {
    try {
      const config = await this.getTaxConfiguration({ tenant_id: tenantId, store_id: storeId });
      
      if (!config) {
        return {
          totalAuthorities: 0,
          totalGroups: 0,
          totalRules: 0,
          isActive: false
        };
      }

      const totalRules = config.tax_group.reduce((total, group) => total + group.group_rule.length, 0);

      return {
        totalAuthorities: config.authority.length,
        totalGroups: config.tax_group.length,
        totalRules,
        isActive: true
      };
    } catch (error) {
      console.error(`Failed to get tax configuration stats for ${tenantId}/${storeId}:`, error);
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
   * Validate tax location data
   */
  private validateTaxLocationData(data: UpdateTaxLocationRequest): void {
    const errors: TaxServiceError[] = [];

    if (!data.tax_loc_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax Location ID is required',
        field: 'tax_loc_id'
      });
    }

    if (!data.name) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax Location name is required',
        field: 'name'
      });
    }

    if (!data.description) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax Location description is required',
        field: 'description'
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
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('An unexpected error occurred while processing tax configuration request');
  }

  /**
   * Mock data for development/testing
   */
  async getMockTaxConfiguration(): Promise<TaxConfiguration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      tenant_id: "272e",
      store_id: "*",
      authority: [
        {
          authority_id: "IN-CGST",
          name: "Central",
          rounding_code: "HALF_UP",
          rounding_digit: 2
        },
        {
          authority_id: "IN-SGST",
          name: "State",
          rounding_code: "HALF_UP",
          rounding_digit: 2
        }
      ],
      tax_location: {
        tax_loc_id: "TL-IN",
        name: "India Tax Location",
        description: "IN Tax Location"
      },
      tax_group: [
        {
          tax_group_id: "0",
          name: "No Tax",
          description: "No Tax",
          group_rule: [
            {
              tax_rule_seq: 1,
              tax_authority_id: "IN-CGST",
              name: "Central GST",
              description: "Central GST",
              tax_type_code: "VAT",
              fiscal_tax_id: "A",
              effective_datetime: null,
              expr_datetime: null,
              percentage: 0,
              amount: null
            },
            {
              tax_rule_seq: 2,
              tax_authority_id: "IN-SGST",
              name: "State GST",
              description: "State GST",
              tax_type_code: "VAT",
              fiscal_tax_id: "A",
              effective_datetime: null,
              expr_datetime: null,
              percentage: 0,
              amount: null
            }
          ]
        },
        {
          tax_group_id: "GST18",
          name: "GST 18%",
          description: "GST 18%",
          group_rule: [
            {
              tax_rule_seq: 1,
              tax_authority_id: "IN-CGST",
              name: "Central GST",
              description: "Central GST",
              tax_type_code: "VAT",
              fiscal_tax_id: "D",
              effective_datetime: null,
              expr_datetime: null,
              percentage: 0.09,
              amount: null
            },
            {
              tax_rule_seq: 2,
              tax_authority_id: "IN-SGST",
              name: "State GST",
              description: "State GST",
              tax_type_code: "VAT",
              fiscal_tax_id: "D",
              effective_datetime: null,
              expr_datetime: null,
              percentage: 0.09,
              amount: null
            }
          ]
        }
      ],
      properties: null,
      created_at: "2025-05-18T16:05:32.822524413Z",
      create_user_id: "81238dda-60f1-70c3-4284-0fb8c5ac5631",
      updated_at: "2025-05-18T16:05:32.822526058Z",
      update_user_id: null
    };
  }
}

// Create and export a singleton instance
export const taxConfigurationService = new TaxConfigurationService();
