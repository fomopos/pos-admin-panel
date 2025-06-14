import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, PageHeader } from '../components/ui';
import KPICard from '../components/ui/KPICard';
import { dashboardKPIService } from '../services/dashboard/dashboardKPIService';
import type { DashboardKPIResponse } from '../types/dashboard-kpi';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ClockIcon,
  CubeIcon,
  StarIcon,
  ComputerDesktopIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface DashboardKPIFilters {
  storeId?: string;
  startDate?: string;
  endDate?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  compareWith?: 'previous_period' | 'previous_year';
}

const ModernDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [kpiData, setKpiData] = useState<DashboardKPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch KPI data
  const fetchKPIData = async (period?: typeof selectedPeriod) => {
    try {
      setLoading(true);
      const filters: DashboardKPIFilters = {
        period: period || selectedPeriod,
      };
      const data = await dashboardKPIService.getDashboardKPIs(filters);
      setKpiData(data);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKPIData();
    setRefreshing(false);
  };

  // Handle period change
  const handlePeriodChange = async (period: typeof selectedPeriod) => {
    setSelectedPeriod(period);
    await fetchKPIData(period);
  };

  useEffect(() => {
    fetchKPIData();
  }, []);

  // Calculate trend from revenue growth
  const getRevenueGrowth = () => {
    if (!kpiData) return { value: 0, trend: 'neutral' as const };
    const growth = kpiData.financial_kpis.growth_metrics.month_over_month.revenue_growth;
    return {
      value: growth,
      trend: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'neutral' as const,
    };
  };

  const getOrderGrowth = () => {
    if (!kpiData) return { value: 0, trend: 'neutral' as const };
    const growth = kpiData.financial_kpis.growth_metrics.month_over_month.order_volume_growth;
    return {
      value: growth,
      trend: growth > 0 ? 'up' as const : 'down' as const,
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t('dashboard.title')}
        description="Comprehensive overview of your POS system performance and key metrics"
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value as typeof selectedPeriod)}
            className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </PageHeader>

      {/* Alerts Section */}
      {kpiData?.alerts && kpiData.alerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center mb-3">
            <BellIcon className="w-5 h-5 text-amber-600 mr-2" />
            <h3 className="text-sm font-semibold text-amber-800">Active Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kpiData.alerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-amber-100">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Sales"
          value={kpiData?.sales_revenue.total_sales.gross_sales || 0}
          format="currency"
          change={getRevenueGrowth().value}
          trend={getRevenueGrowth().trend}
          icon={CurrencyDollarIcon}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          loading={loading}
        />
        <KPICard
          title="Total Orders"
          value={kpiData?.operational_stats.orders_per_day[0]?.order_count || 0}
          change={getOrderGrowth().value}
          trend={getOrderGrowth().trend}
          icon={ShoppingCartIcon}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          loading={loading}
        />
        <KPICard
          title="Average Order Value"
          value={kpiData?.sales_revenue.average_order_value.current_period || 0}
          format="currency"
          change={kpiData?.sales_revenue.average_order_value.growth_percentage || 0}
          trend={kpiData && kpiData.sales_revenue.average_order_value.growth_percentage > 0 ? 'up' : 'down'}
          icon={ChartBarIcon}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          loading={loading}
        />
        <KPICard
          title="Customer Satisfaction"
          value={kpiData?.customer_loyalty.customer_feedback.average_rating || 0}
          format="rating"
          subtitle={`${kpiData?.customer_loyalty.customer_feedback.total_reviews || 0} reviews`}
          icon={StarIcon}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          loading={loading}
        />
      </div>

      {/* Sales & Revenue Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">📊 Sales & Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title="Net Sales"
            value={kpiData?.sales_revenue.total_sales.net_sales || 0}
            format="currency"
            subtitle="After discounts & taxes"
            icon={CurrencyDollarIcon}
            loading={loading}
          />
          <KPICard
            title="Total Discounts"
            value={kpiData?.sales_revenue.total_discounts_given.amount || 0}
            format="currency"
            subtitle={`${kpiData?.sales_revenue.total_discounts_given.percentage_of_gross_sales.toFixed(1) || 0}% of gross sales`}
            icon={CurrencyDollarIcon}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            loading={loading}
          />
          <KPICard
            title="Taxes Collected"
            value={kpiData?.sales_revenue.taxes_collected.total_tax || 0}
            format="currency"
            subtitle="VAT/GST + Service Tax"
            icon={CurrencyDollarIcon}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            loading={loading}
          />
        </div>
      </div>

      {/* Operational Stats Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">⏱️ Operational Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Avg Preparation Time"
            value={kpiData?.operational_stats.order_preparation_time.average_minutes || 0}
            format="time"
            subtitle={`Range: ${kpiData?.operational_stats.order_preparation_time.minimum_minutes || 0}-${kpiData?.operational_stats.order_preparation_time.maximum_minutes || 0} min`}
            icon={ClockIcon}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            loading={loading}
          />
          <KPICard
            title="Queue Length"
            value={kpiData?.operational_stats.wait_time_queue.current_queue_length || 0}
            subtitle={`Max today: ${kpiData?.operational_stats.wait_time_queue.max_queue_today || 0}`}
            icon={UserGroupIcon}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            loading={loading}
            alert={kpiData && kpiData.operational_stats.wait_time_queue.current_queue_length > 5 ? 'warning' : undefined}
          />
          <KPICard
            title="Table Turnover"
            value={kpiData?.operational_stats.table_turnover_rate.average_turnover_minutes || 0}
            format="time"
            subtitle={`${kpiData?.operational_stats.table_turnover_rate.tables_served || 0} tables served`}
            icon={BuildingStorefrontIcon}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            loading={loading}
          />
          <KPICard
            title="Delivery Performance"
            value={kpiData?.operational_stats.delivery_performance.on_time_delivery_rate || 0}
            format="percentage"
            subtitle={`Avg: ${kpiData?.operational_stats.delivery_performance.average_delivery_time || 0} min`}
            icon={ClockIcon}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            loading={loading}
          />
        </div>
      </div>

      {/* Employee Performance Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">👨‍🍳 Employee Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Staff */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Top Performing Staff</h3>
            <div className="space-y-4">
              {kpiData?.employee_performance.sales_by_staff.slice(0, 3).map((staff, index) => (
                <div key={staff.staff_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{staff.staff_name}</p>
                      <p className="text-sm text-slate-500">{staff.transaction_count} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${staff.total_sales.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">${staff.sales_per_hour.toFixed(0)}/hr</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upselling Performance */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Upselling Success</h3>
            <div className="space-y-4">
              {kpiData?.employee_performance.upselling_success.slice(0, 3).map((staff) => (
                <div key={staff.staff_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{staff.staff_name}</p>
                    <p className="text-sm text-slate-500">{staff.upsell_attempts} attempts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{staff.success_rate.toFixed(1)}%</p>
                    <p className="text-sm text-green-600">+${staff.additional_revenue.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory & Stock Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">🍽️ Inventory & Stock</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Low Stock Items"
            value={kpiData?.inventory_wastage.stock_alerts.low_stock_items || 0}
            subtitle="Need attention"
            icon={CubeIcon}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            alert={kpiData && kpiData.inventory_wastage.stock_alerts.low_stock_items > 0 ? 'warning' : 'success'}
            loading={loading}
          />
          <KPICard
            title="Out of Stock"
            value={kpiData?.inventory_wastage.stock_alerts.out_of_stock_items || 0}
            subtitle="Immediate action required"
            icon={ExclamationTriangleIcon}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            alert={kpiData && kpiData.inventory_wastage.stock_alerts.out_of_stock_items > 0 ? 'error' : 'success'}
            loading={loading}
          />
          <KPICard
            title="Daily Wastage"
            value={kpiData?.inventory_wastage.food_wastage.spoilage_percentage || 0}
            format="percentage"
            subtitle={`$${kpiData?.inventory_wastage.food_wastage.daily_wastage_amount.toFixed(0) || 0} value`}
            icon={CubeIcon}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            loading={loading}
          />
          <KPICard
            title="Items Expiring Soon"
            value={kpiData?.inventory_wastage.stock_alerts.expiring_soon || 0}
            subtitle="Items expiring soon"
            icon={ClockIcon}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
            alert={kpiData && kpiData.inventory_wastage.stock_alerts.expiring_soon > 3 ? 'warning' : undefined}
            loading={loading}
          />
        </div>
      </div>

      {/* Device/Terminal Stats Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">💻 Device & Terminal Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Terminal Performance */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Terminal Performance</h3>
            <div className="space-y-4">
              {kpiData?.device_terminal_stats.sales_per_terminal.map((terminal) => (
                <div key={terminal.terminal_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ComputerDesktopIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">{terminal.terminal_name}</p>
                      <p className="text-sm text-slate-500">{terminal.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${terminal.total_sales.toLocaleString()}</p>
                    <p className="text-sm text-green-600">{terminal.uptime_percentage}% uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Health */}
          <div className="grid grid-cols-1 gap-6">
            <KPICard
              title="System Uptime"
              value={99.2}
              format="percentage"
              subtitle={`${kpiData?.device_terminal_stats.system_logs.downtime_minutes || 0} min downtime`}
              icon={ComputerDesktopIcon}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              loading={loading}
            />
            <KPICard
              title="Transaction Errors"
              value={kpiData?.device_terminal_stats.system_logs.total_errors || 0}
              subtitle="System errors today"
              icon={ExclamationTriangleIcon}
              iconBg="bg-red-100"
              iconColor="text-red-600"
              alert={kpiData && kpiData.device_terminal_stats.system_logs.total_errors > 5 ? 'warning' : 'success'}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Financial Performance Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">📈 Financial Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title="Gross Profit Margin"
            value={kpiData?.financial_kpis.profit_margins.gross_profit_margin || 0}
            format="percentage"
            subtitle="Revenue - COGS"
            icon={ChartBarIcon}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            loading={loading}
          />
          <KPICard
            title="Net Profit Margin"
            value={kpiData?.financial_kpis.profit_margins.net_profit_margin || 0}
            format="percentage"
            subtitle="After all expenses"
            icon={ChartBarIcon}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            loading={loading}
          />
          <KPICard
            title="Daily Cash Flow"
            value={kpiData?.financial_kpis.cash_flow.net_cash_flow || 0}
            format="currency"
            change={kpiData?.financial_kpis.growth_metrics.month_over_month.revenue_growth || 0}
            trend={kpiData && kpiData.financial_kpis.growth_metrics.month_over_month.revenue_growth > 0 ? 'up' : 'down'}
            icon={CurrencyDollarIcon}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            loading={loading}
          />
        </div>
      </div>

      {/* Payment Methods Chart */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Payment Methods Distribution</h3>
        {kpiData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiData.sales_revenue.sales_by_payment_type.map((payment) => (
              <div key={payment.payment_type} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {payment.payment_type}
                  </span>
                  <span className="text-sm text-slate-500">
                    {payment.percentage_of_total.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${payment.percentage_of_total}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-600">{payment.transaction_count} orders</span>
                  <span className="font-semibold text-slate-900">${payment.total_amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Real-time Metrics */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Real-time Status</h3>
        {kpiData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{kpiData.real_time_metrics.current_active_orders}</p>
              <p className="text-sm text-slate-500">Active Orders</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{kpiData.real_time_metrics.staff_on_duty}</p>
              <p className="text-sm text-slate-500">Staff on Duty</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{kpiData.real_time_metrics.tables_occupied}</p>
              <p className="text-sm text-slate-500">Tables Occupied</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{kpiData.real_time_metrics.kitchen_queue_length}</p>
              <p className="text-sm text-slate-500">Kitchen Queue</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{kpiData.real_time_metrics.pending_payments}</p>
              <p className="text-sm text-slate-500">Pending Payments</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ModernDashboard;
