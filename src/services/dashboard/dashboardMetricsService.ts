import { apiClient } from '../api';

export interface DashboardMetrics {
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
  total_discounts: number;
  taxes_collected: number;
  unique_items: number;
  total_quantity: number;
}

export interface HourlyRevenue {
  hour: number;
  revenue: number;
  orders: number;
  avg_order_value: number;
  total_items: number;
}

export interface PaymentBreakdown {
  tender_id: string;
  total_amount: number;
  avg_amount: number;
  transaction_count: number;
}

export interface WeeklyRevenue {
  day_of_week: number;
  day_name: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
  total_items: number;
}

export interface DashboardMetricsResponse {
  metrics: DashboardMetrics;
  hourly_revenue: HourlyRevenue[];
  weekly_revenue: WeeklyRevenue[];
  payment_breakdown: PaymentBreakdown[];
}

export interface DashboardMetricsFilters {
  storeId: string;
  startDate: string;
  endDate: string;
  timezone?: string;
}

export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

class DashboardMetricsService {
  /**
   * Get current store ID from tenant store
   */
  private getCurrentStoreId(): string {
    // Dynamically import to avoid circular dependencies
    try {
      const { useTenantStore } = require('../../tenants/tenantStore');
      const { currentStore } = useTenantStore.getState();
      return currentStore?.store_id || '400709'; // Fallback to default store ID
    } catch (error) {
      console.warn('Could not access tenant store, using default store ID:', error);
      return '400709'; // Default store ID from your example
    }
  }

  /**
   * Fetch dashboard metrics from the specified API endpoint
   */
  async getDashboardMetrics(filters: DashboardMetricsFilters): Promise<DashboardMetricsResponse> {
    console.log('📊 Dashboard Metrics API Call:', {
      endpoint: `/v0/store/${filters.storeId}/dashboard/metrics`,
      filters,
      timestamp: new Date().toISOString()
    });

    try {
      const params = new URLSearchParams();
      params.append('start_date', filters.startDate);
      params.append('end_date', filters.endDate);
      if (filters.timezone) {
        params.append('timezone', filters.timezone);
      }

      const endpoint = `/v0/store/${filters.storeId}/dashboard/metrics?${params.toString()}`;
      const response = await apiClient.get<DashboardMetricsResponse>(endpoint);
      
      console.log('✅ Dashboard Metrics API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard metrics:', error);
      console.log('🔄 Falling back to mock data');
      // Return mock data for development/fallback
      return this.getMockMetricsData();
    }
  }

  /**
   * Get date range for a given time period
   */
  getDateRangeForPeriod(period: TimePeriod, timezone: string = '+05:30'): DashboardMetricsFilters {
    const now = new Date();
    const storeId = this.getCurrentStoreId();
    
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'week':
        startDate = new Date(now);
        const dayOfWeek = startDate.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
        startDate.setDate(startDate.getDate() - daysToSubtract);
        startDate.setHours(0, 0, 0, 0);
        break;
      
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      
      case 'quarter':
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        break;
      
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return {
      storeId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      timezone
    };
  }

  /**
   * Mock data matching the API response format you provided
   */
  private getMockMetricsData(): DashboardMetricsResponse {
    return {
      metrics: {
        total_sales: 1221,
        total_orders: 8,
        avg_order_value: 152.625,
        total_discounts: 39,
        taxes_collected: 186.2599959373474,
        unique_items: 15,
        total_quantity: 17
      },
      hourly_revenue: [
        {
          hour: 0,
          revenue: 330,
          orders: 2,
          avg_order_value: 165,
          total_items: 3
        },
        {
          hour: 17,
          revenue: 71,
          orders: 1,
          avg_order_value: 71,
          total_items: 3
        },
        {
          hour: 18,
          revenue: 60,
          orders: 1,
          avg_order_value: 60,
          total_items: 1
        },
        {
          hour: 19,
          revenue: 240,
          orders: 1,
          avg_order_value: 240,
          total_items: 5
        },
        {
          hour: 23,
          revenue: 520,
          orders: 3,
          avg_order_value: 173.33333333333334,
          total_items: 5
        }
      ],
      weekly_revenue: [
        {
          day_of_week: 4,
          day_name: "Thursday",
          revenue: 520,
          orders: 3,
          avg_order_value: 173.33333333333334,
          total_items: 5
        },
        {
          day_of_week: 5,
          day_name: "Friday",
          revenue: 330,
          orders: 2,
          avg_order_value: 165,
          total_items: 3
        },
        {
          day_of_week: 6,
          day_name: "Saturday",
          revenue: 371,
          orders: 3,
          avg_order_value: 123.66666666666667,
          total_items: 9
        }
      ],
      payment_breakdown: [
        {
          tender_id: "cash_usd",
          total_amount: 1221,
          avg_amount: 152.625,
          transaction_count: 8
        },
        {
          tender_id: "card_visa",
          total_amount: 850,
          avg_amount: 170,
          transaction_count: 5
        },
        {
          tender_id: "digital_wallet",
          total_amount: 345,
          avg_amount: 115,
          transaction_count: 3
        }
      ]
    };
  }
}

export const dashboardMetricsService = new DashboardMetricsService();
