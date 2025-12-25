import { apiClient } from '../api';
import type { DashboardKPIResponse } from '../../types/dashboard-kpi';

export interface DashboardKPIFilters {
  storeId?: string;
  startDate?: string;
  endDate?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  compareWith?: 'previous_period' | 'previous_year';
}

class DashboardKPIService {
  private baseUrl = '/dashboard/kpis';

  /**
   * Fetch comprehensive dashboard KPIs
   */
  async getDashboardKPIs(filters: DashboardKPIFilters = {}): Promise<DashboardKPIResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.storeId) params.append('store_id', filters.storeId);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.period) params.append('period', filters.period);
      if (filters.compareWith) params.append('compare_with', filters.compareWith);

      const response = await apiClient.get<DashboardKPIResponse>(
        `${this.baseUrl}?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      // Don't fallback to mock data - let the error propagate
      throw error;
    }
  }

  /**
   * Get real-time dashboard updates (for live metrics)
   */
  async getRealTimeUpdates(storeId?: string): Promise<Partial<DashboardKPIResponse>> {
    try {
      const params = storeId ? `?store_id=${storeId}` : '';
      const response = await apiClient.get<Partial<DashboardKPIResponse>>(
        `${this.baseUrl}/realtime${params}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time updates:', error);
      return {};
    }
  }

  /**
   * Get KPI alerts and notifications
   */
  async getKPIAlerts(storeId?: string): Promise<any[]> {
    try {
      const params = storeId ? `?store_id=${storeId}` : '';
      const response = await apiClient.get<any[]>(
        `${this.baseUrl}/alerts${params}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching KPI alerts:', error);
      return [];
    }
  }

}

export const dashboardKPIService = new DashboardKPIService();