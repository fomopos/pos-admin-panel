import { apiClient } from '../api';
import type {
  Tender,
  CreateTenderRequest,
  UpdateTenderRequest,
  TenderQueryParams,
  TenderListResponse,
  PaymentServiceError
} from '../types/payment.types';

export class TenderService {
  private readonly basePath = '/payment/tenders';

  /**
   * Get all tenders
   */
  async getTenders(params?: TenderQueryParams): Promise<Tender[]> {
    try {
      const response = await apiClient.get<TenderListResponse>(this.basePath, params);
      return response.data.tenders;
    } catch (error) {
      console.error('Failed to fetch tenders:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific tender by ID
   */
  async getTenderById(tenderId: string, params?: TenderQueryParams): Promise<Tender> {
    try {
      const response = await apiClient.get<Tender>(`${this.basePath}/${tenderId}`, params);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch tender ${tenderId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new tender
   */
  async createTender(data: CreateTenderRequest): Promise<Tender> {
    try {
      // Validate required fields
      this.validateTenderData(data);
      
      const response = await apiClient.post<Tender>(this.basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create tender:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing tender
   */
  async updateTender(tenderId: string, data: UpdateTenderRequest): Promise<Tender> {
    try {
      // Validate required fields
      this.validateTenderData(data, false);
      
      const response = await apiClient.put<Tender>(`${this.basePath}/${tenderId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update tender ${tenderId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a tender
   */
  async deleteTender(tenderId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${tenderId}`);
    } catch (error) {
      console.error(`Failed to delete tender ${tenderId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Activate/deactivate a tender
   */
  async toggleTenderStatus(tenderId: string, isActive: boolean): Promise<Tender> {
    try {
      const response = await apiClient.patch<Tender>(`${this.basePath}/${tenderId}/status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle tender ${tenderId} status:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get tenders by type
   */
  async getTendersByType(typeCode: string, params?: TenderQueryParams): Promise<Tender[]> {
    try {
      const allParams = { ...params, type_code: typeCode };
      return this.getTenders(allParams);
    } catch (error) {
      console.error(`Failed to fetch tenders by type ${typeCode}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get tenders by currency
   */
  async getTendersByCurrency(currencyId: string, params?: TenderQueryParams): Promise<Tender[]> {
    try {
      const allParams = { ...params, currency_id: currencyId };
      return this.getTenders(allParams);
    } catch (error) {
      console.error(`Failed to fetch tenders by currency ${currencyId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Validate tender data
   */
  private validateTenderData(data: CreateTenderRequest | UpdateTenderRequest, isCreate: boolean = true): void {
    const errors: PaymentServiceError[] = [];

    if (isCreate && !data.tender_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tender ID is required',
        field: 'tender_id'
      });
    }

    if (isCreate && !data.type_code) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Type code is required',
        field: 'type_code'
      });
    }

    if (isCreate && !data.currency_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Currency ID is required',
        field: 'currency_id'
      });
    }

    if (isCreate && !data.description) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Description is required',
        field: 'description'
      });
    }

    if (isCreate && (data.over_tender_allowed === undefined || data.over_tender_allowed === null)) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Over tender allowed flag is required',
        field: 'over_tender_allowed'
      });
    }

    if (isCreate && (!data.availability || !Array.isArray(data.availability) || data.availability.length === 0)) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Availability is required and must be a non-empty array',
        field: 'availability'
      });
    }

    // Validate availability values
    if (data.availability && Array.isArray(data.availability)) {
      const validAvailability = ['sale', 'return'];
      const invalidValues = data.availability.filter(value => !validAvailability.includes(value));
      if (invalidValues.length > 0) {
        errors.push({
          code: 'INVALID_VALUE',
          message: `Invalid availability values: ${invalidValues.join(', ')}. Valid values are: ${validAvailability.join(', ')}`,
          field: 'availability'
        });
      }
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
    
    return new Error('An unexpected error occurred while processing tender request');
  }
}

// Create and export a singleton instance
export const tenderService = new TenderService();
