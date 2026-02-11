import { apiClient } from '../api';
import { useTenantStore } from '../../tenants/tenantStore';
import type { ScaledInt } from '../transaction/transactionService';
import { fromScaledInt } from '../transaction/transactionService';

/**
 * Raw API response with ScaledInt values (multiplied by 10000)
 */
export interface DashboardMetricsRaw {
  total_sales: ScaledInt;
  total_orders: number; // This is a count, not scaled
  avg_order_value: ScaledInt;
  total_discounts: ScaledInt;
  taxes_collected: ScaledInt;
  unique_items: number; // This is a count, not scaled
  total_quantity: ScaledInt;
}

/**
 * Converted metrics with display-ready values
 */
export interface DashboardMetrics {
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
  total_discounts: number;
  taxes_collected: number;
  unique_items: number;
  total_quantity: number;
}

/**
 * Raw API response for hourly revenue
 */
export interface HourlyRevenueRaw {
  hour: number;
  revenue: ScaledInt;
  orders: number; // Count, not scaled
  avg_order_value: ScaledInt;
  total_items: ScaledInt;
}

/**
 * Converted hourly revenue with display values
 */
export interface HourlyRevenue {
  hour: number;
  revenue: number;
  orders: number;
  avg_order_value: number;
  total_items: number;
}

/**
 * Raw API response for payment breakdown
 */
export interface PaymentBreakdownRaw {
  tender_id: string;
  total_amount: ScaledInt;
  avg_amount: ScaledInt;
  transaction_count: number; // Count, not scaled
}

/**
 * Converted payment breakdown with display values
 */
export interface PaymentBreakdown {
  tender_id: string;
  total_amount: number;
  avg_amount: number;
  transaction_count: number;
}

/**
 * Raw API response for weekly revenue
 */
export interface WeeklyRevenueRaw {
  day_of_week: number;
  day_name: string;
  revenue: ScaledInt;
  orders: number; // Count, not scaled
  avg_order_value: ScaledInt;
  total_items: ScaledInt;
}

/**
 * Converted weekly revenue with display values
 */
export interface WeeklyRevenue {
  day_of_week: number;
  day_name: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
  total_items: number;
}

/**
 * Raw API response (before conversion)
 */
export interface DashboardMetricsResponseRaw {
  metrics: DashboardMetricsRaw;
  hourly_revenue: HourlyRevenueRaw[];
  weekly_revenue: WeeklyRevenueRaw[];
  payment_breakdown: PaymentBreakdownRaw[];
}

/**
 * Converted response with display-ready values
 */
export interface DashboardMetricsResponse {
  metrics: DashboardMetrics;
  hourly_revenue: HourlyRevenue[];
  weekly_revenue: WeeklyRevenue[];
  payment_breakdown: PaymentBreakdown[];
}

/**
 * Convert raw API response to display values
 */
function convertDashboardMetricsResponse(raw: DashboardMetricsResponseRaw): DashboardMetricsResponse {
  return {
    metrics: {
      total_sales: fromScaledInt(raw.metrics.total_sales),
      total_orders: raw.metrics.total_orders,
      avg_order_value: fromScaledInt(raw.metrics.avg_order_value),
      total_discounts: fromScaledInt(raw.metrics.total_discounts),
      taxes_collected: fromScaledInt(raw.metrics.taxes_collected),
      unique_items: raw.metrics.unique_items,
      total_quantity: fromScaledInt(raw.metrics.total_quantity),
    },
    hourly_revenue: raw.hourly_revenue.map(hour => ({
      hour: hour.hour,
      revenue: fromScaledInt(hour.revenue),
      orders: hour.orders,
      avg_order_value: fromScaledInt(hour.avg_order_value),
      total_items: fromScaledInt(hour.total_items),
    })),
    weekly_revenue: raw.weekly_revenue.map(day => ({
      day_of_week: day.day_of_week,
      day_name: day.day_name,
      revenue: fromScaledInt(day.revenue),
      orders: day.orders,
      avg_order_value: fromScaledInt(day.avg_order_value),
      total_items: fromScaledInt(day.total_items),
    })),
    payment_breakdown: raw.payment_breakdown.map(payment => ({
      tender_id: payment.tender_id,
      total_amount: fromScaledInt(payment.total_amount),
      avg_amount: fromScaledInt(payment.avg_amount),
      transaction_count: payment.transaction_count,
    })),
  };
}

export interface DashboardMetricsFilters {
  storeId: string;
  startDate: string;
  endDate: string;
  timezone?: string;
}

export interface CustomDateRange {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
}

export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

