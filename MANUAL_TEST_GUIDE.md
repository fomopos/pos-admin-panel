# Manual Testing Guide: Duplicate API Call Fix Verification

## Test Objective
Verify that the `/v0/tenant` API is called **only once** per session, preventing duplicate calls during navigation.

## Setup

1. **Open Browser**: Navigate to `http://localhost:5175`
2. **Open DevTools**: Press F12 or Cmd+Option+I
3. **Load Test Script**: Copy and paste the contents of `manual-test-duplicate-api-fix.js` into the Console tab

## Test Scenarios

### Scenario 1: Fresh Login Flow
**Expected Result**: 1 tenant API call

1. Clear browser storage (Application → Storage → Clear storage)
2. Refresh the page
3. Login with valid credentials
4. Navigate through tenant selection
5. **Check**: Console should show exactly 1 tenant API call

### Scenario 2: Page Refresh During Session
**Expected Result**: 0 additional tenant API calls (should use cached data)

1. After completing Scenario 1, refresh the page
2. Navigate through the application again
3. **Check**: No additional tenant API calls should occur

### Scenario 3: Back Navigation
**Expected Result**: 0 additional tenant API calls

1. Navigate to store selection
2. Click "Back to Tenants" button
3. Select a different tenant
4. **Check**: No additional tenant API calls should occur

### Scenario 4: Browser Back/Forward
**Expected Result**: 0 additional tenant API calls

1. Use browser back button to navigate
2. Use browser forward button
3. Navigate through the flow again
4. **Check**: No additional tenant API calls should occur

### Scenario 5: React StrictMode Double Rendering
**Expected Result**: 1 tenant API call (StrictMode should not cause duplicates)

1. Check that the app is running in development mode (StrictMode enabled)
2. Navigate through the tenant selection flow
3. **Check**: Despite StrictMode double rendering, only 1 API call should occur

## Test Commands

Run these commands in the browser console during testing:

```javascript
// Get current test status
getTestResults()

// Print detailed summary
printTestSummary()

// View all API calls made
printCallHistory()

// See component behavior logs
printComponentLogs()
```

## Success Criteria

### ✅ Test PASSES if:
- Total tenant API calls ≤ 1 per session
- Console shows "✅ Tenants already loaded, skipping fetchTenants call" on subsequent navigations
- No "⚠️ DUPLICATE TENANT API CALL DETECTED!" messages
- Component logs show smart initialization working

### ❌ Test FAILS if:
- Multiple tenant API calls in a single session
- Console shows duplicate call warnings
- Component makes unnecessary API requests

## Debug Information

### Key Console Messages to Look For:

**Success Indicators:**
- `✅ Tenants already loaded, skipping fetchTenants call`
- `⚠️ fetchTenants already in progress, skipping duplicate call`
- `🚀 [callId] fetchTenants called` (should appear only once)

**Failure Indicators:**
- `🚨 TENANT API CALL #2` or higher
- `❌ DUPLICATE TENANT API CALL DETECTED!`
- Multiple fetch call IDs for the same session

### Store State Verification:

Check the tenant store state in console:
```javascript
// Check current store state
window.useTenantStore?.getState()

// Verify tenants are loaded
window.useTenantStore?.getState()?.tenants?.length > 0
```

## Expected Fix Behavior

1. **First Load**: API call made to fetch tenants
2. **Subsequent Navigation**: Cached tenants used, no API call
3. **Component Re-mount**: Smart initialization checks cache first
4. **Back Navigation**: State preserved, no refetch needed
5. **Page Refresh**: Tenants may be refetched (acceptable)

## Troubleshooting

If tests fail:

1. Check console for specific error messages
2. Verify the `isCurrentlyFetching` flag is working
3. Look for component mount/unmount patterns
4. Check if `clearSelection()` is being called inappropriately
5. Verify the smart initialization logic in TenantStoreSelection

## Test Report Template

```
=== DUPLICATE API CALL FIX TEST REPORT ===
Date: [DATE]
Test Duration: [X] minutes
Browser: [Chrome/Firefox/Safari]

Results:
□ Scenario 1 (Fresh Login): PASS/FAIL
□ Scenario 2 (Page Refresh): PASS/FAIL  
□ Scenario 3 (Back Navigation): PASS/FAIL
□ Scenario 4 (Browser Back/Forward): PASS/FAIL
□ Scenario 5 (StrictMode): PASS/FAIL

Total Tenant API Calls: [X]
Overall Result: PASS/FAIL

Notes: [Any observations or issues]
```
