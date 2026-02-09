/**
 * TenantBillingPage
 * 
 * Standalone page for tenant billing and subscription management.
 * Only accessible to users with canViewBilling permission.
 * Mutation actions (cancel, change plan) restricted to owners.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Loading } from '../../components/ui';
import { BillingSection } from '../../components/tenant-dashboard';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useTenantStore } from '../../tenants/tenantStore';
import { ShieldExclamationIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const TenantBillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { hasDashboardAccess, isLoading: roleLoading, role, can } = useTenantRole();

  if (roleLoading) {
    return <Loading title="Loading Billing" description="Determining your access level..." variant="primary" />;
  }

  if (!hasDashboardAccess || !can('canViewBilling')) {
    return (
      <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto text-center py-24">
          <ShieldExclamationIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-6">
            Billing information is available to <strong>Owner</strong> and <strong>Admin</strong> roles only.
            Your current role is <strong className="capitalize">{role}</strong>.
          </p>
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Go to Store Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto text-center py-24">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tenant Selected</h2>
          <p className="text-gray-500 mb-6">Please select an organization to view billing.</p>
          <button onClick={() => navigate('/tenant-store-selection')} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Select Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Subscription"
        description={`Subscription and billing details for ${currentTenant.name}`}
      />
      <BillingSection />
    </div>
  );
};

export default TenantBillingPage;
