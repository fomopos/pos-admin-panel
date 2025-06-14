// Dashboard KPI Types - Comprehensive POS System Analytics
export interface DashboardKPIResponse {
  tenant_id: string;
  store_id: string;
  generated_at: string;
  date_range: {
    start_date: string;
    end_date: string;
    period_type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  };
  
  // 📊 Sales & Revenue Statistics
  sales_revenue: {
    total_sales: {
      gross_sales: number;
      net_sales: number;
      currency: string;
    };
    sales_by_category: Array<{
      category_id: string;
      category_name: string;
      total_amount: number;
      transaction_count: number;
      percentage_of_total: number;
    }>;
    sales_by_item: Array<{
      item_id: string;
      item_name: string;
      quantity_sold: number;
      total_revenue: number;
      avg_price: number;
      profit_margin: number;
    }>;
    sales_by_payment_type: Array<{
      payment_type: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer' | 'other';
      transaction_count: number;
      total_amount: number;
      percentage_of_total: number;
    }>;
    average_order_value: {
      current_period: number;
      previous_period: number;
      growth_percentage: number;
    };
    total_discounts_given: {
      amount: number;
      percentage_of_gross_sales: number;
      discount_count: number;
    };
    taxes_collected: {
      vat_gst: number;
      service_tax: number;
      other_taxes: number;
      total_tax: number;
    };
    refunds_voids_cancellations: {
      refunds: { count: number; amount: number };
      voids: { count: number; amount: number };
      cancellations: { count: number; amount: number };
    };
    revenue_by_time_period: Array<{
      period: string; // ISO date string
      daily_revenue: number;
      weekly_revenue?: number;
      monthly_revenue?: number;
      transaction_count: number;
    }>;
  };

  // ⏱️ Operational Statistics
  operational_stats: {
    orders_per_hour: Array<{
      hour: number; // 0-23
      order_count: number;
      average_wait_time: number; // minutes
    }>;
    orders_per_day: Array<{
      date: string;
      order_count: number;
      peak_hour: number;
    }>;
    order_preparation_time: {
      average_minutes: number;
      minimum_minutes: number;
      maximum_minutes: number;
    };
    table_turnover_rate: {
      average_turnover_minutes: number;
      tables_served: number;
      peak_turnover_time: string;
    };
    wait_time_queue: {
      average_wait_minutes: number;
      current_queue_length: number;
      max_queue_today: number;
    };
    peak_hours: Array<{
      hour_range: string; // "12:00-13:00"
      order_volume: number;
      revenue: number;
    }>;
    order_channels: {
      online_orders: { count: number; percentage: number };
      dine_in_orders: { count: number; percentage: number };
      takeaway_orders: { count: number; percentage: number };
      delivery_orders: { count: number; percentage: number };
    };
    delivery_performance: {
      average_delivery_time: number; // minutes
      on_time_delivery_rate: number; // percentage
      delayed_orders: number;
    };
  };

  // 👨‍🍳 Employee Performance Statistics
  employee_performance: {
    sales_by_staff: Array<{
      staff_id: string;
      staff_name: string;
      total_sales: number;
      transaction_count: number;
      hours_worked: number;
      sales_per_hour: number;
    }>;
    tips_collected: Array<{
      staff_id: string;
      staff_name: string;
      tips_amount: number;
      tips_percentage_of_sales: number;
    }>;
    average_service_time: Array<{
      staff_id: string;
      staff_name: string;
      avg_service_time_minutes: number;
      tables_served: number;
    }>;
    upselling_success: Array<{
      staff_id: string;
      staff_name: string;
      upsell_attempts: number;
      successful_upsells: number;
      success_rate: number;
      additional_revenue: number;
    }>;
    attendance_shifts: Array<{
      staff_id: string;
      staff_name: string;
      scheduled_hours: number;
      actual_hours: number;
      attendance_rate: number;
      shift_punctuality: number; // percentage on time
    }>;
  };

