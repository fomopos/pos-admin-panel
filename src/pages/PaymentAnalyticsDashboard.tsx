import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { paymentAnalyticsService } from '../services/payment';
import type { PaymentAnalytics, PaymentTrends } from '../services/payment/paymentAnalyticsService';

interface AnalyticsDashboardState {
  analytics: PaymentAnalytics | null;
  trends: PaymentTrends | null;
  isLoading: boolean;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dateRange: {
    start: string;
    end: string;
  };
  realTimeMetrics: any;
}

const PaymentAnalyticsDashboard: React.FC = () => {
  const [state, setState] = useState<AnalyticsDashboardState>({
    analytics: null,
    trends: null,
    isLoading: true,
    selectedPeriod: 'monthly',
    dateRange: {
      start: '2025-04-01',
      end: '2025-04-30'
    },
    realTimeMetrics: null
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const loadAnalytics = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const [analytics, trends] = await Promise.all([
        paymentAnalyticsService.getMockAnalytics(),
        paymentAnalyticsService.getMockTrends()
      ]);
      
      setState(prev => ({
        ...prev,
        analytics,
        trends,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const realTimeMetrics = await paymentAnalyticsService.getRealTimeMetrics('demo-tenant', 'demo-store');
      setState(prev => ({ ...prev, realTimeMetrics }));
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadRealTimeMetrics();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadRealTimeMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [state.selectedPeriod, state.dateRange]);

  const exportData = async () => {
    try {
      if (state.analytics) {
        // For now, we'll create a simple JSON download
        const dataStr = JSON.stringify(state.analytics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'payment-analytics.json';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (state.isLoading && !state.analytics) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-5 w-5 animate-spin text-slate-600" />
            <span className="text-slate-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Analytics</h1>
          <p className="mt-2 text-slate-500">Monitor payment performance and trends</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={state.selectedPeriod}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              selectedPeriod: e.target.value as any 
            }))}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <Button onClick={exportData} variant="outline" size="sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {state.realTimeMetrics && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
              Real-time Metrics
            </h2>
            <span className="text-xs text-slate-500">Updates every 30 seconds</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-slate-600 mb-1">Active Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{state.realTimeMetrics.active_transactions}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-sm font-medium text-slate-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">{state.realTimeMetrics.pending_payments}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm font-medium text-slate-600 mb-1">24h Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(state.realTimeMetrics.last_24h_revenue)}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm font-medium text-slate-600 mb-1">Current Hour</p>
              <p className="text-2xl font-bold text-purple-600">{state.realTimeMetrics.current_hour_transactions}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      {state.analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {formatCurrency(state.analytics.metrics.total_amount)}
                </p>
                {state.trends && (
                  <div className="flex items-center mt-2">
                    {state.trends.growth_metrics.revenue_growth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${state.trends.growth_metrics.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(state.trends.growth_metrics.revenue_growth)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-2xl">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {state.analytics.metrics.total_transactions.toLocaleString()}
                </p>
                {state.trends && (
                  <div className="flex items-center mt-2">
                    {state.trends.growth_metrics.transaction_growth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${state.trends.growth_metrics.transaction_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(state.trends.growth_metrics.transaction_growth)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Average Transaction</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {formatCurrency(state.analytics.metrics.average_transaction_value)}
                </p>
                {state.trends && (
                  <div className="flex items-center mt-2">
                    {state.trends.growth_metrics.average_value_growth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${state.trends.growth_metrics.average_value_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(state.trends.growth_metrics.average_value_growth)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-purple-100 rounded-2xl">
                <CreditCardIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {((state.analytics.metrics.successful_payments / state.analytics.metrics.total_transactions) * 100).toFixed(1)}%
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    Excellent
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Methods and Detailed Analytics */}
      {state.analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <Card className="p-6 border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {state.analytics.tender_breakdown.map((tender, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-slate-700">{tender.tender_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{formatCurrency(tender.total_amount)}</div>
                    <div className="text-sm text-slate-500">{tender.transaction_count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Processor Performance */}
          <Card className="p-6 border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Processor Performance</h3>
            <div className="space-y-4">
              {state.analytics.processor_performance?.map((processor, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-slate-200 text-slate-600 rounded-lg text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-700">{processor.processor_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{(processor.success_rate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-slate-500">{formatCurrency(processor.total_fees)} fees</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-slate-500">
                  No processor data available
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Hourly Analytics */}
      {state.analytics && state.analytics.hourly_distribution && (
        <Card className="p-6 border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hourly Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {state.analytics.hourly_distribution.map((hour, index) => (
              <div key={index} className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-sm font-medium text-slate-600 mb-1">
                  {hour.hour}:00
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {formatCurrency(hour.total_amount)}
                </div>
                <div className="text-xs text-slate-500">
                  {hour.transaction_count} txns
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PaymentAnalyticsDashboard;
