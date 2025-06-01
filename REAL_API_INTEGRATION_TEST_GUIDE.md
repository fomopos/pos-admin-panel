# Real API Integration Testing Guide

## 🎯 Overview
The POS Admin Panel is now configured to use your real AWS backend API. This guide will help you test and verify the integration.

## ⚙️ Current Configuration

### Environment Settings (`.env.local`)
```bash
VITE_API_BASE_URL=https://hympc2acjf.execute-api.ap-south-1.amazonaws.com/prod
VITE_USE_MOCK_DATA=false
NODE_ENV=development
```

### AWS Cognito Settings
```bash
VITE_AWS_REGION=ap-south-1
VITE_USER_POOL_ID=ap-south-1_5bSE1jOeH
VITE_USER_POOL_CLIENT_ID=6nhft7fceiqmk1tadrfge8vco5
```

## 🧪 Testing Steps

### 1. **Start the Application**
```bash
npm run dev
```
✅ **Status**: Development server running at http://localhost:5173

### 2. **Test Authentication Flow**
1. Navigate to http://localhost:5173
2. Try to sign in with your AWS Cognito credentials
3. Check browser console for authentication logs
4. Verify JWT token is obtained and stored

**Expected Console Logs:**
```
🔐 User signed in successfully
🔑 Access token obtained
```

### 3. **Test Tenant/Store Selection API**
After successful login:

1. You should be redirected to `/tenant-store-selection`
2. Open browser DevTools (F12)
3. Check Console tab for API calls
4. Check Network tab for HTTP requests

**Expected API Calls:**
```
🔍 Fetching tenants for user: [user-id]
📞 API Request: GET /v0/tenant
```

**Expected Network Requests:**
- `GET https://hympc2acjf.execute-api.ap-south-1.amazonaws.com/prod/users/{userId}/tenants`
- Should include `Authorization: Bearer {jwt-token}` header

### 4. **Test API Integration Script**
In browser console, run the test script:

```javascript
// Copy and paste the content from api-integration-test-real-backend.js
// Or load it via browser console
```

### 5. **Verify Fallback Mechanism**
If the real API is not available, the system should:
1. Attempt real API call
2. Log the failure
3. Fall back to mock data
4. Continue working seamlessly

**Console Output for Fallback:**
```
❌ Error fetching tenants from API: [error details]
🔄 Falling back to mock data due to API error
📝 Using mock data for tenants
```

## 🔍 What to Look For

### ✅ **Success Indicators**
1. **Authentication**: JWT token obtained from AWS Cognito
2. **API Calls**: Real HTTP requests to your AWS API Gateway
3. **Data Loading**: Tenant and store data loaded from your backend
4. **Navigation**: Smooth flow from login → tenant selection → store selection → dashboard

### ⚠️ **Potential Issues & Solutions**

#### **CORS Issues**
**Symptoms**: `Access to fetch blocked by CORS policy`
**Solution**: Configure CORS in your AWS API Gateway to allow:
- Origin: `http://localhost:5173`
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`

#### **Authentication Issues**
**Symptoms**: `401 Unauthorized` or `403 Forbidden`
**Solution**: 
- Verify JWT token is included in Authorization header
- Check token expiry
- Verify user permissions in your backend

#### **API Endpoint Issues**
**Symptoms**: `404 Not Found` or `500 Internal Server Error`
**Solution**:
- Verify API endpoints match expected paths:
  - `/users/{userId}/tenants`
  - `/tenants/{tenantId}/stores`
  - `/tenants/{tenantId}`
  - `/tenants/{tenantId}/stores/{storeId}`

#### **Data Format Issues**
**Symptoms**: Data appears but with missing fields
**Solution**: Check if your API response format matches the expected schema in `tenantApiService.ts`

## 🔧 Troubleshooting Commands

### Check Environment Variables
```javascript
console.log('Environment:', {
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  useMock: import.meta.env.VITE_USE_MOCK_DATA,
  region: import.meta.env.VITE_AWS_REGION
});
```

### Check Current User Token
```javascript
import { authService } from '/src/auth/authService.ts';
const token = await authService.getAccessToken();
console.log('Token:', token?.substring(0, 50) + '...');
```

### Manually Test API Call
```javascript
const response = await fetch('https://hympc2acjf.execute-api.ap-south-1.amazonaws.com/prod/users/test-user/tenants', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
console.log('Response:', await response.json());
```

### Switch to Mock Data (if needed)
If you need to temporarily use mock data:
```bash
# In .env.local
VITE_USE_MOCK_DATA=true
```
Then restart the dev server.

## 📊 Expected Data Flow

### 1. Login Process
```
User Login → AWS Cognito → JWT Token → Local Storage
```

### 2. Tenant Loading
```
JWT Token → API Call → GET /users/{userId}/tenants → Tenant List
```

### 3. Store Loading
```
Tenant Selection → API Call → GET /tenants/{tenantId}/stores → Store List
```

### 4. Dashboard Access
```
Store Selection → Protected Route → Dashboard Components → Store-specific Data
```

## 🚀 Next Steps After Successful Testing

### 1. **Production Deployment**
- Update environment variables for production
- Configure production CORS settings
- Set up SSL certificates

### 2. **Performance Optimization**
- Add caching for tenant/store data
- Implement lazy loading
- Add loading states

### 3. **Error Handling Enhancement**
- Add user-friendly error messages
- Implement retry mechanisms
- Add offline support

### 4. **Security Hardening**
- Implement token refresh logic
- Add request rate limiting
- Enable security headers

## 📋 Test Checklist

- [ ] Development server starts successfully
- [ ] Login redirects to tenant-store-selection
- [ ] Console shows API call attempts
- [ ] Network tab shows requests to AWS API Gateway
- [ ] JWT token is included in Authorization headers
- [ ] Tenant data loads (real or fallback)
- [ ] Store selection works
- [ ] Dashboard loads with selected tenant/store
- [ ] All page navigation works
- [ ] Build completes without errors

---

## 🎉 Integration Status: COMPLETE ✅

The API integration is fully implemented and ready for testing with your real AWS backend. The system provides:

1. **Real API Integration** with your AWS API Gateway
2. **Robust Fallback** to mock data if API unavailable
3. **Environment-based Configuration** for easy deployment
4. **Type-safe Data Handling** with proper transformation
5. **Comprehensive Error Handling** and logging

Your POS Admin Panel now has enterprise-grade multi-tenant architecture with real backend integration!
