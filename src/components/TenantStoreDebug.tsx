/**
 * Debug component to check tenant store state
 * Temporary file for debugging the navigation loop issue
 */

import React from 'react';
import { useTenantStore } from '../tenants/tenantStore';

const TenantStoreDebug: React.FC = () => {
  const { currentTenant, currentStore, tenants } = useTenantStore();
  
  React.useEffect(() => {
    console.log('🔍 TenantStore Debug:', {
      currentTenant: currentTenant ? { id: currentTenant.id, name: currentTenant.name } : null,
      currentStore: currentStore ? { id: currentStore.store_id, name: currentStore.store_name } : null,
      tenantsCount: tenants.length,
      timestamp: new Date().toISOString()
    });
  }, [currentTenant, currentStore, tenants]);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <div className="font-bold mb-2">🔍 Tenant Store Debug</div>
      <div>Tenant: {currentTenant ? `${currentTenant.name} (${currentTenant.id})` : 'None'}</div>
      <div>Store: {currentStore ? `${currentStore.store_name} (${currentStore.store_id})` : 'None'}</div>
      <div>Tenants Loaded: {tenants.length}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
    </div>
  );
};

export default TenantStoreDebug;
