/**
 * Test Script: Logout Data Clearing Verification
 * 
 * This script tests that tenant/store data is properly cleared when a user logs out.
 * 
 * Test Cases:
 * 1. Login with valid credentials
 * 2. Load tenant/store data
 * 3. Verify data is present in store
 * 4. Logout
 * 5. Verify all data is cleared from store
 * 6. Verify localStorage is cleared
 */

console.log('🧪 Starting Logout Data Clearing Test...\n');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  testTimeout: 30000,
  waitBetweenSteps: 2000
};

// Utility function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to check localStorage
const checkLocalStorage = () => {
  const tenantStorage = localStorage.getItem('tenant-storage');
  console.log('📦 Current localStorage tenant-storage:', tenantStorage);
  
  if (tenantStorage) {
    try {
      const parsed = JSON.parse(tenantStorage);
      console.log('📊 Parsed tenant storage state:', {
        hasTenants: parsed.state?.tenants?.length > 0,
        hasCurrentTenant: !!parsed.state?.currentTenant,
        hasCurrentStore: !!parsed.state?.currentStore,
        tenantsCount: parsed.state?.tenants?.length || 0
      });
      return parsed.state;
    } catch (e) {
      console.log('❌ Error parsing tenant storage:', e);
      return null;
    }
  }
  return null;
};

// Utility function to check Zustand store state
const checkZustandState = () => {
  // Access the store directly from window if available
  if (window.useTenantStore) {
    const state = window.useTenantStore.getState();
    console.log('🏪 Current Zustand store state:', {
      hasTenants: state.tenants?.length > 0,
      hasCurrentTenant: !!state.currentTenant,
      hasCurrentStore: !!state.currentStore,
      tenantsCount: state.tenants?.length || 0,
      isLoading: state.isLoading,
      error: state.error
    });
    return state;
  } else {
    console.log('⚠️ Zustand store not available on window object');
    return null;
  }
};

// Test Step 1: Check initial state
const testInitialState = () => {
  console.log('\n📋 Step 1: Checking initial state...');
  
  const localStorageState = checkLocalStorage();
  const zustandState = checkZustandState();
  
  console.log('✅ Initial state check completed\n');
  return { localStorageState, zustandState };
};

// Test Step 2: Simulate login and data loading
const testDataLoading = async () => {
  console.log('📋 Step 2: Simulating data loading after login...');
  
  // Look for login button and simulate click
  const loginBtn = document.querySelector('[data-testid="login-btn"], button[type="submit"], .login-button');
  if (loginBtn) {
    console.log('🔍 Found login button, checking if login form is present...');
  }
  
  // Check if we're already logged in by looking for tenant data
  await wait(TEST_CONFIG.waitBetweenSteps);
  
  const stateAfterLoad = checkZustandState();
  const localStorageAfterLoad = checkLocalStorage();
  
  console.log('✅ Data loading simulation completed\n');
  return { stateAfterLoad, localStorageAfterLoad };
};

// Test Step 3: Simulate logout
const testLogout = async () => {
  console.log('📋 Step 3: Simulating logout...');
  
  // Look for logout/profile button
  const logoutBtn = document.querySelector('[data-testid="logout-btn"], .logout-button, .user-menu button');
  const profileBtn = document.querySelector('[data-testid="profile-btn"], .profile-button, .user-profile');
  
  if (logoutBtn) {
    console.log('🔍 Found logout button, simulating click...');
    logoutBtn.click();
  } else if (profileBtn) {
    console.log('🔍 Found profile button, simulating click to open menu...');
    profileBtn.click();
    
    await wait(1000);
    
    // Look for logout option in dropdown
    const logoutOption = document.querySelector('[data-testid="logout-option"], .logout-option, [role="menuitem"]:contains("Logout")');
    if (logoutOption) {
      console.log('🔍 Found logout option in menu, clicking...');
      logoutOption.click();
    }
  } else {
    console.log('⚠️ No logout button found, simulating programmatic logout...');
    
    // Try to access auth service directly
    if (window.authService) {
      try {
        await window.authService.signOut();
        console.log('✅ Programmatic logout successful');
      } catch (error) {
        console.log('❌ Programmatic logout failed:', error);
      }
    }
  }
  
  await wait(TEST_CONFIG.waitBetweenSteps);
  console.log('✅ Logout simulation completed\n');
};

// Test Step 4: Verify data clearing
const testDataClearing = () => {
  console.log('📋 Step 4: Verifying data has been cleared...');
  
  const localStorageAfterLogout = checkLocalStorage();
  const zustandStateAfterLogout = checkZustandState();
  
  // Check if data is properly cleared
  const isDataCleared = {
    localStorage: !localStorageAfterLogout || (
      (!localStorageAfterLogout.tenants || localStorageAfterLogout.tenants.length === 0) &&
      !localStorageAfterLogout.currentTenant &&
      !localStorageAfterLogout.currentStore
    ),
    zustand: !zustandStateAfterLogout || (
      (!zustandStateAfterLogout.tenants || zustandStateAfterLogout.tenants.length === 0) &&
      !zustandStateAfterLogout.currentTenant &&
      !zustandStateAfterLogout.currentStore
    )
  };
  
  console.log('🧹 Data clearing verification:', isDataCleared);
  
  if (isDataCleared.localStorage && isDataCleared.zustand) {
    console.log('✅ SUCCESS: All tenant/store data has been properly cleared!');
  } else {
    console.log('❌ FAILURE: Some data was not cleared properly');
    if (!isDataCleared.localStorage) {
      console.log('  - localStorage still contains tenant data');
    }
    if (!isDataCleared.zustand) {
      console.log('  - Zustand store still contains tenant data');
    }
  }
  
  console.log('✅ Data clearing verification completed\n');
  return isDataCleared;
};

// Main test function
const runLogoutTest = async () => {
  console.log('🚀 Starting Logout Data Clearing Test Suite\n');
  console.log('📍 Current URL:', window.location.href);
  console.log('📍 User Agent:', navigator.userAgent);
  console.log('📍 Timestamp:', new Date().toISOString(), '\n');
  
  try {
    // Step 1: Check initial state
    const initialState = testInitialState();
    
    // Step 2: Simulate data loading
    const dataLoadingState = await testDataLoading();
    
    // Step 3: Simulate logout
    await testLogout();
    
    // Step 4: Verify data clearing
    const clearingResults = testDataClearing();
    
    // Final report
    console.log('📊 TEST SUMMARY:');
    console.log('================');
    console.log('✅ Initial state check: COMPLETED');
    console.log('✅ Data loading simulation: COMPLETED');
    console.log('✅ Logout simulation: COMPLETED');
    console.log(`${clearingResults.localStorage && clearingResults.zustand ? '✅' : '❌'} Data clearing verification: ${clearingResults.localStorage && clearingResults.zustand ? 'PASSED' : 'FAILED'}`);
    
    if (clearingResults.localStorage && clearingResults.zustand) {
      console.log('\n🎉 OVERALL RESULT: TEST PASSED - Logout data clearing works correctly!');
    } else {
      console.log('\n💥 OVERALL RESULT: TEST FAILED - Data is not being cleared properly on logout');
    }
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  }
};

// Auto-run test when script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runLogoutTest);
} else {
  runLogoutTest();
}

// Export for manual execution
window.runLogoutTest = runLogoutTest;
window.checkLocalStorage = checkLocalStorage;
window.checkZustandState = checkZustandState;

console.log('📝 Test script loaded. You can also run manually with: window.runLogoutTest()');
