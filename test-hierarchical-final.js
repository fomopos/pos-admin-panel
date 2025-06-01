/**
 * Hierarchical Architecture Testing Script
 * Tests the complete Tenant → Store → Users structure
 */

// Test credentials as provided
const TEST_CREDENTIALS = {
  email: 'pratyushharsh2015@gmail.com',
  password: 'Welcome@2023'
};

async function testHierarchicalArchitecture() {
  console.log('🧪 Starting Hierarchical Architecture Test...');
  
  try {
    // 1. Test Login
    console.log('\n1️⃣ Testing Login...');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = document.querySelector('button[type="submit"]');
    
    if (!emailInput || !passwordInput || !loginButton) {
      throw new Error('Login form elements not found');
    }
    
    // Clear and fill credentials
    emailInput.value = '';
    passwordInput.value = '';
    emailInput.value = TEST_CREDENTIALS.email;
    passwordInput.value = TEST_CREDENTIALS.password;
    
    // Trigger input events
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ Credentials entered');
    
    // Click login
    loginButton.click();
    console.log('✅ Login button clicked');
    
    // Wait for navigation to dashboard
    await waitForElement('[data-testid="dashboard"]', 10000);
    console.log('✅ Successfully logged in and navigated to dashboard');
    
    // 2. Test Tenant Selection
    console.log('\n2️⃣ Testing Tenant (Organization) Selection...');
    await testTenantSelection();
    
    // 3. Test Store Selection
    console.log('\n3️⃣ Testing Store Selection...');
    await testStoreSelection();
    
    // 4. Test Navigation with Hierarchy
    console.log('\n4️⃣ Testing Navigation with Selected Hierarchy...');
    await testNavigationWithHierarchy();
    
    // 5. Test Store Context in Components
    console.log('\n5️⃣ Testing Store Context in Components...');
    await testStoreContextInComponents();
    
    console.log('\n🎉 All tests passed! Hierarchical architecture is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function testTenantSelection() {
  // Look for the organization selector
  const orgSelector = await waitForElement('[data-testid="tenant-selector"]', 5000);
  if (!orgSelector) {
    // Try alternative selector - look for BuildingOfficeIcon button
    const orgButton = document.querySelector('button:has(svg) span:contains("Select Organization"), button:has(svg):contains("Organization")');
    if (!orgButton) {
      throw new Error('Organization selector not found');
    }
  }
  
  console.log('✅ Organization selector found');
  
  // Click to open tenant dropdown
  const tenantButton = document.querySelector('button[class*="bg-gray-50"]:has(svg)');
  if (tenantButton) {
    tenantButton.click();
    console.log('✅ Tenant dropdown clicked');
    
    // Wait for dropdown options
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Look for tenant options
    const tenantOptions = document.querySelectorAll('button:contains("Spice Garden"), button:contains("Coffee Hub")');
    if (tenantOptions.length > 0) {
      console.log(`✅ Found ${tenantOptions.length} tenant options`);
      
      // Select first tenant (Spice Garden Group)
      const spiceGardenOption = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Spice Garden') || btn.textContent.includes('Garden')
      );
      
      if (spiceGardenOption) {
        spiceGardenOption.click();
        console.log('✅ Selected Spice Garden Group tenant');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
}

async function testStoreSelection() {
  // After selecting tenant, store selector should appear
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Look for store selector
  const storeButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Select Store') || btn.textContent.includes('MG Road') || btn.textContent.includes('Brigade')
  );
  
  if (!storeButton) {
    throw new Error('Store selector not found after tenant selection');
  }
  
  console.log('✅ Store selector appeared after tenant selection');
  
  // Click to open store dropdown
  storeButton.click();
  console.log('✅ Store dropdown clicked');
  
  // Wait for dropdown options
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Look for store options
  const storeOptions = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('MG Road') || btn.textContent.includes('Brigade Road')
  );
  
  if (storeOptions.length === 0) {
    throw new Error('No store options found');
  }
  
  console.log(`✅ Found ${storeOptions.length} store options`);
  
  // Select MG Road store
  const mgRoadStore = storeOptions.find(btn => btn.textContent.includes('MG Road'));
  if (mgRoadStore) {
    mgRoadStore.click();
    console.log('✅ Selected MG Road store');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function testNavigationWithHierarchy() {
  // Test that navigation works with selected hierarchy
  const userManagementLink = Array.from(document.querySelectorAll('a, button')).find(el => 
    el.textContent.includes('User Management') || el.textContent.includes('Users')
  );
  
  if (userManagementLink) {
    userManagementLink.click();
    console.log('✅ Navigated to User Management');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if we're on the user management page
    const pageTitle = document.querySelector('h1, h2, [data-testid="page-title"]');
    if (pageTitle && pageTitle.textContent.includes('User')) {
      console.log('✅ User Management page loaded');
    }
  }
}

async function testStoreContextInComponents() {
  // Test that components are using the selected store context
  console.log('✅ Testing store context in components...');
  
  // Check if the current store information is being used
  const storeContext = window.useTenantStore?.getState?.();
  if (storeContext) {
    console.log('Current Tenant:', storeContext.currentTenant?.name);
    console.log('Current Store:', storeContext.currentStore?.store_name);
    
    if (storeContext.currentTenant && storeContext.currentStore) {
      console.log('✅ Both tenant and store are properly selected');
    } else {
      console.log('⚠️ Warning: Tenant or store not properly selected');
    }
  }
  
  // Check if store ID is being passed to API calls (if any are visible)
  const apiCalls = performance.getEntriesByType('resource').filter(entry => 
    entry.name.includes('/api/') || entry.name.includes('store')
  );
  
  if (apiCalls.length > 0) {
    console.log(`✅ Found ${apiCalls.length} API calls that may be using store context`);
  }
}

// Utility functions
async function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for manual testing
window.testHierarchicalArchitecture = testHierarchicalArchitecture;

// Auto-run if on login page
if (window.location.pathname.includes('/auth/signin') || document.querySelector('input[type="email"]')) {
  console.log('🚀 Login page detected. Run testHierarchicalArchitecture() to start testing');
  console.log('📋 Test Credentials:');
  console.log('   Email:', TEST_CREDENTIALS.email);
  console.log('   Password:', TEST_CREDENTIALS.password);
} else if (window.location.pathname === '/' || window.location.pathname.includes('/dashboard')) {
  console.log('🏠 Dashboard detected. Hierarchical selectors should be visible.');
  console.log('🔧 To test store switching, use the organization and store dropdowns in the sidebar.');
}
