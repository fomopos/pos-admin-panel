# API Error Handling Before vs After Comparison

## Before (Legacy Error Handling)

### API Error Response
```javascript
// Old format - inconsistent structure
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR", // String, not standardized
  "details": "Some generic error details" // Unstructured
}
```

### Component Error Handling (CreateStore)
```typescript
// Old error handling - generic and unhelpful
catch (error) {
  setErrors({ submit: 'Failed to create store. Please try again.' });
}
```

### User Experience
- ❌ Generic error messages
- ❌ No field-specific guidance  
- ❌ Users don't know what to fix
- ❌ Poor form validation UX

---

## After (New Structured Error Handling)

### API Error Response
```json
{
  "code": 1101,
  "slug": "VALIDATION_FAILED",
  "message": "Validation failed for one or more fields.",
  "details": {
    "latitude": "Validation failed on latitude",
    "location_type": "Must be one of: physical, standalone, cloud, mobile, retail, warehouse, outlet, kiosk, online, popup",
    "longitude": "Validation failed on longitude"
  }
}
```

### Component Error Handling (CreateStore)
```typescript
// New structured error handling - specific and actionable
catch (error: any) {
  console.error('Store creation failed:', error);
  
  // Handle structured API errors with field-specific validation
  if (error?.code && error?.slug && error?.details) {
    const fieldErrors: Record<string, string> = {};
    
    // Map API field errors to form field errors
    if (error.details) {
      Object.entries(error.details).forEach(([apiField, message]) => {
        const formField = mapApiFieldToFormField(apiField);
        fieldErrors[formField] = message as string;
      });
    }
    
    // Set field-specific errors and general error message
    setErrors({
      ...fieldErrors,
      submit: error.getDisplayMessage ? error.getDisplayMessage() : error.message
    });
  } else {
    // Fallback for non-structured errors
    setErrors({ 
      submit: error?.message || 'Failed to create store. Please try again.' 
    });
  }
}
```

### Form Error Display
```typescript
// Errors object now contains field-specific errors
errors = {
  "latitude": "Validation failed on latitude",
  "location_type": "Must be one of: physical, standalone, cloud, mobile, retail, warehouse, outlet, kiosk, online, popup", 
  "longitude": "Validation failed on longitude",
  "submit": "Validation failed for one or more fields.\n\nlatitude: Validation failed on latitude\nlocation_type: Must be one of: physical, standalone, cloud, mobile, retail, warehouse, outlet, kiosk, online, popup\nlongitude: Validation failed on longitude"
}
```

### User Experience
- ✅ **Field-specific error messages** - Users see exactly which fields have issues
- ✅ **Actionable guidance** - Error messages explain what values are acceptable
- ✅ **Visual field highlighting** - Form fields with errors are highlighted  
- ✅ **Comprehensive error summary** - Main error message shows all issues
- ✅ **Better form validation UX** - Users can fix issues efficiently

---

## Key Improvements

### 1. Error Structure Standardization
```typescript
// Before: Inconsistent error structure
interface OldApiErrorResponse {
  message: string;
  code?: string; // Could be string or missing
  details?: any; // Unstructured
}

// After: Consistent, structured format
interface ApiErrorResponse {
  code: number;        // Always numeric, standardized ranges
  slug: string;        // Human-readable error type
  message: string;     // User-friendly main message
  details?: Record<string, string>; // Structured field errors
}
```

### 2. Enhanced ApiError Class
```typescript
export class ApiError extends Error {
  public code?: number;
  public slug?: string;
  public details?: Record<string, string>;

  // NEW: Format error for user display with field details
  public getDisplayMessage(): string {
    if (this.details && Object.keys(this.details).length > 0) {
      const fieldErrors = Object.entries(this.details)
        .map(([field, error]) => `${field}: ${error}`)
        .join('\n');
      return `${this.message}\n\n${fieldErrors}`;
    }
    return this.message;
  }

  // NEW: Extract validation errors for form field mapping
  public getValidationErrors(): Record<string, string> {
    return this.details || {};
  }
}
```

### 3. Smart Field Mapping
```typescript
// NEW: Maps API field names to form field names
const mapApiFieldToFormField = (apiField: string): string => {
  const fieldMap: Record<string, string> = {
    'store_name': 'store_name',
    'location_type': 'location_type',
    'latitude': 'latitude',
    'longitude': 'longitude',
    // Address fields with nested mapping
    'address1': 'address.address1',
    'city': 'address.city',
    'state': 'address.state',
    'postal_code': 'address.postal_code',
    'country': 'address.country',
  };
  
  return fieldMap[apiField] || apiField;
};
```

### 4. Service Layer Error Handling
```typescript
// NEW: Enhanced error handling in all services
private handleError(error: any): Error {
  // Check if it's already our structured ApiError
  if (error.name === 'ApiError') {
    return error;
  }
  
  // Handle HTTP response errors with new error format
  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Parse new structured format
    if (errorData.code && errorData.slug && errorData.message) {
      return new ApiError(
        errorData.message,
        errorData.code,
        errorData.slug,
        errorData.details
      );
    }
  }
  
  // Fallback handling...
}
```

---

## Impact Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Error Messages** | Generic, unhelpful | Specific, actionable |
| **Field Validation** | No field-specific errors | Field-specific error highlighting |
| **User Guidance** | "Something went wrong" | "Location type must be one of: retail, warehouse..." |
| **Developer Experience** | Hard to debug | Clear error codes and structured data |
| **User Experience** | Frustrating, unclear | Helpful, guides user to solution |
| **Error Consistency** | Inconsistent across services | Standardized across entire app |

The new error handling system transforms the user experience from frustrating and unclear to helpful and actionable, while providing developers with structured, debuggable error information.