class DashboardMetricsService {
  /**
   * Get current store ID from tenant store
   */
  private getCurrentStoreId(): string {
    try {
      const { currentStore } = useTenantStore.getState();
      return currentStore?.store_id || '400709'; // Fallback to default store ID
    } catch (error) {
      console.warn('Could not access tenant store, using default store ID:', error);
      return '400709'; // Default store ID from your example
    }
  }

  /**
   * Get current timezone dynamically
   */
  private getCurrentTimezone(): string {
    try {
      // Try to get timezone from tenant store
      const { currentStore } = useTenantStore.getState();

      if (currentStore?.timezone) {
        return currentStore.timezone;
      }

      // Fallback to browser timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = new Date().getTimezoneOffset();
      const sign = offset > 0 ? '-' : '+';
      const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
      const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');

      console.log(`🌍 Using browser timezone: ${userTimezone} (${sign}${hours}:${minutes})`);
      return `${sign}${hours}:${minutes}`;
    } catch (error) {
      console.warn('Could not determine timezone, using default:', error);
      return '+05:30'; // Default fallback
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
      const response = await apiClient.get<DashboardMetricsResponseRaw>(endpoint);

      console.log('✅ Dashboard Metrics API Response (raw):', response.data);
      
      // Convert ScaledInt values to display values
      const convertedData = convertDashboardMetricsResponse(response.data);
      console.log('✅ Dashboard Metrics (converted for display):', convertedData);
      
      return convertedData;
    } catch (error) {
      console.error('❌ Error fetching dashboard metrics:', error);
      // Don't fallback to mock data - let the error propagate
      throw error;
    }
  }

  /**
   * Get date range for a given time period
   */
  getDateRangeForPeriod(
    period: TimePeriod,
    timezone?: string,
    customDateRange?: CustomDateRange
  ): DashboardMetricsFilters {
    const now = new Date();
    const storeId = this.getCurrentStoreId();
    const currentTimezone = timezone || this.getCurrentTimezone();

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'week':
        // Get start of current week (Monday)
        startDate = new Date(now);
        const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
        startDate.setDate(startDate.getDate() - daysFromMonday);
        startDate.setHours(0, 0, 0, 0);

        // End of current week (Sunday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Add 6 days to get to Sunday
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'month':
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);

        // End of current month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Day 0 of next month = last day of current month
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'quarter':
        // Start of current quarter
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        startDate.setHours(0, 0, 0, 0);

        // End of current quarter
        endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0); // Last day of quarter
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'year':
        // Start of current year
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);

        // End of current year
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'custom':
        if (!customDateRange) {
          throw new Error('Custom date range is required when period is "custom"');
        }

        // Parse custom start date
        const [startYear, startMonth, startDay] = customDateRange.startDate.split('-').map(Number);
        startDate = new Date(startYear, startMonth - 1, startDay);
        startDate.setHours(0, 0, 0, 0);

        // Parse custom end date
        const [endYear, endMonth, endDay] = customDateRange.endDate.split('-').map(Number);
        endDate = new Date(endYear, endMonth - 1, endDay);
        endDate.setHours(23, 59, 59, 999);

        // Validate custom date range
        if (startDate > endDate) {
          throw new Error('Custom start date cannot be after end date');
        }

        console.log('📅 Custom date range:', {
          provided: customDateRange,
          parsed: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        });
        break;

      default:
        // Default to current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const result = {
      storeId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      timezone: currentTimezone
    };

    console.log(`📅 Date range for ${period}:`, {
      period,
      startDate: result.startDate,
      endDate: result.endDate,
      timezone: currentTimezone,
      debug: {
        now: now.toISOString(),
        startDateObj: startDate.toISOString(),
        endDateObj: endDate.toISOString()
      }
    });

    return result;
  }

  /**
   * Get dashboard metrics for a specific time period
   */
  async getDashboardMetricsForPeriod(
    period: TimePeriod,
    timezone?: string,
    customDateRange?: CustomDateRange
  ): Promise<DashboardMetricsResponse> {
    const filters = this.getDateRangeForPeriod(period, timezone, customDateRange);
    return this.getDashboardMetrics(filters);
  }

  /**
   * Get dashboard metrics for a custom date range
   */
  async getDashboardMetricsForCustomRange(
    startDate: string,
    endDate: string,
    timezone?: string
  ): Promise<DashboardMetricsResponse> {
    const customDateRange: CustomDateRange = { startDate, endDate };
    return this.getDashboardMetricsForPeriod('custom', timezone, customDateRange);
  }
}

export const dashboardMetricsService = new DashboardMetricsService();
