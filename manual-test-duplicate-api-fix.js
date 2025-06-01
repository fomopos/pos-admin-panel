// Manual Test Script for Duplicate API Call Fix
// Copy and paste this entire script into the browser console

console.log('🔧 Manual Test Script for Duplicate API Call Fix');
console.log('═══════════════════════════════════════════════════');

// Test configuration
const TEST_CONFIG = {
  expectedTenantCalls: 1,
  testDuration: 60000, // 1 minute
  monitoringInterval: 5000 // 5 seconds
};

// Initialize monitoring
let testResults = {
  startTime: new Date(),
  apiCalls: {
    total: 0,
    tenant: 0,
    store: 0,
    history: []
  },
  componentLogs: [],
  testStatus: 'running'
};

// Store original fetch and console.log
const originalFetch = window.fetch;
const originalConsoleLog = console.log;

// Enhanced fetch monitoring
window.fetch = function(...args) {
  const url = args[0];
  const method = args[1]?.method || 'GET';
  
  if (typeof url === 'string' && url.includes('/v0/')) {
    testResults.apiCalls.total++;
    
    const callInfo = {
      timestamp: new Date(),
      url: url,
      method: method,
      callNumber: testResults.apiCalls.total
    };
    
    testResults.apiCalls.history.push(callInfo);
    
    if (url.includes('/v0/tenant')) {
      testResults.apiCalls.tenant++;
      console.log(`🚨 TENANT API CALL #${testResults.apiCalls.tenant}:`, callInfo);
      
      if (testResults.apiCalls.tenant > TEST_CONFIG.expectedTenantCalls) {
        console.error('❌ DUPLICATE TENANT API CALL DETECTED!');
        testResults.testStatus = 'failed';
      }
    }
  }
  
  return originalFetch.apply(this, args);
};

// Monitor console logs for component behavior
console.log = function(...args) {
  // Capture component-related logs
  const message = args.join(' ');
  if (message.includes('TenantStoreSelection') || 
      message.includes('fetchTenants') || 
      message.includes('already loaded') ||
      message.includes('skipping fetchTenants call')) {
    testResults.componentLogs.push({
      timestamp: new Date(),
      message: message
    });
  }
  
  return originalConsoleLog.apply(this, args);
};

// Test helper functions
window.getTestResults = () => {
  const duration = new Date() - testResults.startTime;
  const result = {
    testDuration: `${Math.round(duration / 1000)}s`,
    testStatus: testResults.testStatus,
    apiCalls: testResults.apiCalls,
    componentBehavior: testResults.componentLogs,
    success: testResults.apiCalls.tenant <= TEST_CONFIG.expectedTenantCalls
  };
  
  console.log('📊 Test Results:', result);
  return result;
};

window.printTestSummary = () => {
  const results = getTestResults();
  
  console.log('\n🎯 DUPLICATE API CALL FIX TEST SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Tenant API calls: ${results.apiCalls.tenant}/${TEST_CONFIG.expectedTenantCalls} (expected)`);
  console.log(`Total API calls: ${results.apiCalls.total}`);
  console.log(`Test duration: ${results.testDuration}`);
  
  if (results.apiCalls.tenant <= TEST_CONFIG.expectedTenantCalls) {
    console.log('\n✅ SUCCESS: Duplicate API call fix is working correctly!');
  } else {
    console.log('\n❌ FAILURE: Duplicate API calls still occurring!');
  }
  
  return results;
};

// Detailed call history
window.printCallHistory = () => {
  console.log('\n📜 API Call History:');
  console.table(testResults.apiCalls.history);
};

// Component behavior analysis
window.printComponentLogs = () => {
  console.log('\n🎬 Component Behavior Logs:');
  testResults.componentLogs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.timestamp.toISOString()}] ${log.message}`);
  });
};

// Auto-monitoring
let monitoringInterval = setInterval(() => {
  const duration = new Date() - testResults.startTime;
  if (duration > TEST_CONFIG.testDuration) {
    console.log('\n⏰ Test duration completed, stopping monitoring...');
    clearInterval(monitoringInterval);
    printTestSummary();
    return;
  }
  
  console.log(`⏱️ Test progress: ${Math.round(duration / 1000)}s - Tenant calls: ${testResults.apiCalls.tenant}`);
}, TEST_CONFIG.monitoringInterval);

// Test instructions
console.log('\n📋 TEST INSTRUCTIONS:');
console.log('1. Navigate through the application (login → tenant selection → store selection)');
console.log('2. Use browser back/forward buttons');
console.log('3. Refresh the page and navigate again');
console.log('4. Click "Back to Tenants" button if available');
console.log('5. Monitor console for duplicate API calls');
console.log('\n🎯 EXPECTED: Only ONE tenant API call per session');
console.log('\n📊 Available commands:');
console.log('- getTestResults() - Get current test status');
console.log('- printTestSummary() - Print final summary');
console.log('- printCallHistory() - Show all API calls');
console.log('- printComponentLogs() - Show component behavior');

console.log('\n🚀 Test monitoring started! Perform your navigation tests...');
