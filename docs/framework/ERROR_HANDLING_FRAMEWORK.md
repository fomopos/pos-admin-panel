# Global Error Handling Framework

A comprehensive error handling system for the POS Admin Panel that provides centralized error management, user-friendly notifications, and robust error recovery.

## Features

- ✅ **Centralized Error Management**: All errors flow through a single system
- ✅ **Error Classification**: Errors are categorized by severity (info, warning, error, critical) and type (API, validation, network, etc.)
- ✅ **Toast Notifications**: Beautiful, responsive toast notifications with different styles
- ✅ **Error Boundary**: React error boundary to catch component errors
- ✅ **Automatic Retry**: Smart retry logic for transient errors
- ✅ **Form Validation**: Built-in form validation with error handling
- ✅ **API Integration**: Enhanced API service with automatic error handling
- ✅ **Error Reporting**: Optional error reporting to external services
- ✅ **Global Error Handlers**: Catch unhandled errors and promise rejections

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│ Components → useError() / useAsyncError() / useFormError() │
├─────────────────────────────────────────────────────────────┤
│                  Error Handler Service                     │
│           (Zustand Store + Global Handlers)                │
├─────────────────────────────────────────────────────────────┤
│     Error Utils + Types + Enhanced API Service             │
├─────────────────────────────────────────────────────────────┤
│                  Toast Notifications                       │
│              (react-toastify integration)                  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Basic Error Handling

```tsx
import { useError } from '../hooks/useError';

function MyComponent() {
  const { showError, showSuccess, showWarning } = useError();

  const handleAction = () => {
    try {
      // Some operation
      showSuccess('Operation completed successfully!');
    } catch (error) {
      showError(error);
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### 2. API Calls with Automatic Error Handling

```tsx
import { apiService } from '../services/apiService';

function DataComponent() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      // Errors are automatically handled and displayed as toasts
      const response = await apiService.get('/api/data');
      setData(response.data);
    } catch (error) {
      // Error already handled by apiService
      console.error('Data fetch failed:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

### 3. Async Operations with Retry

```tsx
import { useAsyncError } from '../hooks/useError';

function AsyncComponent() {
  const { executeWithErrorHandling } = useAsyncError();

  const handleComplexOperation = async () => {
    const result = await executeWithErrorHandling(
      async () => {
        // Your async operation here
        const response = await fetch('/api/complex-operation');
        return response.json();
      },
      {
        retries: 3,
        onSuccess: (result) => console.log('Success:', result),
        onError: (error) => console.error('Failed:', error)
      }
    );
  };

  return <button onClick={handleComplexOperation}>Execute</button>;
}
```

### 4. Form Validation

```tsx
import { useFormError } from '../hooks/useError';

function FormComponent() {
  const { validateField, validateForm } = useFormError();
  const [formData, setFormData] = useState({ email: '', name: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData, {
      email: { 
        required: true, 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
      },
      name: { 
        required: true, 
        minLength: 2 
      }
    });

    if (Object.keys(errors).length === 0) {
      // Form is valid
      submitForm(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
      />
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 5. Error Boundary Usage

```tsx
import ErrorBoundary from '../components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyApplication />
    </ErrorBoundary>
  );
}

// Or with HOC
import { withErrorBoundary } from '../components/ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent);
```

## Error Types and Severity

### Severity Levels

- **INFO**: Informational messages (blue)
- **WARNING**: Non-critical issues (yellow)
- **ERROR**: Standard errors (red)
- **CRITICAL**: Critical errors requiring immediate attention (purple, persistent)

### Error Categories

- **API**: Server/API related errors
- **VALIDATION**: Input validation errors
- **NETWORK**: Network connectivity issues
- **AUTHENTICATION**: Auth related errors
- **AUTHORIZATION**: Permission errors
- **RUNTIME**: JavaScript runtime errors
- **BUSINESS_LOGIC**: Application logic errors

## Configuration

### Error Handler Configuration

```tsx
import { useErrorHandler } from '../services/errorHandler';

// Update error handler configuration
const { updateConfig } = useErrorHandler();

