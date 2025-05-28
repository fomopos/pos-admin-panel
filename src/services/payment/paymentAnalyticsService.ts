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

  /**
   * Get mock analytics for development
   */
  async getMockAnalytics(): Promise<PaymentAnalytics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      tenant_id: '272e',
      store_id: '*',
      period: 'monthly',
      date_range: {
        start_date: '2025-04-01T00:00:00Z',
        end_date: '2025-04-30T23:59:59Z'
      },
      metrics: {
        total_transactions: 1547,
        total_amount: 45290.75,
        average_transaction_value: 29.27,
        successful_payments: 1502,
        failed_payments: 45,
        refunds: 23,
        refund_amount: 1205.50,
        processing_fees: 1357.72
      },
      tender_breakdown: [
        {
          tender_id: 'credit_card',
          tender_name: 'Credit Card',
          transaction_count: 892,
          total_amount: 28456.90,
          percentage_of_total: 62.8
        },
        {
          tender_id: 'cash',
          tender_name: 'Cash',
          transaction_count: 423,
          total_amount: 12387.25,
          percentage_of_total: 27.4
        },
        {
          tender_id: 'debit_card',
          tender_name: 'Debit Card',
          transaction_count: 187,
          total_amount: 3721.35,
          percentage_of_total: 8.2
        },
        {
          tender_id: 'gift_card',
          tender_name: 'Gift Card',
          transaction_count: 45,
          total_amount: 725.25,
          percentage_of_total: 1.6
        }
      ],
      currency_breakdown: [
        {
          currency_code: 'AED',
          transaction_count: 1234,
          total_amount: 36218.60
        },
        {
          currency_code: 'USD',
          transaction_count: 313,
          total_amount: 9072.15
        }
      ],
      hourly_distribution: [
        { hour: 9, transaction_count: 45, total_amount: 1320.50 },
        { hour: 10, transaction_count: 78, total_amount: 2287.25 },
        { hour: 11, transaction_count: 112, total_amount: 3254.80 },
        { hour: 12, transaction_count: 156, total_amount: 4567.30 },
        { hour: 13, transaction_count: 134, total_amount: 3921.45 },
        { hour: 14, transaction_count: 189, total_amount: 5512.75 },
        { hour: 15, transaction_count: 198, total_amount: 5789.20 },
        { hour: 16, transaction_count: 176, total_amount: 5134.85 },
        { hour: 17, transaction_count: 145, total_amount: 4236.70 },
        { hour: 18, transaction_count: 123, total_amount: 3598.45 },
        { hour: 19, transaction_count: 98, total_amount: 2867.35 },
        { hour: 20, transaction_count: 67, total_amount: 1956.25 }
      ],
      processor_performance: [
        {
          processor_id: 'stripe',
          processor_name: 'Stripe',
          success_rate: 98.5,
          average_processing_time: 2.3,
          total_fees: 826.45
        },
        {
          processor_id: 'paypal',
          processor_name: 'PayPal',
          success_rate: 97.2,
          average_processing_time: 1.8,
          total_fees: 531.27
        }
      ]
    };
  }

  /**
   * Get mock trends for development
   */
  async getMockTrends(): Promise<PaymentTrends> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      comparison_period: 'vs last month',
      growth_metrics: {
        transaction_growth: 12.5,
        revenue_growth: 15.3,
        average_value_growth: 2.5
      },
      trending_tenders: [
        { tender_id: 'credit_card', growth_percentage: 18.2, trend_direction: 'up' },
        { tender_id: 'debit_card', growth_percentage: 8.7, trend_direction: 'up' },
        { tender_id: 'cash', growth_percentage: -5.3, trend_direction: 'down' },
        { tender_id: 'gift_card', growth_percentage: 0.8, trend_direction: 'stable' }
      ],
      peak_hours: [
        { hour: 14, transaction_count: 189 },
        { hour: 15, transaction_count: 198 },
        { hour: 16, transaction_count: 176 }
      ],
      recommendations: [
        'Consider promoting gift cards during peak hours',
        'Credit card usage is trending up - ensure processors are optimized',
        'Cash usage declining - consider digital payment incentives',
        'Peak hours are 2-4 PM - ensure adequate payment processing capacity'
      ]
    };
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
