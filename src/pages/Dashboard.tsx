import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, PageHeader, VersionDisplay } from '../components/ui';
import KPICard from '../components/ui/KPICard';
import { dashboardMetricsService, type DashboardMetricsResponse, type TimePeriod, type CustomDateRange } from '../services/dashboard/dashboardMetricsService';
import { formattingService } from '../services/formatting';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [metricsData, setMetricsData] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>();
  const [refreshing, setRefreshing] = useState(false);
  const initialCallMade = useRef(false);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));

  console.log(`🏗️ [Dashboard] Component render - ID: ${componentId.current}`);

  // Add cleanup effect to track component unmounting
  useEffect(() => {
    console.log(`🏗️ [Dashboard] Component mounted - ID: ${componentId.current}`);
    return () => {
      console.log(`🗑️ [Dashboard] Component unmounting - ID: ${componentId.current}`);
    };
  }, []);

  // Helper function to format payment method names and get icons
  const getPaymentMethodInfo = (tenderId: string) => {
    const paymentMethods: { [key: string]: { name: string; icon: string; color: string } } = {
      'cash_usd': { name: 'Cash USD', icon: '💵', color: 'bg-green-100 text-green-600' },
      'cash': { name: 'Cash', icon: '💵', color: 'bg-green-100 text-green-600' },
      'card_visa': { name: 'Visa Card', icon: '💳', color: 'bg-blue-100 text-blue-600' },
      'card_mastercard': { name: 'Mastercard', icon: '💳', color: 'bg-red-100 text-red-600' },
      'digital_wallet': { name: 'Digital Wallet', icon: '📱', color: 'bg-purple-100 text-purple-600' },
      'credit_card': { name: 'Credit Card', icon: '💳', color: 'bg-blue-100 text-blue-600' },
      'debit_card': { name: 'Debit Card', icon: '💳', color: 'bg-orange-100 text-orange-600' },
      'online': { name: 'Online Payment', icon: '🌐', color: 'bg-indigo-100 text-indigo-600' }
    };
    
    return paymentMethods[tenderId] || { 
      name: tenderId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      icon: '💰', 
      color: 'bg-gray-100 text-gray-600' 
    };
  };

  // Fetch dashboard metrics from the API
  const fetchMetricsData = async (period?: TimePeriod, customRange?: CustomDateRange) => {
    const callId = Math.random().toString(36).substr(2, 9);
    try {
      setLoading(true);
      const currentPeriod = period || selectedPeriod;
      
      // Get caller info for debugging
      const stack = new Error().stack;
      const caller = stack?.split('\n')[2]?.trim() || 'unknown';
      
      console.log(`📊 [Dashboard] API Call #${callId} - Fetching dashboard metrics for period:`, currentPeriod);
      console.log(`📊 [Dashboard] API Call #${callId} - Called from:`, caller);
      console.log(`📊 [Dashboard] API Call #${callId} - Parameters:`, { period, customRange, selectedPeriod, customDateRange });
      
      const data = await dashboardMetricsService.getDashboardMetricsForPeriod(
        currentPeriod,
        undefined, // Auto-detect timezone
        customRange
      );
      console.log(`✅ [Dashboard] API Call #${callId} - Metrics data received:`, data);
      
      setMetricsData(data);
    } catch (error) {
      console.error(`❌ [Dashboard] API Call #${callId} - Error fetching metrics data:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    console.log(`🔄 [Dashboard] Component ID ${componentId.current} - Refresh button clicked`);
    setRefreshing(true);
    await fetchMetricsData();
    setRefreshing(false);
  };

  // Handle period change
  const handlePeriodChange = async (period: TimePeriod, customRange?: CustomDateRange) => {
    console.log(`📅 [Dashboard] Component ID ${componentId.current} - Period changed to:`, period, customRange);
    setSelectedPeriod(period);
    setCustomDateRange(customRange);
    await fetchMetricsData(period, customRange);
  };

  useEffect(() => {
    if (initialCallMade.current) {
      console.log(`⚠️ [Dashboard] Component ID ${componentId.current} - useEffect running again but initial call already made, skipping`);
      return;
    }
    
    console.log(`🚀 [Dashboard] Component ID ${componentId.current} - Initial data fetch starting`);
    console.log(`🚀 [Dashboard] Component ID ${componentId.current} - Current state:`, { selectedPeriod, customDateRange });
    initialCallMade.current = true;
    fetchMetricsData(selectedPeriod, customDateRange);
  }, []); // Only run on mount - selectedPeriod and customDateRange have initial values

  // Helper functions for metrics data

  const getRevenueGrowth = () => {
    // Mock growth calculation - in real app this would come from metrics API with previous period data
    const mockGrowth = 8.5; // Replace with actual calculation when API provides previous period data
    return {
      value: mockGrowth,
      trend: mockGrowth > 0 ? 'up' as const : mockGrowth < 0 ? 'down' as const : 'neutral' as const,
    };
  };

  const getOrderGrowth = () => {
    // Mock growth calculation - in real app this would come from metrics API with previous period data
    const mockGrowth = 12.3; // Replace with actual calculation when API provides previous period data
    return {
      value: mockGrowth,
      trend: mockGrowth > 0 ? 'up' as const : mockGrowth < 0 ? 'down' as const : 'neutral' as const,
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t('dashboard.title')}
        description={
          <div className="flex items-center space-x-2">
            <span>{t('dashboard.description')}</span>
            <span className="text-gray-400">•</span>
            <VersionDisplay style="subtle" size="sm" />
          </div>
        }
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('dashboard.refresh')}
          </button>
          <select
            value={selectedPeriod}
            onChange={(e) => {
              const period = e.target.value as TimePeriod;
              if (period === 'custom') {
                // Set default custom range (last 7 days)
                const today = new Date();
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const customRange: CustomDateRange = {
                  startDate: lastWeek.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                };
                handlePeriodChange(period, customRange);
              } else {
                handlePeriodChange(period);
              }
            }}
            className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <option value="today">{t('dashboard.periods.today')}</option>
            <option value="week">{t('dashboard.periods.thisWeek')}</option>
            <option value="month">{t('dashboard.periods.thisMonth')}</option>
            <option value="quarter">{t('dashboard.periods.thisQuarter')}</option>
            <option value="year">{t('dashboard.periods.thisYear')}</option>
            <option value="custom">{t('dashboard.periods.customRange')}</option>
          </select>
          
          {/* Custom Date Inputs - Show when custom is selected */}
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-2 ml-3">
              <input
                type="date"
                value={customDateRange?.startDate || ''}
                onChange={(e) => {
                  const newRange = {
                    startDate: e.target.value,
                    endDate: customDateRange?.endDate || e.target.value
                  };
                  setCustomDateRange(newRange);
                  handlePeriodChange('custom', newRange);
                }}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-slate-500">to</span>
              <input
                type="date"
                value={customDateRange?.endDate || ''}
                onChange={(e) => {
                  const newRange = {
                    startDate: customDateRange?.startDate || e.target.value,
                    endDate: e.target.value
                  };
                  setCustomDateRange(newRange);
                  handlePeriodChange('custom', newRange);
                }}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </PageHeader>

      {/* Primary KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={t('dashboard.kpi.totalSales')}
          value={metricsData?.metrics?.total_sales || 0}
          format="currency"
          change={getRevenueGrowth().value}
          trend={getRevenueGrowth().trend}
          icon={CurrencyDollarIcon}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          loading={loading}
        />
        <KPICard
          title={t('dashboard.kpi.totalOrders')}
          value={metricsData?.metrics?.total_orders || 0}
          change={getOrderGrowth().value}
          trend={getOrderGrowth().trend}
          icon={ShoppingCartIcon}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          loading={loading}
        />
        <KPICard
          title={t('dashboard.kpi.averageOrderValue')}
          value={metricsData?.metrics?.avg_order_value || 0}
          format="currency"
          change={0} // TODO: Calculate from previous period when API provides it
          trend="neutral"
          icon={ChartBarIcon}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          loading={loading}
        />
        <KPICard
          title={t('dashboard.kpi.customerSatisfaction')}
          value={4.2} // TODO: Add customer satisfaction to metrics API
          format="rating"
          subtitle="(Based on reviews)" // TODO: Get from metrics API when available
          icon={StarIcon}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          loading={loading}
        />
      </div>

      {/* Sales & Revenue Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">📊 {t('dashboard.sections.salesRevenue')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title="Net Sales"
            value={metricsData?.metrics?.total_sales || 0}
            format="currency"
            subtitle="After discounts & taxes"
            icon={CurrencyDollarIcon}
            loading={loading}
          />
          <KPICard
            title="Total Discounts"
            value={metricsData?.metrics?.total_discounts || 0}
            format="currency"
            subtitle="Discount amount applied"
            icon={CurrencyDollarIcon}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            loading={loading}
          />
          <KPICard
            title="Taxes Collected"
            value={metricsData?.metrics?.taxes_collected || 0}
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
        <h2 className="text-2xl font-bold text-slate-900">⏱️ {t('dashboard.sections.operationalPerformance')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Avg Preparation Time"
            value={0} // TODO: Add operational metrics to API
            format="time"
            subtitle="Not available in current API"
            icon={ClockIcon}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            loading={loading}
          />
          <KPICard
            title="Queue Length"
            value={0} // TODO: Add operational metrics to API
            subtitle="Not available in current API"
            icon={UserGroupIcon}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            loading={loading}
          />
          <KPICard
            title="Table Turnover"
            value={0} // TODO: Add operational metrics to API
            format="time"
            subtitle="Not available in current API"
            icon={BuildingStorefrontIcon}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            loading={loading}
          />
          <KPICard
            title="Delivery Performance"
            value={0} // TODO: Add operational metrics to API
            format="percentage"
            subtitle="Not available in current API"
            icon={ClockIcon}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            loading={loading}
          />
        </div>
      </div>

      {/* Comprehensive Hourly Revenue Analysis */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Hourly Revenue Breakdown</h3>
        {metricsData?.hourly_revenue && (
          <div className="space-y-6">
            {/* Revenue by Hour Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {metricsData.hourly_revenue.map((hour) => {
                const maxRevenue = Math.max(...metricsData.hourly_revenue!.map(h => h.revenue));
                const intensity = (hour.revenue / maxRevenue) * 100;
                
                return (
                  <div key={hour.hour} className="group">
                    <div 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        intensity > 80 
                          ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-300 group-hover:border-green-400' 
                          : intensity > 60
                            ? 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300 group-hover:border-blue-400'
                            : intensity > 40
                              ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300 group-hover:border-yellow-400'
                              : 'bg-gradient-to-br from-slate-100 to-slate-50 border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-semibold text-slate-700 mb-1">
                          {hour.hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="text-lg font-bold text-slate-900 mb-1">
                          {formattingService.formatCurrency(hour.revenue, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-slate-600">
                          {hour.orders} orders
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-900">
                  {(() => {
                    const sortedByOrders = [...metricsData.hourly_revenue]
                      .sort((a, b) => b.orders - a.orders)
                      .slice(0, 3);
                    const peakRevenue = sortedByOrders.reduce((sum, hour) => sum + hour.revenue, 0);
                    return formattingService.formatCurrency(peakRevenue, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
                  })()}
                </div>
                <div className="text-sm text-green-600">Peak Hours Revenue</div>
                <div className="text-xs text-green-500 mt-1">
                  {(() => {
                    const totalRevenue = metricsData.hourly_revenue.reduce((sum, h) => sum + h.revenue, 0);
                    const sortedByOrders = [...metricsData.hourly_revenue]
                      .sort((a, b) => b.orders - a.orders)
                      .slice(0, 3);
                    const peakRevenue = sortedByOrders.reduce((sum, hour) => sum + hour.revenue, 0);
                    const peakOrders = sortedByOrders.reduce((sum, hour) => sum + hour.orders, 0);
                    const percentage = totalRevenue > 0 ? ((peakRevenue / totalRevenue) * 100).toFixed(1) : '0';
                    return `${percentage}% of total (${peakOrders} orders)`;
                  })()}
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-900">
                  {formattingService.formatCurrency(metricsData.hourly_revenue.reduce((sum, h) => sum + h.revenue, 0) / metricsData.hourly_revenue.length, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-blue-600">Avg Hourly Revenue</div>
                <div className="text-xs text-blue-500 mt-1">During operating hours</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-900">
                  {metricsData.hourly_revenue.filter(h => h.hour >= 17 && h.hour <= 20).reduce((sum, h) => sum + h.orders, 0)}
                </div>
                <div className="text-sm text-purple-600">Evening Rush Orders</div>
                <div className="text-xs text-purple-500 mt-1">5PM - 8PM period</div>
              </div>
            </div>
          </div>
        )}
        {!metricsData?.hourly_revenue && (
          <div className="text-center py-8">
            <p className="text-slate-500">Hourly revenue data not available</p>
            <p className="text-sm text-slate-400 mt-2">This will be populated when API provides hourly breakdown</p>
          </div>
        )}
      </Card>

      {/* Week Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday vs Weekend Performance */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Weekly Performance Pattern</h3>
          <div className="space-y-4">
            {/* Week Days Analysis */}
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                // Check if we have API data for this day
                const dayData = metricsData?.weekly_revenue?.find(d => {
                  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  return dayMap[d.day_of_week] === day;
                });
                
                // Only show days that have API data
                if (!dayData) {
                  return (
                    <div key={day} className="text-center">
                      <div className="p-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 opacity-50">
                        <div className="text-xs font-semibold text-slate-400 mb-1">{day}</div>
                        <div className="text-sm text-slate-400">No data</div>
                      </div>
                    </div>
                  );
                }

                const revenue = dayData.revenue;
                const orders = dayData.orders;
                const avgOrderValue = dayData.avg_order_value;
                
                // Calculate performance percentage based on target
                const isWeekend = index >= 5;
                const targetRevenue = isWeekend ? 3500 : 3000;
                const performance = Math.min((revenue / targetRevenue) * 100, 100);
                
                return (
                  <div key={day} className="text-center group relative">
                    <div className="p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-md bg-gradient-to-b from-green-100 to-green-50 border-green-300 shadow-sm">
                      <div className="text-xs font-semibold text-slate-700 mb-1">
                        {day}
                        <span className="block text-green-600">•</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {formattingService.formatCurrency(revenue, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-slate-600 mb-1">
                        {orders} orders
                      </div>
                      <div className="text-xs text-slate-500">
                        {formattingService.formatCurrency(avgOrderValue, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} avg
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
                        <div 
                          className="h-1 rounded-full transition-all duration-500 bg-green-500"
                          style={{ width: `${performance}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute z-10 invisible group-hover:visible bg-slate-900 text-white text-xs rounded-lg p-2 -mt-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="font-semibold">{dayData.day_name}</div>
                      <div>Revenue: {formattingService.formatCurrency(revenue, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</div>
                      <div>Orders: {orders}</div>
                      <div>Avg: {formattingService.formatCurrency(avgOrderValue)}</div>
                      <div>Items: {dayData.total_items}</div>
                      <div className="text-green-300">• Live API Data</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weekly Insights */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {metricsData?.weekly_revenue && metricsData.weekly_revenue.length > 0 ? (
                // Use API data for insights
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <div className="text-sm font-semibold text-green-900">Weekly Total</div>
                        <div className="text-xs text-green-600">From API data ({metricsData.weekly_revenue.length} days)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-900">
                          {formattingService.formatCurrency(metricsData.weekly_revenue.reduce((sum, day) => sum + day.revenue, 0), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-green-600">
                          {metricsData.weekly_revenue.reduce((sum, day) => sum + day.orders, 0)} orders
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <div className="text-sm font-semibold text-blue-900">Daily Average</div>
                        <div className="text-xs text-blue-600">Across {metricsData.weekly_revenue.length} days</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">
                          {formattingService.formatCurrency(metricsData.weekly_revenue.reduce((sum, day) => sum + day.revenue, 0) / metricsData.weekly_revenue.length, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-blue-600">
                          {Math.round(metricsData.weekly_revenue.reduce((sum, day) => sum + day.orders, 0) / metricsData.weekly_revenue.length)} orders/day
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best performing day */}
                  {(() => {
                    const bestDay = metricsData.weekly_revenue.reduce((max, day) => 
                      day.revenue > max.revenue ? day : max
                    );
                    return (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">🏆</span>
                          <span className="font-semibold text-yellow-900">Best Performing Day</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-yellow-700 font-medium">{bestDay.day_name}</div>
                            <div className="text-yellow-600">Day of week</div>
                          </div>
                          <div>
                            <div className="text-yellow-900 font-bold">{formattingService.formatCurrency(bestDay.revenue, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</div>
                            <div className="text-yellow-600">Revenue</div>
                          </div>
                          <div>
                            <div className="text-yellow-900 font-bold">{bestDay.orders}</div>
                            <div className="text-yellow-600">Orders</div>
                          </div>
                          <div>
                            <div className="text-yellow-900 font-bold">{formattingService.formatCurrency(bestDay.avg_order_value, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</div>
                            <div className="text-yellow-600">Avg Order</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                // No API data available
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-center text-slate-500">
                    <div className="text-sm font-medium">No weekly performance data available</div>
                    <div className="text-xs mt-1">Weekly revenue data will appear here when available from the API</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* TODO: Kitchen Performance, Employee Performance, Time Series Analytics sections 
           These require operational data not currently available in the metrics API.
           Will be re-implemented when the backend provides:
           - Order preparation times
           - Employee performance metrics  
           - Peak hours analysis
           - Wait time data
           - Kitchen queue information
      */}

      {/* TODO: Inventory & Stock, Device/Terminal Stats, Financial Performance sections 
           These require data not currently available in the metrics API.
           Will be re-implemented when the backend provides:
           - Inventory levels and stock alerts
           - Device/terminal performance metrics
           - Financial KPIs (profit margins, cash flow)
      */}

      {/* Payment Methods Chart - Using metrics API only */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Payment Methods Distribution</h3>
        {metricsData?.payment_breakdown && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricsData.payment_breakdown.map((payment: any) => {
              const paymentType = payment.tender_id;
              const totalAmount = payment.total_amount;
              const transactionCount = payment.transaction_count;
              const avgAmount = payment.avg_amount;
              
              // Calculate percentage (since metrics API doesn't come with percentage)
              const totalRevenue = metricsData.payment_breakdown.reduce((sum, p) => sum + p.total_amount, 0);
              const percentage = totalRevenue > 0 ? (totalAmount / totalRevenue) * 100 : 0;

              // Get payment method info (name, icon, color)
              const methodInfo = getPaymentMethodInfo(paymentType);

              return (
                <div key={paymentType} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{methodInfo.icon}</span>
                      <span className="text-sm font-medium text-slate-700">
                        {methodInfo.name}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 font-semibold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Amount</span>
                      <span className="font-semibold text-slate-900">{formattingService.formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Transactions</span>
                      <span className="font-medium text-slate-700">{transactionCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Average per order</span>
                      <span className="text-slate-600 font-medium">{formattingService.formatCurrency(avgAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Summary Stats */}
        {metricsData?.payment_breakdown && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-900">
                  {formattingService.formatCurrency(metricsData.payment_breakdown.reduce((sum, p) => sum + p.total_amount, 0))}
                </div>
                <div className="text-sm text-blue-600">Total Payment Volume</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-900">
                  {metricsData.payment_breakdown.reduce((sum, p) => sum + p.transaction_count, 0)}
                </div>
                <div className="text-sm text-green-600">Total Transactions</div>
                <div className="text-xs text-green-500 mt-1">Across all payment methods</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-900">
                  {formattingService.formatCurrency(
                    metricsData.payment_breakdown.reduce((sum, p) => sum + (p.total_amount * p.transaction_count), 0) / 
                    metricsData.payment_breakdown.reduce((sum, p) => sum + p.transaction_count, 0)
                  )}
                </div>
                <div className="text-sm text-purple-600">Weighted Average</div>
                <div className="text-xs text-purple-500 mt-1">Per transaction</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* TODO: All remaining sections require data not currently available in the metrics API */}
    </div>
  );
};

export default Dashboard;