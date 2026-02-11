import { apiClient } from '../api';

export interface PaymentAnalytics {
  tenant_id: string;
  store_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date_range: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    total_transactions: number;
    total_amount: number;
    average_transaction_value: number;
    successful_payments: number;
    failed_payments: number;
    refunds: number;
    refund_amount: number;
    processing_fees: number;
  };
  tender_breakdown: {
    tender_id: string;
    tender_name: string;
    transaction_count: number;
    total_amount: number;
    percentage_of_total: number;
  }[];
  currency_breakdown: {
    currency_code: string;
    transaction_count: number;
    total_amount: number;
  }[];
  hourly_distribution?: {
    hour: number;
    transaction_count: number;
    total_amount: number;
  }[];
  processor_performance?: {
    processor_id: string;
    processor_name: string;
    success_rate: number;
    average_processing_time: number;
    total_fees: number;
  }[];
}

export interface PaymentTrends {
  comparison_period: string;
  growth_metrics: {
    transaction_growth: number;
    revenue_growth: number;
    average_value_growth: number;
  };
  trending_tenders: {
    tender_id: string;
    growth_percentage: number;
    trend_direction: 'up' | 'down' | 'stable';
  }[];
  peak_hours: {
    hour: number;
    transaction_count: number;
  }[];
  recommendations: string[];
}

export interface AnalyticsQueryParams {
  tenant_id: string;
  store_id?: string;
  start_date: string;
  end_date: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tender_ids?: string[];
  currency_codes?: string[];
  processor_ids?: string[];
}

export class PaymentAnalyticsService {
  private readonly basePath = '/payment/analytics';

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(params: AnalyticsQueryParams): Promise<PaymentAnalytics> {
    try {
      const response = await apiClient.get<PaymentAnalytics>(this.basePath, params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get payment trends
   */
  async getPaymentTrends(params: AnalyticsQueryParams): Promise<PaymentTrends> {
    try {
      const response = await apiClient.get<PaymentTrends>(`${this.basePath}/trends`, params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment trends:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get real-time payment metrics
   */
  async getRealTimeMetrics(tenantId: string, storeId?: string): Promise<{
    active_transactions: number;
    pending_payments: number;
    last_24h_revenue: number;
    current_hour_transactions: number;
    system_status: 'healthy' | 'warning' | 'error';
    processor_status: {
      processor_id: string;
      status: 'online' | 'offline' | 'degraded';
      last_ping: string;
    }[];
  }> {
    try {
      const params = { tenant_id: tenantId, ...(storeId && { store_id: storeId }) };
      const response = await apiClient.get(`${this.basePath}/realtime`, params);
      return response.data as {
        active_transactions: number;
        pending_payments: number;
        last_24h_revenue: number;
        current_hour_transactions: number;
        system_status: 'healthy' | 'warning' | 'error';
        processor_status: {
          processor_id: string;
          status: 'online' | 'offline' | 'degraded';
          last_ping: string;
        }[];
      };
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    params: AnalyticsQueryParams,
    format: 'csv' | 'xlsx' | 'pdf'
  ): Promise<{ download_url: string; expires_at: string }> {
    try {
      const response = await apiClient.post(`${this.basePath}/export`, {
        ...params,
        format
      });
      return response.data as { download_url: string; expires_at: string };
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred while processing payment analytics request');
  }
}

// Create and export singleton instance
export const paymentAnalyticsService = new PaymentAnalyticsService();
