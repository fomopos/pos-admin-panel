import { apiClient } from '../api';
import type { DashboardKPIResponse } from '../../types/dashboard-kpi';

export interface DashboardKPIFilters {
  storeId?: string;
  startDate?: string;
  endDate?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
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
      // Return mock data for development
      return this.getMockKPIData();
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

  /**
   * Mock data for development and fallback
   */
  private getMockKPIData(): DashboardKPIResponse {
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    return {
      tenant_id: "tenant_001",
      store_id: "store_001",
      generated_at: now.toISOString(),
      date_range: {
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
        period_type: "monthly"
      },
      sales_revenue: {
        total_sales: {
          gross_sales: 82373.21,
          net_sales: 78127.54,
          currency: "USD"
        },
        sales_by_category: [
          {
            category_id: "cat_001",
            category_name: "Food & Beverages",
            total_amount: 45678.90,
            transaction_count: 234,
            percentage_of_total: 55.4
          },
          {
            category_id: "cat_002", 
            category_name: "Electronics",
            total_amount: 23456.78,
            transaction_count: 156,
            percentage_of_total: 28.5
          }
        ],
        sales_by_item: [
          {
            item_id: "item_001",
            item_name: "Coffee",
            quantity_sold: 450,
            total_revenue: 2250.00,
            avg_price: 5.00,
            profit_margin: 65.2
          }
        ],
        sales_by_payment_type: [
          {
            payment_type: "card",
            transaction_count: 234,
            total_amount: 49423.92,
            percentage_of_total: 60.0
          },
          {
            payment_type: "cash",
            transaction_count: 156,
            total_amount: 24686.96,
            percentage_of_total: 30.0
          },
          {
            payment_type: "wallet",
            transaction_count: 89,
            total_amount: 8262.33,
            percentage_of_total: 10.0
          }
        ],
        average_order_value: {
          current_period: 47.85,
          previous_period: 45.23,
          growth_percentage: 5.8
        },
        total_discounts_given: {
          amount: 3245.67,
          percentage_of_gross_sales: 3.9,
          discount_count: 89
        },
        taxes_collected: {
          vat_gst: 5891.86,
          service_tax: 698.00,
          other_taxes: 0,
          total_tax: 6589.86
        },
        refunds_voids_cancellations: {
          refunds: { count: 28, amount: 1234.56 },
          voids: { count: 12, amount: 456.78 },
          cancellations: { count: 5, amount: 234.12 }
        },
        revenue_by_time_period: [
          {
            period: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            daily_revenue: 2145.32,
            transaction_count: 52
          },
          {
            period: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            daily_revenue: 2583.67,
            transaction_count: 61
          },
          {
            period: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            daily_revenue: 3021.45,
            transaction_count: 73
          },
          {
            period: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            daily_revenue: 2789.23,
            transaction_count: 68
          },
          {
            period: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            daily_revenue: 3156.89,
            transaction_count: 79
          },
          {
            period: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            daily_revenue: 2934.56,
            transaction_count: 71
          },
          {
            period: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            daily_revenue: 2746.44,
            transaction_count: 67
          }
        ]
      },
      operational_stats: {
        orders_per_hour: [
          { hour: 9, order_count: 15, average_wait_time: 3.2 },
          { hour: 10, order_count: 23, average_wait_time: 4.1 },
          { hour: 11, order_count: 35, average_wait_time: 6.8 },
          { hour: 12, order_count: 45, average_wait_time: 8.5 },
          { hour: 13, order_count: 38, average_wait_time: 7.2 },
          { hour: 14, order_count: 28, average_wait_time: 5.5 },
          { hour: 15, order_count: 32, average_wait_time: 6.1 },
          { hour: 16, order_count: 25, average_wait_time: 4.8 },
          { hour: 17, order_count: 42, average_wait_time: 9.3 },
          { hour: 18, order_count: 52, average_wait_time: 12.3 },
          { hour: 19, order_count: 48, average_wait_time: 10.2 },
          { hour: 20, order_count: 35, average_wait_time: 7.8 },
          { hour: 21, order_count: 22, average_wait_time: 5.1 },
          { hour: 22, order_count: 12, average_wait_time: 3.5 }
        ],
        orders_per_day: [
          {
            date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_count: 142,
            peak_hour: 18
          },
          {
            date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_count: 158,
            peak_hour: 19
          },
          {
            date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_count: 134,
            peak_hour: 12
          },
          {
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_count: 167,
            peak_hour: 18
          },
          {
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_count: 145,
            peak_hour: 19
          },
          {
            date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_count: 152,
            peak_hour: 18
          },
          {
            date: new Date().toISOString().split('T')[0],
            order_count: 156,
            peak_hour: 18
          }
        ],
        order_preparation_time: {
          average_minutes: 8.5,
          minimum_minutes: 3.2,
          maximum_minutes: 25.8
        },
        table_turnover_rate: {
          average_turnover_minutes: 45.2,
          tables_served: 28,
          peak_turnover_time: "19:00"
        },
        wait_time_queue: {
          average_wait_minutes: 4.2,
          current_queue_length: 3,
          max_queue_today: 12
        },
        peak_hours: [
          { hour_range: "12:00-13:00", order_volume: 45, revenue: 2156.78 },
          { hour_range: "18:00-19:00", order_volume: 52, revenue: 2489.34 },
          { hour_range: "19:00-20:00", order_volume: 48, revenue: 2298.56 }
        ],
        order_channels: {
          online_orders: { count: 234, percentage: 45.2 },
          dine_in_orders: { count: 178, percentage: 34.3 },
          takeaway_orders: { count: 89, percentage: 17.2 },
          delivery_orders: { count: 17, percentage: 3.3 }
        },
        delivery_performance: {
          average_delivery_time: 28.5,
          on_time_delivery_rate: 89.2,
          delayed_orders: 3
        }
      },
      employee_performance: {
        sales_by_staff: [
          {
            staff_id: "EMP001",
            staff_name: "John Doe", 
            total_sales: 12456.78,
            transaction_count: 89,
            hours_worked: 40,
            sales_per_hour: 311.42
          },
          {
            staff_id: "EMP002",
            staff_name: "Jane Smith",
            total_sales: 10234.56,
            transaction_count: 76,
            hours_worked: 38,
            sales_per_hour: 269.33
          }
        ],
        tips_collected: [
          {
            staff_id: "EMP001",
            staff_name: "John Doe",
            tips_amount: 456.78,
            tips_percentage_of_sales: 3.7
          }
        ],
        average_service_time: [
          {
            staff_id: "EMP001",
            staff_name: "John Doe",
            avg_service_time_minutes: 6.8,
            tables_served: 45
          }
        ],
        upselling_success: [
          {
            staff_id: "EMP001",
            staff_name: "John Doe",
            upsell_attempts: 67,
            successful_upsells: 23,
            success_rate: 34.3,
            additional_revenue: 789.45
          }
        ],
        attendance_shifts: [
          {
            staff_id: "EMP001",
            staff_name: "John Doe",
            scheduled_hours: 40,
            actual_hours: 38.5,
            attendance_rate: 96.3,
            shift_punctuality: 89.2
          }
        ]
      },
      inventory_wastage: {
        stock_levels: [
          {
            item_id: "item_001",
            item_name: "Tomatoes",
            current_stock: 25,
            unit: "kg",
            reorder_level: 20,
            status: "low_stock"
          },
          {
            item_id: "item_002",
            item_name: "Chicken Breast",
            current_stock: 15,
            unit: "kg", 
            reorder_level: 10,
            status: "in_stock"
          }
        ],
        ingredient_usage: [
          {
            ingredient_id: "ing_001",
            ingredient_name: "Flour",
            usage_rate_per_day: 12.5,
            unit: "kg",
            cost_per_unit: 2.50
          }
        ],
        stock_alerts: {
          low_stock_items: 2,
          out_of_stock_items: 0,
          overstock_items: 1,
          expiring_soon: 3
        },
        food_wastage: {
          daily_wastage_amount: 234.56,
          wastage_cost: 1642.00,
          spoilage_percentage: 2.8,
          main_wastage_reasons: [
            { reason: "Expired products", percentage: 45.2 },
            { reason: "Over ordering", percentage: 32.1 },
            { reason: "Storage issues", percentage: 22.7 }
          ]
        },
        daily_consumption: [
          {
            recipe_id: "recipe_003",
            recipe_name: "Bread",
            portions_made: 45,
            ingredient_consumption: [
              {
                ingredient_id: "ing_001",
                quantity_used: 25,
                unit: "kg"
              }
            ]
          }
        ],
        variance_analysis: {
          expected_vs_actual: [
            {
              item_id: "item_001",
              expected_usage: 500.00,
              actual_usage: 523.45,
              variance_percentage: 4.7,
              cost_impact: 23.45
            }
          ]
        }
      },
      customer_loyalty: {
        unique_customers_served: {
          total_today: 67,
          total_this_week: 423,
          total_this_month: 1245,
          new_customers: 89
        },
        repeat_customers: {
          rate_percentage: 35.8,
          frequency_distribution: [
            { visit_frequency: "1-2 times", customer_count: 234 },
            { visit_frequency: "3-5 times", customer_count: 156 },
            { visit_frequency: "6+ times", customer_count: 55 }
          ]
        },
        customer_feedback: {
          average_rating: 4.6,
          total_reviews: 156,
          rating_distribution: [
            { stars: 5, count: 89, percentage: 57.1 },
            { stars: 4, count: 45, percentage: 28.8 },
            { stars: 3, count: 15, percentage: 9.6 },
            { stars: 2, count: 5, percentage: 3.2 },
            { stars: 1, count: 2, percentage: 1.3 }
          ]
        },
        loyalty_program: {
          points_issued: 18670,
          points_redeemed: 12450,
          active_members: 789,
          redemption_rate: 66.7
        },
        top_customers: [
          {
            customer_id: "cust_001",
            customer_name: "John Smith",
            total_spend: 2456.78,
            visit_count: 23,
            last_visit: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            loyalty_tier: "Gold"
          }
        ]
      },
      device_terminal_stats: {
        sales_per_terminal: [
          {
            terminal_id: "POS001",
            terminal_name: "Counter 1",
            location: "Main Floor",
            total_sales: 45678.90,
            transaction_count: 234,
            uptime_percentage: 99.2
          },
          {
            terminal_id: "POS002",
            terminal_name: "Counter 2", 
            location: "Second Floor",
            total_sales: 36694.31,
            transaction_count: 189,
            uptime_percentage: 98.7
          }
        ],
        system_logs: {
          total_errors: 5,
          crashes: 0,
          downtime_minutes: 23,
          offline_sales_count: 2
        },
        terminal_reconciliation: [
          {
            terminal_id: "POS001",
            date: now.toISOString().split('T')[0],
            cash_expected: 45678.90,
            cash_actual: 45678.90,
            variance: 0.00,
            reconciled_by: "manager_001"
          }
        ]
      },
      store_performance: {
        store_comparison: [
          {
            store_id: "store_001",
            store_name: "Main Branch",
            location: "Downtown",
            total_sales: 82373.21,
            transaction_count: 423,
            staff_count: 15,
            profit_margin: 23.8
          },
          {
            store_id: "store_002",
            store_name: "Secondary Branch",
            location: "Mall",
            total_sales: 76234.56,
            transaction_count: 389,
            staff_count: 12,
            profit_margin: 21.4
          }
        ],
        staff_efficiency_by_location: [
          {
            store_id: "store_001",
            avg_service_time: 6.8,
            customer_satisfaction: 87.5,
            staff_productivity_score: 92.3
          }
        ],
        inventory_transfers: [
          {
            from_store_id: "store_001",
            to_store_id: "store_002",
            item_count: 15,
            transfer_value: 1234.56,
            date: now.toISOString()
          }
        ]
      },
      financial_kpis: {
        profit_margins: {
          gross_profit_margin: 65.2,
          net_profit_margin: 23.8,
          profit_by_category: [
            { category: "Food", margin_percentage: 67.3 },
            { category: "Beverages", margin_percentage: 78.9 }
          ]
        },
        cost_of_goods_sold: {
          total_cogs: 45234.67,
          cogs_percentage: 54.9,
          by_category: [
            { category: "Food", cogs_amount: 28456.78 },
            { category: "Beverages", cogs_amount: 16777.89 }
          ]
        },
        cash_flow: {
          daily_cash_inflow: 3746.44,
          daily_cash_outflow: 1000.00,
          net_cash_flow: 2746.44,
          cash_on_hand: 15678.90
        },
        break_even_analysis: {
          break_even_point: 1250.00,
          current_position: 219.6,
          projected_break_even_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        revenue_vs_target: {
          daily_target: 2750.00,
          daily_actual: 2746.44,
          monthly_target: 82500.00,
          monthly_actual: 82373.21,
          achievement_percentage: 99.8
        },
        growth_metrics: {
          year_over_year: {
            revenue_growth: 12.7,
            customer_growth: 15.6,
            order_volume_growth: 8.9
          },
          month_over_month: {
            revenue_growth: 3.4,
            customer_growth: 2.1,
            order_volume_growth: 1.8
          }
        }
      },
      real_time_metrics: {
        current_active_orders: 8,
        pending_payments: 2,
        staff_on_duty: 12,
        tables_occupied: 15,
        kitchen_queue_length: 4,
        last_updated: now.toISOString()
      },
      alerts: [
        {
          id: "alert_001",
          type: "warning",
          category: "inventory",
          message: "Onions inventory is below minimum threshold",
          priority: "high",
          created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          is_resolved: false
        },
        {
          id: "alert_002",
          type: "info",
          category: "financial",
          message: "Monthly sales target achieved 3 days early!",
          priority: "medium",
          created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          is_resolved: false
        }
      ]
    };
  }
}

export const dashboardKPIService = new DashboardKPIService();