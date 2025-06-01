# Hierarchical Architecture Testing Guide

## Overview
This document provides step-by-step instructions to test the new hierarchical Tenant → Store → Users architecture that was implemented in the POS Admin Panel.

## Test Credentials
- **Email**: `pratyushharsh2015@gmail.com`
- **Password**: `Welcome@2023`

## Mock Data Structure
The system now includes the following test data:

### Tenants (Organizations)
1. **Spice Garden Group** (ID: 272e)
   - Status: Active
   - Plan: Premium
   - Contact: admin@spicegarden.com
   
2. **Coffee Hub Group** (ID: abc123)
   - Status: Active  
   - Plan: Basic
   - Contact: admin@coffeehub.com

### Stores
**Under Spice Garden Group:**
- Spice Garden - MG Road (Type: Restaurant, Location: Bangalore)
- Spice Garden - Brigade Road (Type: Restaurant, Location: Bangalore)

**Under Coffee Hub Group:**
- Coffee Hub - Koramangala (Type: Cafe, Location: Bangalore)

## Testing Steps

### 1. Login Test
1. Navigate to `http://localhost:5173/`
2. Enter the test credentials:
   - Email: `pratyushharsh2015@gmail.com`
   - Password: `Welcome@2023`
3. Click "Sign In"
4. **Expected Result**: Successfully logged in and redirected to dashboard

### 2. Hierarchical Interface Test

#### Step 2.1: Verify Organization Selector
1. On the dashboard, look at the left sidebar
2. Find the "Organization" selector (has BuildingOffice icon)
3. **Expected Result**: 
   - Should show "Select Organization" initially
   - Button should be clickable with a dropdown arrow

#### Step 2.2: Test Organization Selection
1. Click the Organization selector
2. **Expected Result**: Dropdown should show:
   - "Spice Garden Group" 
   - "Coffee Hub Group"
3. Select "Spice Garden Group"
4. **Expected Result**: 
   - Organization selector now shows "Spice Garden Group"
   - Store selector should appear below it

#### Step 2.3: Test Store Selection
1. After selecting an organization, find the "Store" selector (has BuildingStorefront icon)
2. Click the Store selector
3. **Expected Result**: Dropdown should show Spice Garden stores:
   - "Spice Garden - MG Road" (Restaurant)
   - "Spice Garden - Brigade Road" (Restaurant)
4. Select "Spice Garden - MG Road"
5. **Expected Result**: Store selector shows "Spice Garden - MG Road"

#### Step 2.4: Test Organization Switching
1. Click the Organization selector again
2. Select "Coffee Hub Group"
3. **Expected Result**:
   - Organization changes to "Coffee Hub Group"
   - Store selector resets to "Select Store"
   - When clicking store selector, only shows "Coffee Hub - Koramangala"

### 3. Component Integration Test

#### Step 3.1: User Management
1. Navigate to "Settings" → "User Management"
2. **Expected Result**: 
   - Page loads successfully
   - Any user data should be filtered by the currently selected store
   - Components should reference `currentStore?.store_id` instead of `currentTenant?.store_id`

#### Step 3.2: Product Management  
1. Navigate to "Inventory" → "Products"
2. Try to edit any product
3. **Expected Result**:
   - Product edit form loads
   - Form uses the currently selected store context
   - No console errors related to store_id

### 4. State Persistence Test
1. Select "Spice Garden Group" and "MG Road" store
2. Refresh the browser page
3. **Expected Result**: 
   - Selection should persist after refresh
   - Both organization and store should remain selected

### 5. Navigation Test
1. With a tenant and store selected, navigate between different pages:
   - Dashboard
   - Products
   - User Management
   - Settings
2. **Expected Result**: 
   - Selected tenant and store remain consistent across all pages
   - No errors in browser console

## Expected Interface Layout

```
Sidebar:
┌─────────────────────────────────────────┐
│ 🏢 Organization: Spice Garden Group  ▼ │
│ 🏪 Store: Spice Garden - MG Road     ▼ │
├─────────────────────────────────────────┤
│ Navigation Menu Items...                │
└─────────────────────────────────────────┘
```

## Automated Testing

You can also run the automated test script in the browser console:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Copy and paste the content of `test-hierarchical-final.js`
4. Run `testHierarchicalArchitecture()` 

## Verification Checklist

- [ ] Login with provided credentials works
- [ ] Organization selector appears and functions correctly
- [ ] Store selector appears only after organization selection
- [ ] Store selector shows correct stores for selected organization
- [ ] Organization switching resets store selection
- [ ] State persists across page refreshes
- [ ] Navigation maintains selected context
- [ ] User Management uses `currentStore?.store_id`
- [ ] Product Edit uses `currentStore?.store_id`
- [ ] No console errors during normal usage
- [ ] UI is responsive and user-friendly

## Common Issues & Troubleshooting

### Issue: "Select Organization" doesn't show options
- **Solution**: Check if user is properly authenticated and tenants are loaded

### Issue: Store selector doesn't appear
- **Solution**: Ensure an organization is selected first

### Issue: State doesn't persist
- **Solution**: Check browser's localStorage for 'tenant-storage' key

### Issue: Components show errors
- **Solution**: Verify components are using `currentStore?.store_id` instead of `currentTenant?.store_id`

## Browser Console Commands

To inspect the current state:
```javascript
// Check current tenant and store
const state = window.useTenantStore?.getState?.();
console.log('Current Tenant:', state?.currentTenant);
console.log('Current Store:', state?.currentStore);

// Check all available tenants
console.log('All Tenants:', state?.tenants);
```

## Success Criteria

✅ **Architecture Implementation Complete** if:
1. Two-level hierarchy (Organization → Store) is functional
2. Components properly use store context instead of tenant context
3. State management correctly handles tenant and store separately
4. UI clearly shows the hierarchical relationship
5. No breaking changes to existing functionality
6. Proper error handling and user feedback

## Report Issues

If any test fails or unexpected behavior occurs:
1. Note the exact steps that led to the issue
2. Check browser console for errors
3. Take screenshots of any UI problems
4. Document the expected vs actual behavior
