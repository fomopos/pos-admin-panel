import { apiClient } from '../api';
import type { PaymentMethodConfig } from '../types/payment.types';

export interface PaymentProcessor {
  processor_id: string;
  name: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer' | 'crypto';
  is_active: boolean;
  config: PaymentMethodConfig;
  supported_currencies: string[];
  fee_structure: {
    percentage: number;
    fixed_amount: number;
    currency: string;
  };
  api_credentials?: {
    public_key?: string;
    webhook_url?: string;
    sandbox_mode: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateProcessorRequest {
  processor_id: string;
  name: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer' | 'crypto';
  config: PaymentMethodConfig;
  supported_currencies: string[];
  fee_structure: {
    percentage: number;
    fixed_amount: number;
    currency: string;
  };
  api_credentials?: {
    public_key?: string;
    webhook_url?: string;
    sandbox_mode: boolean;
  };
}

export class PaymentProcessorService {
  private readonly basePath = '/payment/processors';

  /**
   * Get all payment processors
   */
  async getPaymentProcessors(tenantId: string): Promise<PaymentProcessor[]> {
    try {
      const response = await apiClient.get<{ processors: PaymentProcessor[] }>(
        `${this.basePath}?tenant_id=${tenantId}`
      );
      return response.data.processors;
    } catch (error) {
      console.error('Failed to fetch payment processors:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create payment processor
   */
  async createPaymentProcessor(tenantId: string, data: CreateProcessorRequest): Promise<PaymentProcessor> {
    try {
      const response = await apiClient.post<PaymentProcessor>(this.basePath, {
        ...data,
        tenant_id: tenantId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create payment processor:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update payment processor
   */
  async updatePaymentProcessor(
    tenantId: string, 
    processorId: string, 
    data: Partial<CreateProcessorRequest>
  ): Promise<PaymentProcessor> {
    try {
      const response = await apiClient.put<PaymentProcessor>(
        `${this.basePath}/${processorId}?tenant_id=${tenantId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update payment processor:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle processor status
   */
  async toggleProcessorStatus(tenantId: string, processorId: string, isActive: boolean): Promise<PaymentProcessor> {
    try {
      const response = await apiClient.patch<PaymentProcessor>(
        `${this.basePath}/${processorId}/status?tenant_id=${tenantId}`,
        { is_active: isActive }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to toggle processor status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Test processor connection
   */
  async testProcessorConnection(tenantId: string, processorId: string): Promise<{
    success: boolean;
    message: string;
    latency_ms?: number;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        latency_ms?: number;
      }>(`${this.basePath}/${processorId}/test?tenant_id=${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to test processor connection:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred while processing payment processor request');
  }
}

// Create and export singleton instance
export const paymentProcessorService = new PaymentProcessorService();
