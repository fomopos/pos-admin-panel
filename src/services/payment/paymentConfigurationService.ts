import { apiClient } from '../api';
import type {
  PaymentConfiguration,
  CreatePaymentConfigurationRequest,
  UpdatePaymentConfigurationRequest,
  PaymentConfigurationQueryParams,
  PaymentConfigurationResponse,
  PaymentServiceError
} from '../types/payment.types';

export class PaymentConfigurationService {
  private readonly basePath = '/payment/configuration';

  /**
   * Get payment configuration for a tenant/store
   */
  async getPaymentConfiguration(params?: PaymentConfigurationQueryParams): Promise<PaymentConfiguration | null> {
    try {
      const response = await apiClient.get<PaymentConfigurationResponse>(this.basePath, params);
      return response.data.configurations.length > 0 ? response.data.configurations[0] : null;
    } catch (error) {
      console.error('Failed to fetch payment configuration:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all payment configurations
   */
  async getAllPaymentConfigurations(params?: PaymentConfigurationQueryParams): Promise<PaymentConfiguration[]> {
    try {
      const response = await apiClient.get<PaymentConfigurationResponse>(this.basePath, params);
      return response.data.configurations;
    } catch (error) {
      console.error('Failed to fetch payment configurations:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new payment configuration
   */
  async createPaymentConfiguration(data: CreatePaymentConfigurationRequest): Promise<PaymentConfiguration> {
    try {
      // Validate required fields
      this.validatePaymentConfigurationData(data);
      
      const response = await apiClient.post<PaymentConfiguration>(this.basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create payment configuration:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update payment configuration
   */
  async updatePaymentConfiguration(tenantId: string, storeId: string, data: UpdatePaymentConfigurationRequest): Promise<PaymentConfiguration> {
    try {
      const response = await apiClient.put<PaymentConfiguration>(`${this.basePath}/${tenantId}/${storeId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update payment configuration for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete payment configuration
   */
  async deletePaymentConfiguration(tenantId: string, storeId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${tenantId}/${storeId}`);
    } catch (error) {
      console.error(`Failed to delete payment configuration for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get payment configuration statistics
   */
  async getPaymentConfigurationStats(tenantId: string, storeId: string): Promise<{
    totalTenders: number;
    activeTenders: number;
    supportedCurrencies: string[];
    isActive: boolean;
  }> {
    try {
      const config = await this.getPaymentConfiguration({ tenant_id: tenantId, store_id: storeId });
      
      if (!config) {
        return {
          totalTenders: 0,
          activeTenders: 0,
          supportedCurrencies: [],
          isActive: false
        };
      }

      const activeTenders = config.tenders.filter(tender => tender.is_active !== false);
      const supportedCurrencies = [...new Set(config.tenders.map(tender => tender.currency_id))];

      return {
        totalTenders: config.tenders.length,
        activeTenders: activeTenders.length,
        supportedCurrencies,
        isActive: true
      };
    } catch (error) {
      console.error(`Failed to get payment configuration stats for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Validate payment configuration data
   */
  private validatePaymentConfigurationData(data: CreatePaymentConfigurationRequest): void {
    const errors: PaymentServiceError[] = [];

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

    if (!data.tenders || data.tenders.length === 0) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'At least one tender is required',
        field: 'tenders'
      });
    }

    // Validate each tender
    if (data.tenders) {
      data.tenders.forEach((tender, index) => {
        this.validateTenderData(tender, index);
      });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Validate tender data
   */
  private validateTenderData(data: any, index?: number): void {
    const errors: PaymentServiceError[] = [];
    const fieldPrefix = index !== undefined ? `tenders[${index}].` : '';

    if (!data.tender_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tender ID is required',
        field: `${fieldPrefix}tender_id`
      });
    }

    if (!data.type_code) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Type code is required',
        field: `${fieldPrefix}type_code`
      });
    }

    if (!data.currency_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Currency ID is required',
        field: `${fieldPrefix}currency_id`
      });
    }

    if (!data.description) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Description is required',
        field: `${fieldPrefix}description`
      });
    }

    if (data.over_tender_allowed === undefined || data.over_tender_allowed === null) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Over tender allowed flag is required',
        field: `${fieldPrefix}over_tender_allowed`
      });
    }

    if (!data.availability || !Array.isArray(data.availability) || data.availability.length === 0) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Availability is required and must be a non-empty array',
        field: `${fieldPrefix}availability`
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
    
    return new Error('An unexpected error occurred while processing payment configuration request');
  }

  /**
   * Mock data for development/testing
   */
  async getMockPaymentConfiguration(): Promise<PaymentConfiguration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      tenant_id: "272e",
      store_id: "*",
      tenders: [
        {
          tender_id: "cash",
          type_code: "cash",
          currency_id: "aed",
          description: "Cash",
          over_tender_allowed: true,
          availability: ["sale", "return"],
          is_active: true,
          created_at: "2025-05-28T10:00:00Z",
          updated_at: "2025-05-28T10:00:00Z"
        },
        {
          tender_id: "credit_card",
          type_code: "credit_card",
          currency_id: "aed",
          description: "Credit Card",
          over_tender_allowed: false,
          availability: ["sale", "return"],
          is_active: true,
          created_at: "2025-05-28T10:00:00Z",
          updated_at: "2025-05-28T10:00:00Z"
        },
        {
          tender_id: "debit_card",
          type_code: "debit_card",
          currency_id: "aed",
          description: "Debit Card",
          over_tender_allowed: false,
          availability: ["sale", "return"],
          is_active: true,
          created_at: "2025-05-28T10:00:00Z",
          updated_at: "2025-05-28T10:00:00Z"
        },
        {
          tender_id: "gift_card",
          type_code: "gift_card",
          currency_id: "aed",
          description: "Gift Card",
          over_tender_allowed: false,
          availability: ["sale"],
          is_active: true,
          created_at: "2025-05-28T10:00:00Z",
          updated_at: "2025-05-28T10:00:00Z"
        }
      ],
      default_tender_id: "cash",
      created_at: "2025-05-28T10:00:00Z",
      updated_at: "2025-05-28T10:00:00Z",
      created_by: "admin"
    };
  }
}

// Create and export a singleton instance
export const paymentConfigurationService = new PaymentConfigurationService();
