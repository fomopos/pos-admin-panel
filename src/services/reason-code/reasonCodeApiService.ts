// Reason Code API service for managing reason codes
import { apiClient, ApiError, USE_MOCK_DATA } from '../api';
import type { 
  ReasonCode, 
  CreateReasonCodeRequest, 
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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code data');
        return this.getMockReasonCodes(params);
      }

      const path = `/v0/store/${params.store_id}/reason-code`;
      const response = await apiClient.get<ReasonCodesResponse>(path, {});
      
      console.log('✅ Successfully fetched reason codes from API:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error fetching reason codes from API:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific reason code by ID
   */
  async getReasonCodeById(_tenantId: string, storeId: string, reasonCodeId: string): Promise<ReasonCode> {
    try {
      console.log('🎯 Fetching reason code by ID:', reasonCodeId);
      
      if (USE_MOCK_DATA) {
        const mockData = this.getMockReasonCodes({});
        const reasonCode = mockData.reason_codes.find(rc => rc.reason_code_id === reasonCodeId);
        if (!reasonCode) {
          throw new ApiError('Reason code not found', 404, 'REASON_CODE_NOT_FOUND');
        }
        return reasonCode;
      }

      const path = `/v0/store/${storeId}/reason-code/${reasonCodeId}`;
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
    tenantId: string, 
    storeId: string, 
    reasonCodeData: CreateReasonCodeRequest
  ): Promise<ReasonCode> {
    try {
      console.log('🎯 Creating reason code:', reasonCodeData);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code creation');
        return this.createMockReasonCode(tenantId, storeId, reasonCodeData);
      }

      const path = `/v0/store/${storeId}/reason-code`;
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
    tenantId: string, 
    storeId: string, 
    reasonCodeId: string, 
    reasonCodeData: Partial<CreateReasonCodeRequest>
  ): Promise<ReasonCode> {
    try {
      console.log('🎯 Updating reason code:', reasonCodeId, reasonCodeData);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code update');
        return this.updateMockReasonCode(tenantId, storeId, reasonCodeId, reasonCodeData);
      }

      const path = `/v0/store/${storeId}/reason-code/${reasonCodeId}`;
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
  async deleteReasonCode(_tenantId: string, storeId: string, reasonCodeId: string): Promise<void> {
    try {
      console.log('🎯 Deleting reason code:', reasonCodeId);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code deletion');
        return;
      }

      const path = `/v0/store/${storeId}/reason-code/${reasonCodeId}`;
      await apiClient.delete(path);
      
      console.log('✅ Successfully deleted reason code');
      
    } catch (error) {
      console.error('❌ Error deleting reason code:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mock data for development
   */
  private getMockReasonCodes(params: ReasonCodeQueryParams): ReasonCodesResponse {
    const mockReasonCodes: ReasonCode[] = [
      {
        tenant_id: "2711",
        store_id: "10001",
        reason_code_id: "RC_10001_DISC10",
        code: "DISC10",
        description: "10% Discount - Customer Loyalty",
        categories: ["DISCOUNT"],
        active: true,
        created_at: "2025-01-15T10:00:00Z",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-01-15T10:00:00Z",
        update_user_id: null
      },
      {
        tenant_id: "2711",
        store_id: "10001",
        reason_code_id: "RC_10001_RET01",
        code: "RET01",
        description: "Return - Defective Item",
        categories: ["RETURN"],
        active: true,
        created_at: "2025-01-15T10:00:00Z",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-01-15T10:00:00Z",
        update_user_id: null
      },
      {
        tenant_id: "2711",
        store_id: "10001",
        reason_code_id: "RC_10001_RET02",
        code: "RET02",
        description: "Return - Customer Changed Mind",
        categories: ["RETURN"],
        active: true,
        created_at: "2025-01-15T10:00:00Z",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-01-15T10:00:00Z",
        update_user_id: null
      },
      {
        tenant_id: "2711",
        store_id: "10001",
        reason_code_id: "RC_10001_VOID01",
        code: "VOID01",
        description: "Void - Cashier Error",
        categories: ["VOID", "TRANSACTION"],
        active: true,
        created_at: "2025-01-15T10:00:00Z",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-01-15T10:00:00Z",
        update_user_id: null
      },
      {
        tenant_id: "2711",
        store_id: "10001",
        reason_code_id: "RC_10001_PROMO01",
        code: "PROMO01",
        description: "Promotional - Manager Special",
        categories: ["PROMOTION", "DISCOUNT"],
        active: true,
        created_at: "2025-01-15T10:00:00Z",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-01-15T10:00:00Z",
        update_user_id: null
      },
      {
        tenant_id: "2711",
        store_id: "10001",
        reason_code_id: "RC_10001_TRANS01",
        code: "TRANS01",
        description: "Transaction Adjustment",
        categories: ["TRANSACTION", "OTHER"],
        active: true,
        created_at: "2025-01-15T10:00:00Z",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-01-15T10:00:00Z",
        update_user_id: null
      },
      {
        tenant_id: "2711",
        store_id: "10001",
        reason_code_id: "RC_10001_OLD01",
        code: "OLD01",
        description: "Deprecated Reason Code",
        categories: ["OTHER"],
        active: false,
        created_at: "2025-01-01T10:00:00Z",
        create_user_id: "Y8Z4UL",
        updated_at: "2025-01-10T10:00:00Z",
        update_user_id: "Y8Z4UL"
      }
    ];

    // Apply filters
    let filtered = mockReasonCodes;

    if (params.active_only) {
      filtered = filtered.filter(rc => rc.active);
    }

    if (params.category) {
      filtered = filtered.filter(rc => rc.categories.includes(params.category!));
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(rc => 
        rc.code.toLowerCase().includes(searchLower) ||
        rc.description.toLowerCase().includes(searchLower)
      );
    }

    return {
      reason_codes: filtered,
      total: filtered.length
    };
  }

  private createMockReasonCode(tenantId: string, storeId: string, reasonCodeData: CreateReasonCodeRequest): ReasonCode {
    const now = new Date().toISOString();
    return {
      tenant_id: tenantId,
      store_id: storeId,
      reason_code_id: `RC_${storeId}_${reasonCodeData.code}`,
      ...reasonCodeData,
      created_at: now,
      create_user_id: "MOCK_USER",
      updated_at: now,
      update_user_id: null
    };
  }

  private updateMockReasonCode(
    tenantId: string, 
    storeId: string, 
    reasonCodeId: string, 
    reasonCodeData: Partial<CreateReasonCodeRequest>
  ): ReasonCode {
    const now = new Date().toISOString();
    return {
      tenant_id: tenantId,
      store_id: storeId,
      reason_code_id: reasonCodeId,
      code: reasonCodeData.code || 'MOCK_CODE',
      description: reasonCodeData.description || 'Mock reason code',
      categories: reasonCodeData.categories || ['OTHER'],
      active: reasonCodeData.active !== undefined ? reasonCodeData.active : true,
      created_at: now,
      create_user_id: "MOCK_USER",
      updated_at: now,
      update_user_id: "MOCK_USER"
    };
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