updateConfig({
  enableLogging: true,
  enableReporting: true,
  reportingEndpoint: 'https://api.example.com/errors',
  displayOptions: {
    showToast: true,
    position: 'top-right',
    autoClose: 5000
  },
  maxRetries: 3,
  retryDelay: 1000
});
```

### API Service Configuration

```tsx
import { apiService } from '../services/apiService';

// Configure base URL
apiService.setBaseUrl('https://api.example.com');

// Set authentication token
apiService.setAuthToken('your-jwt-token');

// Set default headers
apiService.setDefaultHeaders({
  'X-Client-Version': '1.0.0'
});
```

## Advanced Usage

### Custom Error Types

```tsx
import { createAppError, ErrorSeverity, ErrorCategory } from '../utils/errorUtils';

const customError = createAppError(
  'Custom business logic error',
  ErrorSeverity.ERROR,
  ErrorCategory.BUSINESS_LOGIC,
  {
    details: { userId: '123', operation: 'updateProfile' },
    source: 'ProfileComponent'
  }
);
```

### Manual Error Reporting

```tsx
import { useErrorHandler } from '../services/errorHandler';

const { reportError } = useErrorHandler();

// Report an error manually
await reportError(customError);
```

### Retry with Custom Logic

```tsx
import { useErrorHandler } from '../services/errorHandler';

const { retryWithError } = useErrorHandler();

try {
  const result = await retryWithError(
    () => riskyOperation(),
    someError,
    3 // max retries
  );
} catch (finalError) {
  // All retries failed
}
```

## Best Practices

1. **Use the appropriate severity level** for different types of errors
2. **Provide meaningful error messages** that users can understand
3. **Include context** in error details for debugging
4. **Don't overuse critical errors** - reserve for truly critical issues
5. **Test error scenarios** during development
6. **Monitor error rates** in production
7. **Implement proper fallbacks** for critical operations

## Error Display Examples

### Toast Notifications
- **Info**: "Data saved successfully" (blue gradient)
- **Warning**: "This action cannot be undone" (yellow gradient)
- **Error**: "Failed to save data" (red gradient)
- **Critical**: "System error - contact support" (purple gradient, persistent)

### Error Boundary Fallback
- Displays a user-friendly error message
- Shows technical details in development mode
- Provides "Try Again" and "Refresh Page" buttons
- Automatically reports the error if reporting is enabled

## Integration with Existing Code

The error handling system integrates seamlessly with existing code:

1. **Tenant Store**: Updated to use the new error handling system
2. **API Calls**: All API calls can use the enhanced API service
3. **Components**: Any component can use the error hooks
4. **Global Errors**: Unhandled errors are automatically caught

## File Structure

```
src/
├── types/
│   └── error.ts                 # Error types and interfaces
├── utils/
│   └── errorUtils.ts           # Error utility functions
├── services/
│   ├── errorHandler.ts         # Main error handler service
│   └── apiService.ts           # Enhanced API service
├── hooks/
│   └── useError.ts            # Error handling hooks
├── components/
│   ├── ErrorBoundary.tsx       # Error boundary component
│   ├── ToastContainer.tsx      # Toast container setup
│   └── ErrorHandlingExamples.tsx # Usage examples
└── App.tsx                    # Main app with error setup
```

## Dependencies

- `react-toastify`: Toast notifications
- `zustand`: State management for error handler
- `react`: Error boundary and hooks

## Testing Error Handling

The `ErrorHandlingExamples` component provides comprehensive examples and testing scenarios for all error handling features. Import and use it during development:

```tsx
import ErrorHandlingExamples from '../components/ErrorHandlingExamples';

// Add to your routes for testing
<Route path="/error-examples" element={<ErrorHandlingExamples />} />
```

## Troubleshooting

### Common Issues

1. **Toasts not appearing**: Ensure `ToastContainer` is included in your app
2. **Styles not applied**: Import toast CSS in your main CSS file
3. **Error boundary not catching**: Make sure it wraps the problematic component
4. **API errors not handled**: Check if you're using the enhanced API service

### Debug Mode

Enable detailed error logging in development:

```tsx
// In your app initialization
if (process.env.NODE_ENV === 'development') {
  useErrorHandler.getState().updateConfig({
    enableLogging: true
  });
}
```
