/**
 * TenantUsersPage
 * 
 * Standalone page for managing users within the current tenant.
 * Supports invite, role editing, and removal.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Loading } from '../../components/ui';
import { UserManagement } from '../../components/tenant-dashboard';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useTenantStore } from '../../tenants/tenantStore';
import { ShieldExclamationIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const TenantUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { hasDashboardAccess, isLoading: roleLoading, role } = useTenantRole();

  if (roleLoading) {
    return <Loading title="Loading User Management" description="Determining your access level..." variant="primary" />;
  }

  if (!hasDashboardAccess) {
    return (
      <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto text-center py-24">
          <ShieldExclamationIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-6">
            User management is available to <strong>Owner</strong> and <strong>Admin</strong> roles only.
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
          <p className="text-gray-500 mb-6">Please select an organization to manage users.</p>
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
        title="User Management"
        description={`Manage team members and roles for ${currentTenant.name}`}
      />
      <UserManagement />
    </div>
  );
};

export default TenantUsersPage;
