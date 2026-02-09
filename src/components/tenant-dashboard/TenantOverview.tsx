import React from 'react';
import KPICard from '../ui/KPICard';
import { Widget, Badge, Loading } from '../ui';
import type { TenantOverviewData } from '../../services/types/tenant-dashboard.types';
import {
  BuildingStorefrontIcon,
  UserGroupIcon,
  CreditCardIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface TenantOverviewProps {
  data: TenantOverviewData | null;
  loading: boolean;
}

const subscriptionStatusConfig: Record<string, { color: 'green' | 'blue' | 'yellow' | 'red' | 'gray'; label: string }> = {
  active: { color: 'green', label: 'Active' },
  trialing: { color: 'blue', label: 'Trialing' },
  past_due: { color: 'red', label: 'Past Due' },
  canceled: { color: 'gray', label: 'Canceled' },
  incomplete: { color: 'yellow', label: 'Incomplete' },
};

const TenantOverview: React.FC<TenantOverviewProps> = ({ data, loading }) => {

  if (loading) {
    return (
      <Loading
        title="Loading Overview"
        description="Fetching tenant dashboard data..."
      />
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No overview data available.</p>
      </div>
    );
  }

  const statusConfig = subscriptionStatusConfig[data.subscription.status] || subscriptionStatusConfig.active;
  const billingCycleEnd = new Date(data.subscription.current_period_end).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Tenant Identity */}
      <Widget
        title={data.tenant_name}
        description={`Tenant since ${new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
        icon={BuildingOfficeIcon}
        variant="primary"
        headerActions={
          <Badge color={statusConfig.color} size="md">
            {statusConfig.label}
          </Badge>
        }
      >
        {/* Subscription warning banners */}
        {data.subscription.status === 'past_due' && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Your subscription payment is past due. Please update your billing information to avoid service interruption.
            </p>
          </div>
        )}
        {data.subscription.cancel_at_period_end && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Your subscription is set to cancel at the end of the current billing period ({billingCycleEnd}).
            </p>
          </div>
        )}
      </Widget>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Stores"
          value={data.active_stores_count}
          subtitle={`${data.total_stores_count} total`}
          icon={BuildingStorefrontIcon}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          format="number"
        />
        <KPICard
          title="Users"
          value={data.active_users_count}
          subtitle={`${data.total_users_count} total`}
          icon={UserGroupIcon}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          format="number"
        />
        <KPICard
          title="Current Plan"
          value={data.subscription.plan.name}
          subtitle={`$${data.subscription.plan.price_per_seat}/store/mo`}
          icon={CreditCardIcon}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <KPICard
          title="Billing Cycle Ends"
          value={new Date(data.subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          subtitle={`Est. $${data.subscription.estimated_monthly_cost.toFixed(2)}/mo`}
          icon={CalendarIcon}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Subscription Details" icon={CreditCardIcon} variant="default" size="sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Plan</span>
              <span className="text-sm font-medium text-gray-900">{data.subscription.plan.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Seat Count (Stores)</span>
              <span className="text-sm font-medium text-gray-900">{data.subscription.seat_count}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Price per Seat</span>
              <span className="text-sm font-medium text-gray-900">
                ${data.subscription.plan.price_per_seat}/{data.subscription.currency === 'usd' ? 'mo' : data.subscription.currency}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Estimated Monthly Cost</span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.subscription.estimated_monthly_cost.toFixed(2)}
              </span>
            </div>
          </div>
        </Widget>

        <Widget title="Store Breakdown" icon={BuildingStorefrontIcon} variant="default" size="sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-500">Active Stores</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{data.active_stores_count}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 inline-block" />
                <span className="text-sm text-gray-500">Inactive Stores</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{data.total_stores_count - data.active_stores_count}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Billing is based on the number of <strong>active stores</strong>. Deactivating a store reduces your seat count and monthly cost.
              </p>
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );
};

export default TenantOverview;
