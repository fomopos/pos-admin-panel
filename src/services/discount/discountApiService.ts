// Discount API service for managing discounts
import { apiClient, ApiError, USE_MOCK_DATA } from '../api';
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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock discount data');
        return this.getMockDiscounts();
      }

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
  async getDiscountById(tenantId: string, storeId: string, discountId: string): Promise<Discount> {
    try {
      console.log('🎯 Fetching discount by ID:', discountId);
      
      if (USE_MOCK_DATA) {
        const mockData = this.getMockDiscounts();
        const discount = mockData.discounts.find(d => d.discount_id === discountId);
        if (!discount) {
          throw new ApiError('Discount not found', 404, 'DISCOUNT_NOT_FOUND');
        }
        return discount;
      }

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
    tenantId: string, 
    storeId: string, 
    discountData: CreateDiscountRequest
  ): Promise<Discount> {
    try {
      console.log('🎯 Creating discount:', discountData);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock discount creation');
        return this.createMockDiscount(tenantId, storeId, discountData);
      }

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
    tenantId: string, 
    storeId: string, 
    discountId: string, 
    discountData: Partial<CreateDiscountRequest>
  ): Promise<Discount> {
    try {
      console.log('🎯 Updating discount:', discountId, discountData);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock discount update');
        return this.updateMockDiscount(tenantId, storeId, discountId, discountData);
      }


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
  async deleteDiscount(tenantId: string, storeId: string, discountId: string): Promise<void> {
    try {
      console.log('🎯 Deleting discount:', discountId);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock discount deletion');
        return;
      }

      const path = `/v0/store/${storeId}/discount/${discountId}`;
      await apiClient.delete(path);
      
      console.log('✅ Successfully deleted discount');
      
    } catch (error) {
      console.error('❌ Error deleting discount:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mock data for development
   */
  private getMockDiscounts(): DiscountsResponse {
    const mockDiscounts: Discount[] = [
      {
        tenant_id: "2711",
        store_id: "10001",
        discount_id: "DISC_10001_WELCOME10",
        discount_code: "WELCOME10",
        effective_datetime: "2025-06-23T00:00:00Z",
        expr_datetime: "2025-12-31T23:59:59Z",
        typcode: "DISCOUNT",
        app_mthd_code: "TRANSACTION",
        percentage: 10,
        description: "10% off for new customers",
        calculation_mthd_code: "PERCENT",
        prompt: "Welcome discount applied",
        max_trans_count: 1,
        exclusive_discount_flag: 1,
        discount: null,
        min_eligible_price: 50,
        serialized_discount_flag: 0,
        max_discount: 25,
        sort_order: 1,
        disallow_change_flag: 0,
        max_amount: 25,
        max_percentage: 15,
        properties: null,
        created_at: "2025-06-23T23:53:49.486371+04:00",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-06-23T23:53:49.486372+04:00",
        update_user_id: null
      },
      {
        tenant_id: "2711",
        store_id: "10001",
        discount_id: "DISC_10001_SUMMER25",
        discount_code: "SUMMER25",
        effective_datetime: "2025-06-01T00:00:00Z",
        expr_datetime: "2025-08-31T23:59:59Z",
        typcode: "VOUCHER",
        app_mthd_code: "LINE_ITEM",
        discount: 25,
        description: "$25 off summer sale",
        calculation_mthd_code: "AMOUNT",
        prompt: "Summer sale discount",
        max_trans_count: 5,
        exclusive_discount_flag: 0,
        min_eligible_price: 100,
        serialized_discount_flag: 0,
        max_discount: 25,
        sort_order: 2,
        disallow_change_flag: 0,
        max_amount: 25,
        max_percentage: null,
        properties: null,
        created_at: "2025-06-01T10:00:00.000000+04:00",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-06-01T10:00:00.000000+04:00",
        update_user_id: null
      }
    ];

    return {
      discounts: mockDiscounts,
      total: mockDiscounts.length
    };
  }

  private createMockDiscount(tenantId: string, storeId: string, discountData: CreateDiscountRequest): Discount {
    const now = new Date().toISOString();
    return {
      tenant_id: tenantId,
      store_id: storeId,
      discount_id: `DISC_${storeId}_${discountData.discount_code}`,
      ...discountData,
      properties: null,
      created_at: now,
      create_user_id: "MOCK_USER",
      updated_at: now,
      update_user_id: null
    };
  }

  private updateMockDiscount(
    tenantId: string, 
    storeId: string, 
    discountId: string, 
    discountData: Partial<CreateDiscountRequest>
  ): Discount {
    const now = new Date().toISOString();
    return {
      tenant_id: tenantId,
      store_id: storeId,
      discount_id: discountId,
      discount_code: discountData.discount_code || 'MOCK_CODE',
      effective_datetime: discountData.effective_datetime || now,
      expr_datetime: discountData.expr_datetime || now,
      typcode: discountData.typcode || 'DISCOUNT',
      app_mthd_code: discountData.app_mthd_code || 'TRANSACTION',
      percentage: discountData.percentage || 0,
      discount: discountData.discount || null,
      description: discountData.description || 'Mock discount',
      calculation_mthd_code: discountData.calculation_mthd_code || 'PERCENT',
      prompt: discountData.prompt || 'Mock prompt',
      max_trans_count: discountData.max_trans_count || null,
      exclusive_discount_flag: discountData.exclusive_discount_flag || 0,
      min_eligible_price: discountData.min_eligible_price || null,
      serialized_discount_flag: discountData.serialized_discount_flag || 0,
      max_discount: discountData.max_discount || null,
      sort_order: discountData.sort_order || 1,
      disallow_change_flag: discountData.disallow_change_flag || 0,
      max_amount: discountData.max_amount || null,
      max_percentage: discountData.max_percentage || null,
      properties: null,
      created_at: now,
      create_user_id: "MOCK_USER",
      updated_at: now,
      update_user_id: "MOCK_USER"
    };
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
