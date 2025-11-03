// Reason Code API service for managing reason codes
import { apiClient, ApiError, USE_MOCK_DATA } from '../api';
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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code data');
        return this.getMockReasonCodes(params);
      }

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
      
      if (USE_MOCK_DATA) {
        const mockData = this.getMockReasonCodes({ store_id: storeId });
        const reasonCode = mockData.reason_codes.find(rc => rc.code === code);
        if (!reasonCode) {
          throw new ApiError('Reason code not found', 404, 'REASON_CODE_NOT_FOUND');
        }
        return reasonCode;
      }

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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code creation');
        return this.createMockReasonCode(storeId, reasonCodeData);
      }

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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code update');
        return this.updateMockReasonCode(storeId, code, reasonCodeData);
      }

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
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock reason code deletion');
        return;
      }

      const path = `/v0/store/${storeId}/config/reason-code/${code}`;
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
        tenant_id: "tenant-123",
        store_id: params.store_id,
        categories: ["operational", "transaction"],
        code: "VOID_001",
        description: "Customer changed mind",
        active: true,
        sort_order: 1,
        req_cmt: true,
        parent_code: null,
        created_at: "2025-11-04T10:30:00Z",
        updated_at: "2025-11-04T10:30:00Z",
        create_user_id: "user-123",
        update_user_id: "user-123",
        type: "reason_code"
      },
      {
        tenant_id: "tenant-123",
        store_id: params.store_id,
        categories: ["financial"],
        code: "REFUND_DEFECT",
        description: "Product defective",
        active: true,
        sort_order: 2,
        req_cmt: false,
        parent_code: "REFUND",
        created_at: "2025-11-04T10:30:00Z",
        updated_at: "2025-11-04T10:30:00Z",
        create_user_id: "user-123",
        update_user_id: "user-123",
        type: "reason_code"
      },
      {
        tenant_id: "tenant-123",
        store_id: params.store_id,
        categories: ["operational"],
        code: "DISCOUNT_MGR",
        description: "Manager Discount Authorization",
        active: true,
        sort_order: 3,
        req_cmt: true,
        parent_code: null,
        created_at: "2025-11-04T10:30:00Z",
        updated_at: "2025-11-04T10:30:00Z",
        create_user_id: "user-123",
        update_user_id: "user-123",
        type: "reason_code"
      },
      {
        tenant_id: "tenant-123",
        store_id: params.store_id,
        categories: ["item-related", "operational"],
        code: "PRICE_OVERRIDE",
        description: "Price Override - Damaged Item",
        active: true,
        sort_order: 4,
        req_cmt: true,
        parent_code: null,
        created_at: "2025-11-04T10:30:00Z",
        updated_at: "2025-11-04T10:30:00Z",
        create_user_id: "user-123",
        update_user_id: "user-123",
        type: "reason_code"
      },
      {
        tenant_id: "tenant-123",
        store_id: params.store_id,
        categories: ["other"],
        code: "OLD_CODE",
        description: "Deprecated Reason Code",
        active: false,
        sort_order: 99,
        req_cmt: false,
        parent_code: null,
        created_at: "2025-10-01T10:30:00Z",
        updated_at: "2025-11-01T10:30:00Z",
        create_user_id: "user-123",
        update_user_id: "user-123",
        type: "reason_code"
      }
    ];

    // Apply filters
    let filtered = mockReasonCodes;

    if (params.active !== undefined) {
      filtered = filtered.filter(rc => rc.active === params.active);
    }

    if (params.category) {
      filtered = filtered.filter(rc => rc.categories.includes(params.category!));
    }

    return {
      reason_codes: filtered,
      total: filtered.length
    };
  }

  private createMockReasonCode(storeId: string, reasonCodeData: CreateReasonCodeRequest): ReasonCode {
    const now = new Date().toISOString();
    return {
      tenant_id: "tenant-123",
      store_id: storeId,
      categories: reasonCodeData.categories,
      code: reasonCodeData.code,
      description: reasonCodeData.description,
      active: reasonCodeData.active ?? true,
      sort_order: reasonCodeData.sort_order ?? 0,
      req_cmt: reasonCodeData.req_cmt ?? false,
      parent_code: reasonCodeData.parent_code ?? null,
      created_at: now,
      updated_at: now,
      create_user_id: "MOCK_USER",
      update_user_id: "MOCK_USER",
      type: "reason_code"
    };
  }

  private updateMockReasonCode(
    storeId: string, 
    code: string, 
    reasonCodeData: UpdateReasonCodeRequest
  ): ReasonCode {
    const now = new Date().toISOString();
    return {
      tenant_id: "tenant-123",
      store_id: storeId,
      categories: reasonCodeData.categories || ["other"],
      code: reasonCodeData.code || code,
      description: reasonCodeData.description || "Mock reason code",
      active: reasonCodeData.active ?? true,
      sort_order: reasonCodeData.sort_order ?? 0,
      req_cmt: reasonCodeData.req_cmt ?? false,
      parent_code: reasonCodeData.parent_code ?? null,
      created_at: now,
      updated_at: now,
      create_user_id: "MOCK_USER",
      update_user_id: "MOCK_USER",
      type: "reason_code"
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
