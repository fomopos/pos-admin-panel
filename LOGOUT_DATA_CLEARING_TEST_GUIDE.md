# Logout Data Clearing - Manual Test Guide

## Objective
Verify that when a user logs out, all tenant/store data is properly cleared from both the Zustand store and localStorage.

## Prerequisites
- Development server running on http://localhost:5177
- Application loaded in browser
- Browser developer tools open (F12)

## Test Steps

### Step 1: Check Initial State
1. Open browser developer tools (F12)
2. Go to **Console** tab
3. Check localStorage: `localStorage.getItem('tenant-storage')`
4. Take note of any existing data

### Step 2: Login/Load Data
1. If not logged in, proceed with login
2. Navigate through the app to load tenant/store data
3. Go to Dashboard page to see the **Logout Test Component** (should appear in development mode)

### Step 3: Verify Data is Present
In browser console, check if data is loaded:
```javascript
// Check localStorage
console.log('LocalStorage:', localStorage.getItem('tenant-storage'));

// Check Zustand store (if available)
if (window.useTenantStore) {
  const state = window.useTenantStore.getState();
  console.log('Zustand State:', {
    tenants: state.tenants?.length || 0,
    currentTenant: state.currentTenant?.name || null,
    currentStore: state.currentStore?.store_name || null
  });
}
```

### Step 4: Test Logout Data Clearing
Choose one of these methods:

#### Method A: Using Test Component (Recommended)
1. Scroll down to see the **🧪 Logout Data Clearing Test Component**
2. Click **"🚪 Test Full Logout"** button
3. Observe the test results in the component

#### Method B: Manual Console Testing
In browser console:
```javascript
// Test manual data clearing
if (window.testManualDataClearing) {
  window.testManualDataClearing();
}

// Or test full logout
if (window.testLogoutDataClearing) {
  window.testLogoutDataClearing();
}
```

#### Method C: Real Logout Flow
1. Find the logout button in the UI (usually in user profile menu)
2. Click logout
3. Verify redirect to login page

### Step 5: Verify Data is Cleared
After logout, check that data is cleared:

```javascript
// Check localStorage is cleared
const tenantStorage = localStorage.getItem('tenant-storage');
console.log('Post-logout localStorage:', tenantStorage);

if (tenantStorage) {
  const parsed = JSON.parse(tenantStorage);
  const isCleared = (
    (!parsed.state?.tenants || parsed.state.tenants.length === 0) &&
    !parsed.state?.currentTenant &&
    !parsed.state?.currentStore
  );
  console.log('LocalStorage cleared:', isCleared);
}

// Check Zustand store is cleared
if (window.useTenantStore) {
  const state = window.useTenantStore.getState();
  const isCleared = (
    (!state.tenants || state.tenants.length === 0) &&
    !state.currentTenant &&
    !state.currentStore
  );
  console.log('Zustand store cleared:', isCleared);
  console.log('Current state:', {
    tenants: state.tenants?.length || 0,
    currentTenant: state.currentTenant?.name || null,
    currentStore: state.currentStore?.store_name || null,
    isLoading: state.isLoading,
    error: state.error
  });
}
```

## Expected Results

### ✅ Success Criteria
- [ ] localStorage `tenant-storage` should be cleared or contain empty arrays/null values
- [ ] Zustand store should have:
  - `tenants: []` (empty array)
  - `currentTenant: null`
  - `currentStore: null`
  - `isLoading: false`
  - `error: null`
- [ ] Console shows the logout clearing message: "🧹 Clearing all tenant store data on logout"
- [ ] Console shows the auth service message: "🚪 Signing out user and clearing all cached data"

### ❌ Failure Indicators
- localStorage still contains tenant/store data after logout
- Zustand store still has tenants, currentTenant, or currentStore populated
- No clearing messages in console
- Error messages during logout process

## Troubleshooting

### If data is not clearing:
1. Check console for error messages
2. Verify `clearAllData()` method exists in tenant store
3. Verify auth service is calling `clearAllData()` before signOut
4. Check if localStorage is being manually cleared elsewhere

### If logout is not working:
1. Check AWS Amplify configuration
2. Verify auth service implementation
3. Check network requests in Developer Tools

### If test component is not visible:
1. Ensure you're in development mode (`npm run dev`)
2. Check Dashboard.tsx includes the LogoutTestComponent
3. Navigate to `/dashboard` route

## Console Commands Reference

```javascript
// Quick test commands
window.runLogoutTest?.();                    // Run comprehensive test
window.testLogoutDataClearing?.();          // Test logout clearing
window.testManualDataClearing?.();          // Test manual clearing
window.checkLocalStorage?.();               // Check localStorage state
window.checkZustandState?.();               // Check Zustand state

// Direct store access
window.useTenantStore?.getState();          // Get current state
window.useTenantStore?.getState().clearAllData(); // Manual clear

// Auth service access
window.authService?.signOut();              // Manual logout
```

## Implementation Verification

The following code should be present in your implementation:

### In `tenantStore.ts`:
```typescript
clearAllData: () => {
  console.log('🧹 Clearing all tenant store data on logout');
  set({ 
    tenants: [],
    currentTenant: null,
    currentStore: null,
    isLoading: false,
    error: null
  });
},
```

### In `authService.ts`:
```typescript
async signOut() {
  try {
    console.log('🚪 Signing out user and clearing all cached data');
    
    // Clear all tenant store data before signing out
    const { clearAllData } = useTenantStore.getState();
    clearAllData();
    
    await signOut();
    console.log('✅ User signed out and data cleared successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
```

---

**Note**: This test verifies the core functionality implemented to resolve the data persistence issue during logout. The implementation ensures that cached tenant/store data is properly cleared when users sign out, preventing data leakage between user sessions.
