import { apiClient } from '../api';
import type {
  TaxAuthority,
  CreateTaxAuthorityRequest,
  UpdateTaxAuthorityRequest,
  TaxAuthorityQueryParams,
  TaxAuthorityListResponse,
  TaxServiceError
} from '../types/tax.types';

export class TaxAuthorityService {
  private readonly basePath = '/tax/authorities';

  /**
   * Get all tax authorities
   */
  async getTaxAuthorities(params?: TaxAuthorityQueryParams): Promise<TaxAuthority[]> {
    try {
      const response = await apiClient.get<TaxAuthorityListResponse>(this.basePath, params);
      return response.data.authorities;
    } catch (error) {
      console.error('Failed to fetch tax authorities:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific tax authority by ID
   */
  async getTaxAuthorityById(authorityId: string, params?: TaxAuthorityQueryParams): Promise<TaxAuthority> {
    try {
      const response = await apiClient.get<TaxAuthority>(`${this.basePath}/${authorityId}`, params);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch tax authority ${authorityId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new tax authority
   */
  async createTaxAuthority(data: CreateTaxAuthorityRequest): Promise<TaxAuthority> {
    try {
      // Validate required fields
      this.validateTaxAuthorityData(data);
      
      const response = await apiClient.post<TaxAuthority>(this.basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create tax authority:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing tax authority
   */
  async updateTaxAuthority(authorityId: string, data: UpdateTaxAuthorityRequest): Promise<TaxAuthority> {
    try {
      // Validate required fields
      this.validateTaxAuthorityData(data, false);
      
      const response = await apiClient.put<TaxAuthority>(`${this.basePath}/${authorityId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update tax authority ${authorityId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a tax authority
   */
  async deleteTaxAuthority(authorityId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${authorityId}`);
    } catch (error) {
      console.error(`Failed to delete tax authority ${authorityId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Validate tax authority data
   */
  private validateTaxAuthorityData(data: CreateTaxAuthorityRequest | UpdateTaxAuthorityRequest, isCreate: boolean = true): void {
    const errors: TaxServiceError[] = [];

    if (isCreate && !data.authority_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Authority ID is required',
        field: 'authority_id'
      });
    }

    if (isCreate && !data.name) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Authority name is required',
        field: 'name'
      });
    }

    if (data.rounding_code && !['HALF_UP', 'HALF_DOWN', 'UP', 'DOWN'].includes(data.rounding_code)) {
      errors.push({
        code: 'INVALID_VALUE',
        message: 'Invalid rounding code. Must be one of: HALF_UP, HALF_DOWN, UP, DOWN',
        field: 'rounding_code'
      });
    }

    if (data.rounding_digit !== undefined && (data.rounding_digit < 0 || data.rounding_digit > 10)) {
      errors.push({
        code: 'INVALID_VALUE',
        message: 'Rounding digit must be between 0 and 10',
        field: 'rounding_digit'
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
    
    return new Error('An unexpected error occurred while processing tax authority request');
  }

  /**
   * Mock data for development/testing
   */
  async getMockTaxAuthorities(): Promise<TaxAuthority[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
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
    ];
  }
}

// Create and export a singleton instance
export const taxAuthorityService = new TaxAuthorityService();
