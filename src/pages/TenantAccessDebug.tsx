import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  PageHeader,
  Alert
} from '../components/ui';
import { tenantAccessService } from '../services/tenant/tenantAccessService';
import { ShieldCheckIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const TenantAccessDebug: React.FC = () => {
  const [tenantAccess, setTenantAccess] = useState<any>(null);
  const [shouldOfferCreation, setShouldOfferCreation] = useState<boolean | null>(null);
  const [hasSuperAdmin, setHasSuperAdmin] = useState<boolean | null>(null);
  const [userTenantIds, setUserTenantIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantAccessInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching tenant access information...');
      
      // Get tenant access
      const accessData = await tenantAccessService.getTenantAccess();
      setTenantAccess(accessData);
      console.log('📋 Tenant Access:', accessData);
      
      // Check if should offer tenant creation
      const shouldOffer = await tenantAccessService.shouldOfferTenantCreation();
      setShouldOfferCreation(shouldOffer);
      console.log('🏢 Should offer tenant creation:', shouldOffer);
      
      // Check if has super admin role
      const hasSuper = await tenantAccessService.hasSuperAdminRole();
      setHasSuperAdmin(hasSuper);
      console.log('👑 Has super admin role:', hasSuper);
      
      // Get user tenant IDs
      const tenantIds = await tenantAccessService.getUserTenantIds();
      setUserTenantIds(tenantIds);
      console.log('🏢 User tenant IDs:', tenantIds);
      
    } catch (err: any) {
      console.error('❌ Error fetching tenant access info:', err);
      setError(err.message || 'Failed to fetch tenant access information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantAccessInfo();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Tenant Access Debug"
        description="Debug information for tenant access and permissions"
      >
        <Button 
          onClick={fetchTenantAccessInfo}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tenant Access Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tenant Access</h3>
          </div>
          
          {tenantAccess ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Access Records:</p>
                <p className="text-lg font-semibold text-gray-900">{tenantAccess.size}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Access Details:</p>
                <div className="space-y-2">
                  {tenantAccess.tenant_access.map((access: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Tenant ID:</span>
                          <p className="text-gray-900">{access.tenant_id}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Role:</span>
                          <p className="text-gray-900">{access.role_id}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Created:</span>
                          <p className="text-gray-900">
                            {new Date(access.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Created By:</span>
                          <p className="text-gray-900">{access.created_by}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              {isLoading ? 'Loading...' : 'No tenant access data available'}
            </p>
          )}
        </Card>

        {/* Permission Checks */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Permission Checks</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Should Offer Tenant Creation:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                shouldOfferCreation === true 
                  ? 'bg-green-100 text-green-800' 
                  : shouldOfferCreation === false 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {shouldOfferCreation === null ? 'Unknown' : shouldOfferCreation ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Has Super Admin Role:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                hasSuperAdmin === true 
                  ? 'bg-green-100 text-green-800' 
                  : hasSuperAdmin === false 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {hasSuperAdmin === null ? 'Unknown' : hasSuperAdmin ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">User Tenant IDs:</p>
              {userTenantIds.length > 0 ? (
                <div className="space-y-1">
                  {userTenantIds.map((tenantId, index) => (
                    <div key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tenantId}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tenant IDs found</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* API Response Debug */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw API Response</h3>
        <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
          {JSON.stringify(tenantAccess, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

export default TenantAccessDebug;
