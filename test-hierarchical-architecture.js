// Browser Test Script for Hierarchical Architecture
// Open browser console and run this script to test the functionality

console.log('🧪 Starting Hierarchical Architecture Test...');

// Test credentials
const TEST_EMAIL = 'pratyushharsh2015@gmail.com';
const TEST_PASSWORD = 'Welcome@2023';

// Helper function to wait for element
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test Authentication
async function testAuthentication() {
  console.log('📝 Testing Authentication...');
  
  try {
    // Check if we're on sign-in page or need to sign out first
    if (window.location.pathname !== '/auth/signin') {
      // Try to find sign out button and click it
      const signOutButton = document.querySelector('button[onClick*="signOut"], button:contains("Sign out")');
      if (signOutButton) {
        signOutButton.click();
        await wait(1000);
      }
    }
    
    // Fill in credentials
    const emailInput = await waitForElement('input[type="email"]');
    const passwordInput = await waitForElement('input[type="password"]');
    const signInButton = await waitForElement('button[type="submit"]');
    
    emailInput.value = TEST_EMAIL;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = TEST_PASSWORD;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ Credentials filled');
    
    // Click sign in
    signInButton.click();
    
    // Wait for redirect to dashboard
    await wait(2000);
    
    if (window.location.pathname === '/dashboard') {
      console.log('✅ Authentication successful - redirected to dashboard');
      return true;
    } else {
      console.log('❌ Authentication failed - not redirected to dashboard');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

// Test Tenant Store Selection
async function testTenantStoreSelection() {
  console.log('🏢 Testing Tenant/Store Selection...');
  
  try {
    // Look for tenant selector (BuildingOfficeIcon button)
    const tenantSelector = await waitForElement('button:has(svg) span:contains("Organization"), button:has(svg) span:contains("Spice Garden Group"), button:has(svg) span:contains("Coffee Hub Group")');
    console.log('✅ Found tenant selector');
    
    // Click tenant selector
    tenantSelector.click();
    await wait(500);
    
    // Look for tenant options
    const tenantOptions = document.querySelectorAll('button:contains("Spice Garden Group"), button:contains("Coffee Hub Group")');
    if (tenantOptions.length > 0) {
      console.log(`✅ Found ${tenantOptions.length} tenant options`);
      
      // Select first tenant
      tenantOptions[0].click();
      await wait(500);
      
      // Now look for store selector
      const storeSelector = await waitForElement('button:has(svg) span:contains("Store"), button:has(svg) span:contains("MG Road"), button:has(svg) span:contains("Brigade Road")');
      console.log('✅ Found store selector');
      
      // Click store selector
      storeSelector.click();
      await wait(500);
      
      // Look for store options
      const storeOptions = document.querySelectorAll('button:contains("MG Road"), button:contains("Brigade Road"), button:contains("Koramangala")');
      if (storeOptions.length > 0) {
        console.log(`✅ Found ${storeOptions.length} store options`);
        
        // Select first store
        storeOptions[0].click();
        await wait(500);
        
        console.log('✅ Store selection completed');
        return true;
      } else {
        console.log('❌ No store options found');
        return false;
      }
    } else {
      console.log('❌ No tenant options found');
      return false;
    }
  } catch (error) {
    console.error('❌ Tenant/Store selection test failed:', error.message);
    return false;
  }
}

// Test Navigation Between Pages
async function testNavigation() {
  console.log('🧭 Testing Navigation...');
  
  try {
    // Test navigation to Products page
    const productsLink = await waitForElement('a[href="/products"], button:contains("Products")');
    productsLink.click();
    await wait(1000);
    
    if (window.location.pathname === '/products') {
      console.log('✅ Successfully navigated to Products page');
    }
    
    // Test navigation to Users page
    const usersLink = await waitForElement('a[href="/settings/users"], button:contains("User Management")');
    usersLink.click();
    await wait(1000);
    
    if (window.location.pathname === '/settings/users') {
      console.log('✅ Successfully navigated to Users page');
    }
    
    // Navigate back to dashboard
    const dashboardLink = await waitForElement('a[href="/dashboard"], button:contains("Dashboard")');
    dashboardLink.click();
    await wait(1000);
    
    console.log('✅ Navigation test completed');
    return true;
  } catch (error) {
    console.error('❌ Navigation test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting comprehensive test suite...');
  
  const results = {
    authentication: false,
    tenantStoreSelection: false,
    navigation: false
  };
  
  // Run tests sequentially
  results.authentication = await testAuthentication();
  
  if (results.authentication) {
    results.tenantStoreSelection = await testTenantStoreSelection();
    results.navigation = await testNavigation();
  }
  
  // Print results
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Authentication: ${results.authentication ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Tenant/Store Selection: ${results.tenantStoreSelection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Navigation: ${results.navigation ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return results;
}

// Check if we need to run tests automatically
if (window.location.hostname === 'localhost' && window.location.port === '5175') {
  console.log('🎯 Test environment detected. To run tests, execute: runTests()');
  console.log('📋 Individual tests available: testAuthentication(), testTenantStoreSelection(), testNavigation()');
} else {
  console.log('⚠️ Not in test environment. Please navigate to http://localhost:5175/');
}

// Export functions for manual testing
window.testSuite = {
  runTests,
  testAuthentication,
  testTenantStoreSelection,
  testNavigation
};
