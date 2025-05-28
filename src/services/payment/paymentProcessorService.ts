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

  /**
   * Get mock payment processors for development
   */
  async getMockPaymentProcessors(): Promise<PaymentProcessor[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        processor_id: 'stripe',
        name: 'Stripe',
        type: 'card',
        is_active: true,
        config: {
          enabled: true,
          min_amount: 0.50,
          max_amount: 999999.99,
          fee_percentage: 2.9,
          fee_fixed: 0.30,
          processing_time: '2-3 seconds'
        },
        supported_currencies: ['usd', 'eur', 'gbp', 'aed'],
        fee_structure: {
          percentage: 2.9,
          fixed_amount: 0.30,
          currency: 'usd'
        },
        api_credentials: {
          public_key: 'pk_test_...',
          webhook_url: 'https://api.yourstore.com/webhooks/stripe',
          sandbox_mode: true
        },
        created_at: '2025-05-28T10:00:00Z',
        updated_at: '2025-05-28T10:00:00Z'
      },
      {
        processor_id: 'paypal',
        name: 'PayPal',
        type: 'digital_wallet',
        is_active: true,
        config: {
          enabled: true,
          min_amount: 1.00,
          max_amount: 10000.00,
          fee_percentage: 3.49,
          fee_fixed: 0.49,
          processing_time: '1-2 seconds'
        },
        supported_currencies: ['usd', 'eur', 'gbp', 'cad', 'aud'],
        fee_structure: {
          percentage: 3.49,
          fixed_amount: 0.49,
          currency: 'usd'
        },
        api_credentials: {
          public_key: 'sb_client_id_...',
          webhook_url: 'https://api.yourstore.com/webhooks/paypal',
          sandbox_mode: true
        },
        created_at: '2025-05-28T10:00:00Z',
        updated_at: '2025-05-28T10:00:00Z'
      },
      {
        processor_id: 'network_international',
        name: 'Network International',
        type: 'card',
        is_active: false,
        config: {
          enabled: false,
          min_amount: 1.00,
          max_amount: 50000.00,
          fee_percentage: 2.5,
          fee_fixed: 0.25,
          processing_time: '3-5 seconds'
        },
        supported_currencies: ['aed', 'sar', 'egp'],
        fee_structure: {
          percentage: 2.5,
          fixed_amount: 0.25,
          currency: 'aed'
        },
        api_credentials: {
          public_key: 'ni_test_...',
          webhook_url: 'https://api.yourstore.com/webhooks/ni',
          sandbox_mode: true
        },
        created_at: '2025-05-28T10:00:00Z',
        updated_at: '2025-05-28T10:00:00Z'
      }
    ];
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
