// Discount API service for managing discounts
import { apiClient, ApiError } from '../api';
import type { 
  Discount, 
  CreateDiscountRequest, 
  DiscountsResponse, 
  DiscountQueryParams 
} from '../../types/discount';

class DiscountApiService {
  // private readonly basePath = '/v0';

  /**
   * Get all discounts for a store
   */
  async getDiscounts(params: DiscountQueryParams): Promise<DiscountsResponse> {
    try {
      console.log('🎯 Fetching discounts with params:', params);

      const path = `/v0/store/${params.store_id}/discount`;
      const response = await apiClient.get<DiscountsResponse>(path, {});
      
      console.log('✅ Successfully fetched discounts from API:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error fetching discounts from API:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific discount by ID
   */
  async getDiscountById(_tenantId: string, storeId: string, discountId: string): Promise<Discount> {
    try {
      console.log('🎯 Fetching discount by ID:', discountId);

      const path = `/v0/store/${storeId}/discount/${discountId}`;
      const response = await apiClient.get<Discount>(path, {});
      
      console.log('✅ Successfully fetched discount from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching discount from API:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new discount
   */
  async createDiscount(
    _tenantId: string, 
    storeId: string, 
    discountData: CreateDiscountRequest
  ): Promise<Discount> {
    try {
      console.log('🎯 Creating discount:', discountData);

      const path = `/v0/store/${storeId}/discount`;
      const response = await apiClient.post<Discount>(path, discountData);
      
      console.log('✅ Successfully created discount:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error creating discount:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing discount
   */
  async updateDiscount(
    _tenantId: string, 
    storeId: string, 
    discountId: string, 
    discountData: Partial<CreateDiscountRequest>
  ): Promise<Discount> {
    try {
      console.log('🎯 Updating discount:', discountId, discountData);

      const path = `/v0/store/${storeId}/discount/${discountId}`;
      const response = await apiClient.put<Discount>(path, discountData);
      
      console.log('✅ Successfully updated discount:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error updating discount:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a discount
   */
  async deleteDiscount(_tenantId: string, storeId: string, discountId: string): Promise<void> {
    try {
      console.log('🎯 Deleting discount:', discountId);

      const path = `/v0/store/${storeId}/discount/${discountId}`;
      await apiClient.delete(path);
      
      console.log('✅ Successfully deleted discount');
      
    } catch (error) {
      console.error('❌ Error deleting discount:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    console.error('Unexpected error in discount API:', error);
    return new ApiError(
      'An unexpected error occurred while processing your request',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export const discountApiService = new DiscountApiService();
