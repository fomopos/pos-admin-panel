import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import Chart from 'react-apexcharts';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // Note: Tenants and stores are already loaded via the TenantStoreSelection flow
  // No need to fetch tenants here as it would clear current selections

  // Mock data for dashboard stats - matching reference design
  const stats = [
    {
      name: t('dashboard.totalSales'),
      value: '$82,373.21',
      change: '+3.4%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      name: t('dashboard.totalOrders'),
      value: '7,234',
      change: '-2.8%',
      changeType: 'negative',
      icon: ShoppingCartIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      name: 'Impression',
      value: '3.1M',
      change: '+4.6%',
      changeType: 'positive',
      icon: EyeIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  // Chart data for sales trends
  const salesChartOptions = {
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    colors: ['#3B82F6'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
    },
    xaxis: {
      categories: ['01 Jun', '02 Jun', '03 Jun', '04 Jun', '05 Jun', '06 Jun', '07 Jun', '08 Jun', '09 Jun', '10 Jun', '11 Jun', '12 Jun'],
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    grid: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: 'light',
    },
  };

  const salesChartSeries = [
    {
      name: 'Revenue',
      data: [400, 450, 380, 480, 420, 500, 460, 520, 580, 520, 600, 650],
    },
  ];

  // World map data for top countries
  const topCountries = [
    { country: 'United States', value: '2.1M', percentage: 35 },
    { country: 'United Kingdom', value: '1.8M', percentage: 28 },
    { country: 'Germany', value: '1.2M', percentage: 20 },
    { country: 'France', value: '0.9M', percentage: 15 },
    { country: 'Others', value: '0.5M', percentage: 8 },
  ];

  // Recent transactions data
  const recentTransactions = [
    {
      id: 'TXN-001',
      customer: 'John Doe',
      amount: '$234.50',
      status: 'Completed',
      date: '2024-01-15',
    },
    {
      id: 'TXN-002',
      customer: 'Jane Smith',
      amount: '$156.75',
      status: 'Pending',
      date: '2024-01-15',
    },
    {
      id: 'TXN-003',
      customer: 'Bob Johnson',
      amount: '$89.25',
      status: 'Completed',
      date: '2024-01-14',
    },
    {
      id: 'TXN-004',
      customer: 'Alice Brown',
      amount: '$312.00',
      status: 'Completed',
      date: '2024-01-14',
    },
    {
      id: 'TXN-005',
      customer: 'Charlie Wilson',
      amount: '$67.50',
      status: 'Failed',
      date: '2024-01-13',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.title')}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Monthly
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.iconBg} rounded-2xl mb-4`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.changeType === 'positive' ? (
                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {stat.change}
                    </span>
                    <span className="ml-2 text-sm text-slate-500">from last month</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-1">Revenue Trends</h3>
            <p className="text-sm text-slate-500">Monthly revenue overview</p>
          </div>
          <div className="h-80">
            <Chart
              options={salesChartOptions}
              series={salesChartSeries}
              type="area"
              height="100%"
            />
          </div>
        </Card>

        {/* Top Countries */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-1">Top countries</h3>
            <p className="text-sm text-slate-500">Revenue by location</p>
          </div>
          
          {/* World Map Placeholder */}
          <div className="mb-6 h-40 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">World Map</p>
            </div>
          </div>

          {/* Countries List */}
          <div className="space-y-3">
            {topCountries.map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-slate-700">{country.country}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{country.value}</div>
                  <div className="text-xs text-slate-500">{country.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-1">Recent Transactions</h3>
          <p className="text-sm text-slate-500">Latest customer transactions</p>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {transaction.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View all transactions →
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
