// Test script to verify API integration with real backend
// Run this in browser console when on tenant-store-selection page

console.log('🧪 Starting API Integration Test...');

// Test 1: Check environment configuration
console.log('\n📋 Environment Configuration:');
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Use Mock Data:', import.meta.env.VITE_USE_MOCK_DATA);
console.log('Node ENV:', import.meta.env.NODE_ENV);

// Test 2: Check if tenant store is available
const tenantStore = window.useTenantStore?.getState();
if (tenantStore) {
  console.log('\n🏪 Tenant Store State:');
  console.log('Current Tenant:', tenantStore.currentTenant);
  console.log('Current Store:', tenantStore.currentStore);
  console.log('Available Tenants:', tenantStore.tenants);
  console.log('Is Loading:', tenantStore.isLoading);
  console.log('Error:', tenantStore.error);
} else {
  console.log('\n❌ Tenant Store not available in window');
}

// Test 3: Test API service directly
async function testApiIntegration() {
  try {
    console.log('\n🔌 Testing API Integration...');
    
    // Import the API service
    const { tenantApiService } = await import('/src/services/tenant/tenantApiService.ts');
    
    // Test getUserTenants API call
    const testUserId = '81238dda-60f1-70c3-4284-0fb8c5ac5631';
    console.log(`\n📞 Calling API: getUserTenants(${testUserId})`);
    
    const userTenants = await tenantApiService.getUserTenants(testUserId);
    console.log('✅ API Response:', userTenants);
    
    if (userTenants.tenants && userTenants.tenants.length > 0) {
      console.log(`📊 Found ${userTenants.tenants.length} tenants`);
      
      // Test getTenantStores for first tenant
      const firstTenantId = userTenants.tenants[0].id;
      console.log(`\n📞 Calling API: getTenantStores(${firstTenantId})`);
      
      const stores = await tenantApiService.getTenantStores(firstTenantId);
      console.log('✅ Stores Response:', stores);
      console.log(`🏪 Found ${stores.length} stores for tenant ${firstTenantId}`);
    }
    
    console.log('\n🎉 API Integration Test Complete!');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:', error);
    console.log('📝 This might be expected if the real API is not available - fallback to mock data should work');
  }
}

// Test 4: Test authentication token
async function testAuthentication() {
  try {
    console.log('\n🔐 Testing Authentication...');
    
    const { authService } = await import('/src/auth/authService.ts');
    const token = await authService.getAccessToken();
    
    if (token) {
      console.log('✅ Access token available (length:', token.length, ')');
      console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    } else {
      console.log('❌ No access token available - user may need to log in');
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testAuthentication();
  await testApiIntegration();
  
  console.log('\n📋 Test Summary:');
  console.log('1. Environment: Configured for real API');
  console.log('2. Authentication: Check token availability');
  console.log('3. API Integration: Test real endpoint calls');
  console.log('4. Fallback: Mock data should work if API fails');
  
  console.log('\n🔍 Next Steps:');
  console.log('1. Check browser Network tab for API calls');
  console.log('2. Verify console logs show API attempts');
  console.log('3. Test tenant/store selection flow');
  console.log('4. Check if authentication works with your backend');
}

// Auto-run tests
runAllTests();

// Make functions available globally for manual testing
window.testApiIntegration = testApiIntegration;
window.testAuthentication = testAuthentication;
window.runAllTests = runAllTests;

console.log('\n🛠️ Manual Test Functions Available:');
console.log('- testApiIntegration()');
console.log('- testAuthentication()');
console.log('- runAllTests()');
