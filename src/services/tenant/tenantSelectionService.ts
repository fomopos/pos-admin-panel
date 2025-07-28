// Tenant Selection Service for the new API structure
import { apiClient, ApiError } from '../api';
import { authService } from '../../auth/authService';

export interface TenantSelectionRequest {
  tenant_id: string;
  store_id?: string;
}

export interface TenantSelectionResponse {
  success: boolean;
  message: string;
  tenant_id: string;
  store_id?: string;
  expires_at?: string;
}

/**
 * Service for tenant selection and token refresh workflow
 */
class TenantSelectionService {
  /**
   * Select a tenant on the server side
   * This API call informs the server which tenant context to use
   * @param tenantId - The tenant ID to select
   * @param storeId - Optional store ID to select
   * @returns Promise with selection response
   */
  async selectTenant(tenantId: string, storeId?: string): Promise<TenantSelectionResponse> {
    try {
      console.log('🎯 Selecting tenant on server:', { tenantId, storeId });
      
      const requestData: TenantSelectionRequest = {
        tenant_id: tenantId,
        ...(storeId && { store_id: storeId })
      };

      // Call the tenant selection API
      const response = await apiClient.post<TenantSelectionResponse>('/v0/tenant/selection', requestData);
      
      console.log('✅ Tenant selected successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error selecting tenant:', error);
      throw new ApiError(
        'Failed to select tenant on server',
        500,
        'TENANT_SELECTION_FAILED'
      );
    }
  }

  /**
   * Refresh the authentication token after tenant selection
   * This ensures subsequent API calls include the correct tenant context
   * @returns Promise with new token
   */
  async refreshTokenAfterTenantSelection(): Promise<string | null> {
    try {
      console.log('🔄 Refreshing token after tenant selection');
      
      // Force refresh the AWS Cognito session
      const newToken = await authService.refreshToken();
      
      if (newToken) {
        console.log('✅ Token refreshed successfully');
        return newToken;
      } else {
        throw new Error('No token received from refresh');
      }
      
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      throw new ApiError(
        'Failed to refresh authentication token',
        401,
        'TOKEN_REFRESH_FAILED'
      );
    }
  }

  /**
   * Complete tenant selection workflow:
   * 1. Select tenant on server
   * 2. Refresh authentication token
   * 3. Update API client with new token
   * @param tenantId - The tenant ID to select
   * @param storeId - Optional store ID to select
   * @returns Promise with selection result
   */
  async completeTenantSelection(tenantId: string, storeId?: string): Promise<{
    tenantSelection: TenantSelectionResponse;
    tokenRefreshed: boolean;
  }> {
    try {
      console.log('🚀 Starting complete tenant selection workflow');
      
      // Step 1: Select tenant on server
      const tenantSelection = await this.selectTenant(tenantId, storeId);
      
      // Step 2: Refresh token
      const newToken = await this.refreshTokenAfterTenantSelection();
      
      // Step 3: Update API client with new token (this happens automatically in apiClient)
      const tokenRefreshed = !!newToken;
      
      console.log('✅ Complete tenant selection workflow finished successfully');
      
      return {
        tenantSelection,
        tokenRefreshed
      };
      
    } catch (error) {
      console.error('❌ Error in complete tenant selection workflow:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tenantSelectionService = new TenantSelectionService();
export default tenantSelectionService;
