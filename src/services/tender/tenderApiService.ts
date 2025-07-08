// Tender API service for real backend integration
import { apiClient, ApiError } from '../api';
import { useErrorHandler } from '../errorHandler';
import type { 
  Tender, 
  CreateTenderRequest, 
  UpdateTenderRequest
} from '../types/payment.types';

// Query parameters for filtering tenders
export interface TenderQueryParams {
  tenant_id?: string;
  store_id?: string;
  type_code?: string;
  is_active?: boolean;
  currency_id?: string;
  sort_by?: 'description' | 'display_order' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Response for getting tenders
export interface TendersApiResponse {
  tenders: Tender[];
  total_count: number;
}

// Response for batch operations
export interface BatchOperationResponse {
  success: boolean;
  created_count: number;
  failed_count: number;
  errors: string[];
}

class TenderApiService {
  private readonly basePath = `/v0/tenant/`;

  /**
   * Get all tenders for a tenant/store
   */
  async getTenders(params?: TenderQueryParams): Promise<Tender[]> {
    try {
      console.log('💳 Fetching tenders with params:', params);
      
      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/tender`;

      // Real API call - expecting response format: { tenders: Tender[] }
      const response = await apiClient.get<{ tenders: Tender[] }>(path, {});
      
      console.log('✅ Successfully fetched tenders from API:', response.data);
      return response.data.tenders;
      
    } catch (error) {
      const appError = this.handleError(error, 'Failed to fetch tenders');
      console.error('❌ Error fetching tenders from API:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Get a specific tender by ID
   */
  async getTenderById(tenderId: string, params?: TenderQueryParams): Promise<Tender> {
    try {
      console.log('💳 Fetching tender by ID:', tenderId);
      
      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/tender/${tenderId}`;

      // Real API call
      const response = await apiClient.get<Tender>(path, {});
      return response.data;
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to fetch tender: ${tenderId}`);
      console.error('❌ Error fetching tender:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Create a new tender
   */
  async createTender(data: CreateTenderRequest, params?: { tenant_id?: string; store_id?: string }): Promise<Tender> {
    try {
      console.log('💳 Creating new tender:', data);
      
      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/tender`;

      // Real API call - single tender creation
      const response = await apiClient.post<Tender>(path, data, {
        headers: undefined,
      });
      
      console.log('✅ Successfully created tender:', response.data);
      return response.data;
      
    } catch (error) {
      const appError = this.handleError(error, 'Failed to create tender');
      console.error('❌ Error creating tender:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Update an existing tender
   */
  async updateTender(tenderId: string, data: UpdateTenderRequest, params?: { tenant_id?: string; store_id?: string }): Promise<Tender> {
    try {
      console.log('💳 Updating tender:', tenderId, data);
      
      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/tender/${tenderId}`;

      // Real API call
      const response = await apiClient.put<Tender>(path, data, {
        headers: undefined
      });
      
      console.log('✅ Successfully updated tender:', response.data);
      return response.data;
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to update tender: ${tenderId}`);
      console.error('❌ Error updating tender:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Delete a tender
   */
  async deleteTender(tenderId: string, params?: { tenant_id?: string; store_id?: string }): Promise<void> {
    try {
      console.log('💳 Deleting tender:', tenderId);
      
      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/tender/${tenderId}`;

      // Real API call
      await apiClient.delete(path);
      
      console.log('✅ Successfully deleted tender:', tenderId);
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to delete tender: ${tenderId}`);
      console.error('❌ Error deleting tender:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Handle API errors consistently and display to user
   */
  private handleError(error: any, userMessage?: string): ApiError {
    const appError = this.createApiError(error, userMessage);
    
    // Log the error details
    console.error('🚨 Tender API Error:', {
      message: appError.message,
      code: appError.code,
      slug: appError.slug,
      details: appError.details
    });
    
    return appError;
  }

  /**
   * Create structured ApiError from various error types
   */
  private createApiError(error: any, userMessage?: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    // Handle HTTP response errors that might have the new error format
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Check if it has the new structured format
      if (errorData.code && errorData.slug && errorData.message) {
        return new ApiError(
          userMessage || errorData.message,
          errorData.code,
          errorData.slug,
          errorData.details
        );
      }
    }
    
    // Fallback error handling
    return new ApiError(
      userMessage || (error instanceof Error ? error.message : 'Tender operation failed'),
      2100,
      'TENDER_ERROR',
      { originalError: error?.message || 'Unknown error' }
    );
  }
}

// Export singleton instance
export const tenderApiService = new TenderApiService();

// Export for convenience
export default tenderApiService;
