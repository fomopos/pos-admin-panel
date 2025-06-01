// Browser Console Test Script for Duplicate API Call Detection
// Copy and paste this into the browser console to monitor API calls

console.log('🔍 Starting duplicate API call monitoring...');

// Reset monitoring
let monitoringData = {
  totalCalls: 0,
  tenantCalls: 0,
  storeCalls: 0,
  callHistory: [],
  startTime: new Date()
};

// Store original fetch
const originalFetch = window.fetch;

// Override fetch to monitor API calls
window.fetch = function(...args) {
  const url = args[0];
  const method = args[1]?.method || 'GET';
  
  // Track all API calls
  if (typeof url === 'string' && (url.includes('/v0/') || url.includes('/v1/'))) {
    monitoringData.totalCalls++;
    
    const callInfo = {
      timestamp: new Date(),
      url: url,
      method: method,
      callNumber: monitoringData.totalCalls
    };
    
    monitoringData.callHistory.push(callInfo);
    
    // Track tenant calls specifically
    if (url.includes('/v0/tenant')) {
      monitoringData.tenantCalls++;
      console.log(`🚨 TENANT API CALL #${monitoringData.tenantCalls}:`, {
        time: callInfo.timestamp.toISOString(),
        url: url,
        method: method
      });
      
      // Alert on duplicate calls
      if (monitoringData.tenantCalls > 1) {
        console.error('⚠️ DUPLICATE TENANT API CALL DETECTED!');
        console.error('This may indicate the duplicate call fix is not working properly.');
      }
    }
    
    // Track store calls
    if (url.includes('/v1/tenant/') && url.includes('/store')) {
      monitoringData.storeCalls++;
      console.log(`🏪 STORE API CALL #${monitoringData.storeCalls}:`, {
        time: callInfo.timestamp.toISOString(),
        url: url,
        method: method
      });
    }
  }
  
  return originalFetch.apply(this, args);
};

// Helper functions
window.getApiCallSummary = () => {
  const duration = new Date() - monitoringData.startTime;
  console.log('📊 API Call Summary:', {
    duration: `${Math.round(duration / 1000)}s`,
    totalCalls: monitoringData.totalCalls,
    tenantCalls: monitoringData.tenantCalls,
    storeCalls: monitoringData.storeCalls,
    duplicateTenantCalls: monitoringData.tenantCalls > 1
  });
  
  if (monitoringData.tenantCalls <= 1) {
    console.log('✅ SUCCESS: No duplicate tenant API calls detected!');
  } else {
    console.error('❌ FAILURE: Duplicate tenant API calls detected!');
  }
  
  return monitoringData;
};

window.getCallHistory = () => {
  console.table(monitoringData.callHistory);
  return monitoringData.callHistory;
};

window.resetApiMonitoring = () => {
  monitoringData = {
    totalCalls: 0,
    tenantCalls: 0,
    storeCalls: 0,
    callHistory: [],
    startTime: new Date()
  };
  console.log('🧹 API monitoring reset');
};

console.log('✅ API monitoring setup complete!');
console.log('Commands available:');
console.log('- getApiCallSummary() - View summary of API calls');
console.log('- getCallHistory() - View detailed call history');
console.log('- resetApiMonitoring() - Reset monitoring data');
console.log('');
console.log('🎯 Expected behavior: Only ONE tenant API call per session');
console.log('📝 Navigate through the app and check for duplicate calls');

// Auto-check after 30 seconds
setTimeout(() => {
  console.log('⏰ 30-second auto-check:');
  getApiCallSummary();
}, 30000);
