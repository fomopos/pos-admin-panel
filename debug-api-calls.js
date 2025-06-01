// Debug script to check duplicate API calls
// Run this in the browser console to monitor network calls

console.log('🔍 Starting API call monitoring...');

// Store original fetch
const originalFetch = window.fetch;

// Track API calls
const apiCalls = [];

// Override fetch to monitor API calls
window.fetch = function(...args) {
  const url = args[0];
  
  // Only track relevant API calls
  if (typeof url === 'string' && (url.includes('/v0/tenant') || url.includes('/v1/tenant'))) {
    const timestamp = new Date().toISOString();
    const callInfo = {
      timestamp,
      url,
      method: args[1]?.method || 'GET',
      stackTrace: new Error().stack
    };
    
    apiCalls.push(callInfo);
    console.log(`🚨 API Call ${apiCalls.length}:`, {
      timestamp,
      url,
      method: callInfo.method
    });
    
    // Log stack trace for duplicate calls
    if (url.includes('/v0/tenant') && apiCalls.filter(call => call.url.includes('/v0/tenant')).length > 1) {
      console.warn('⚠️ DUPLICATE /v0/tenant call detected!');
      console.log('Stack trace:', callInfo.stackTrace);
    }
  }
  
  return originalFetch.apply(this, args);
};

// Function to view all API calls
window.debugApiCalls = () => {
  console.table(apiCalls);
  return apiCalls;
};

// Function to clear monitoring
window.clearApiMonitoring = () => {
  apiCalls.length = 0;
  console.log('🧹 API call monitoring cleared');
};

console.log('✅ API monitoring setup complete. Use debugApiCalls() to view calls, clearApiMonitoring() to clear.');
