// Reason Code API service for managing reason codes
import { apiClient, ApiError } from '../api';
import type { 
  ReasonCode,
  CreateReasonCodeRequest,
  UpdateReasonCodeRequest,
  ReasonCodesResponse, 
  ReasonCodeQueryParams 
} from '../../types/reasonCode';

class ReasonCodeApiService {
  /**
   * Get all reason codes for a store
   */
  async getReasonCodes(params: ReasonCodeQueryParams): Promise<ReasonCodesResponse> {
    try {
      console.log('🎯 Fetching reason codes with params:', params);

      const path = `/v0/store/${params.store_id}/config/reason-code`;
      const queryParams = new URLSearchParams();
      if (params.active !== undefined) queryParams.append('active', params.active.toString());
      if (params.category) queryParams.append('category', params.category);
      
      const response = await apiClient.get<ReasonCodesResponse>(
        `${path}${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
        {}
      );
      
      console.log('✅ Successfully fetched reason codes from API:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error fetching reason codes from API:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific reason code by code
   */
  async getReasonCodeByCode(_tenantId: string, storeId: string, code: string): Promise<ReasonCode> {
    try {
      console.log('🎯 Fetching reason code by code:', code);

      const path = `/v0/store/${storeId}/config/reason-code/${code}`;
      const response = await apiClient.get<ReasonCode>(path, {});
      
      console.log('✅ Successfully fetched reason code from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching reason code from API:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new reason code
   */
  async createReasonCode(
    _tenantId: string, 
    storeId: string, 
    reasonCodeData: CreateReasonCodeRequest
  ): Promise<ReasonCode> {
    try {
      console.log('🎯 Creating reason code:', reasonCodeData);

      const path = `/v0/store/${storeId}/config/reason-code`;
      const response = await apiClient.post<ReasonCode>(path, reasonCodeData);
      
      console.log('✅ Successfully created reason code:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error creating reason code:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing reason code
   */
  async updateReasonCode(
    _tenantId: string, 
    storeId: string, 
    code: string, 
    reasonCodeData: UpdateReasonCodeRequest
  ): Promise<ReasonCode> {
    try {
      console.log('🎯 Updating reason code:', code, reasonCodeData);

      const path = `/v0/store/${storeId}/config/reason-code/${code}`;
      const response = await apiClient.put<ReasonCode>(path, reasonCodeData);
      
      console.log('✅ Successfully updated reason code:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error updating reason code:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a reason code
   */
  async deleteReasonCode(_tenantId: string, storeId: string, code: string): Promise<void> {
    try {
      console.log('🎯 Deleting reason code:', code);

      const path = `/v0/store/${storeId}/config/reason-code/${code}`;
      await apiClient.delete(path);
      
      console.log('✅ Successfully deleted reason code');
      
    } catch (error) {
      console.error('❌ Error deleting reason code:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    console.error('Unexpected error in reason code API:', error);
    return new ApiError(
      'An unexpected error occurred while processing your request',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export const reasonCodeApiService = new ReasonCodeApiService();