  // 🍽️ Inventory & Wastage Statistics
  inventory_wastage: {
    stock_levels: Array<{
      item_id: string;
      item_name: string;
      current_stock: number;
      unit: string;
      reorder_level: number;
      status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
    }>;
    ingredient_usage: Array<{
      ingredient_id: string;
      ingredient_name: string;
      usage_rate_per_day: number;
      unit: string;
      cost_per_unit: number;
    }>;
    stock_alerts: {
      low_stock_items: number;
      overstock_items: number;
      out_of_stock_items: number;
      expiring_soon: number; // items expiring in next 3 days
    };
    food_wastage: {
      daily_wastage_amount: number; // in kg or units
      wastage_cost: number;
      spoilage_percentage: number;
      main_wastage_reasons: Array<{
        reason: string;
        percentage: number;
      }>;
    };
    daily_consumption: Array<{
      recipe_id: string;
      recipe_name: string;
      portions_made: number;
      ingredient_consumption: Array<{
        ingredient_id: string;
        quantity_used: number;
        unit: string;
      }>;
    }>;
    variance_analysis: {
      expected_vs_actual: Array<{
        item_id: string;
        expected_usage: number;
        actual_usage: number;
        variance_percentage: number;
        cost_impact: number;
      }>;
    };
  };

  // 🧾 Customer & Loyalty Statistics
  customer_loyalty: {
    unique_customers_served: {
      total_today: number;
      total_this_week: number;
      total_this_month: number;
      new_customers: number;
    };
    repeat_customers: {
      rate_percentage: number;
      frequency_distribution: Array<{
        visit_frequency: string; // "1-2 times", "3-5 times", etc.
        customer_count: number;
      }>;
    };
    customer_feedback: {
      average_rating: number; // 1-5 scale
      total_reviews: number;
      rating_distribution: Array<{
        stars: number;
        count: number;
        percentage: number;
      }>;
    };
    loyalty_program: {
      points_issued: number;
      points_redeemed: number;
      active_members: number;
      redemption_rate: number;
    };
    top_customers: Array<{
      customer_id: string;
      customer_name: string;
      total_spend: number;
      visit_count: number;
      last_visit: string;
      loyalty_tier: string;
    }>;
  };

  // 💻 Device / Terminal Statistics
  device_terminal_stats: {
    sales_per_terminal: Array<{
      terminal_id: string;
      terminal_name: string;
      location: string;
      total_sales: number;
      transaction_count: number;
      uptime_percentage: number;
    }>;
    system_logs: {
      total_errors: number;
      crashes: number;
      downtime_minutes: number;
      offline_sales_count: number;
    };
    terminal_reconciliation: Array<{
      terminal_id: string;
      date: string;
      cash_expected: number;
      cash_actual: number;
      variance: number;
      reconciled_by: string;
    }>;
  };

  // 🏪 Store-Level Performance (for Chains)
  store_performance?: {
    store_comparison: Array<{
      store_id: string;
      store_name: string;
      location: string;
      total_sales: number;
      transaction_count: number;
      staff_count: number;
      profit_margin: number;
    }>;
    staff_efficiency_by_location: Array<{
      store_id: string;
      avg_service_time: number;
      customer_satisfaction: number;
      staff_productivity_score: number;
    }>;
    inventory_transfers: Array<{
      from_store_id: string;
      to_store_id: string;
      item_count: number;
      transfer_value: number;
      date: string;
    }>;
  };

  // 📈 Financial & Business KPIs
  financial_kpis: {
    profit_margins: {
      gross_profit_margin: number;
      net_profit_margin: number;
      profit_by_category: Array<{
        category: string;
        margin_percentage: number;
      }>;
    };
    cost_of_goods_sold: {
      total_cogs: number;
      cogs_percentage: number;
      by_category: Array<{
        category: string;
        cogs_amount: number;
      }>;
    };
    cash_flow: {
      daily_cash_inflow: number;
      daily_cash_outflow: number;
      net_cash_flow: number;
      cash_on_hand: number;
    };
    break_even_analysis: {
      break_even_point: number; // daily sales needed
      current_position: number; // percentage of break-even achieved
      projected_break_even_date: string;
    };
    revenue_vs_target: {
      daily_target: number;
      daily_actual: number;
      monthly_target: number;
      monthly_actual: number;
      achievement_percentage: number;
    };
    growth_metrics: {
      year_over_year: {
        revenue_growth: number;
        customer_growth: number;
        order_volume_growth: number;
      };
      month_over_month: {
        revenue_growth: number;
        customer_growth: number;
        order_volume_growth: number;
      };
    };
  };

  // 📊 Real-time Dashboard Metrics
  real_time_metrics: {
    current_active_orders: number;
    pending_payments: number;
    staff_on_duty: number;
    tables_occupied: number;
    kitchen_queue_length: number;
    last_updated: string;
  };

  // 🔔 Alerts & Notifications
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    category: 'inventory' | 'staff' | 'financial' | 'operational' | 'system';
    message: string;
    priority: 'high' | 'medium' | 'low';
    created_at: string;
    is_resolved: boolean;
  }>;
}