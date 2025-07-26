// Test script for tenant selection workflow
// This can be run in the browser console to test the new API flow

import { tenantSelectionService } from '../services/tenant/tenantSelectionService';
import { useTenantStore } from '../tenants/tenantStore';

/**
 * Test the tenant selection workflow
 * Run this in the browser console after logging in
 */
async function testTenantSelection() {
  console.log('🧪 Testing Tenant Selection Workflow');
  
  try {
    // Get current tenant store state
    const store = useTenantStore.getState();
    console.log('Current tenants:', store.tenants);
    
    if (store.tenants.length === 0) {
      console.log('❌ No tenants available. Please log in first.');
      return;
    }
    
    const firstTenant = store.tenants[0];
    console.log('🎯 Testing with tenant:', firstTenant.id);
    
    // Test tenant selection
    const result = await tenantSelectionService.completeTenantSelection(firstTenant.id);
    console.log('✅ Tenant selection successful:', result);
    
    // Test store selection if stores are available
    if (firstTenant.stores && firstTenant.stores.length > 0) {
      const firstStore = firstTenant.stores[0];
      console.log('🏪 Testing with store:', firstStore.store_id);
      
      const storeResult = await tenantSelectionService.completeTenantSelection(
        firstTenant.id, 
        firstStore.store_id
      );
      console.log('✅ Store selection successful:', storeResult);
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test the tenant store methods
 */
async function testTenantStore() {
  console.log('🧪 Testing Tenant Store Methods');
  
  try {
    const store = useTenantStore.getState();
    
    if (store.tenants.length === 0) {
      console.log('❌ No tenants available. Please log in first.');
      return;
    }
    
    const firstTenant = store.tenants[0];
    console.log('🎯 Testing switchTenant with:', firstTenant.id);
    
    // Test switchTenant
    await store.switchTenant(firstTenant.id);
    console.log('✅ switchTenant successful');
    
    // Test switchStore if available
    if (firstTenant.stores && firstTenant.stores.length > 0) {
      const firstStore = firstTenant.stores[0];
      console.log('🏪 Testing switchStore with:', firstStore.store_id);
      
      await store.switchStore(firstStore.store_id);
      console.log('✅ switchStore successful');
    }
    
    console.log('🎉 All store tests passed!');
    
  } catch (error) {
    console.error('❌ Store test failed:', error);
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).testTenantSelection = testTenantSelection;
  (window as any).testTenantStore = testTenantStore;
  
  console.log('🔧 Tenant selection test functions available:');
  console.log('  - testTenantSelection()');
  console.log('  - testTenantStore()');
}
