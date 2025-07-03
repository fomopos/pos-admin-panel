import React, { useState } from 'react';
import { useError, useAsyncError, useFormError } from '../hooks/useError';
import { apiService } from '../services/apiService';

/**
 * Example component demonstrating various error handling patterns
 */
export const ErrorHandlingExamples: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Basic error handling hook
  const {
    showInfo,
    showWarning,
    showErrorMessage,
    showCritical,
    showSuccess,
    showApiError,
    showValidationError,
    showNetworkError
  } = useError();

  // Async operation error handling hook
  const { executeWithErrorHandling } = useAsyncError();

  // Form validation error handling hook
  const { validateField, validateForm } = useFormError();

  // Example 1: Manual error triggering
  const handleManualErrors = () => {
    showInfo('This is an informational message');
    
    setTimeout(() => {
      showWarning('This is a warning message');
    }, 1000);
    
    setTimeout(() => {
      showErrorMessage('This is an error message');
    }, 2000);
    
    setTimeout(() => {
      showSuccess('Operation completed successfully!');
    }, 3000);
  };

  // Example 2: API call with automatic error handling
  const handleApiCall = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiService.get('/api/example-endpoint');
      showSuccess('Data fetched successfully!');
      console.log('API Response:', response.data);
    } catch (error) {
      // Error is automatically handled by the apiService
      console.error('API call failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Example 3: API call with custom error handling
  const handleCustomApiCall = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiService.get('/api/custom-endpoint', {
        suppressErrorToast: true // Suppress automatic toast
      });
      showSuccess('Custom API call succeeded!');
      console.log('Custom API Response:', response.data);
    } catch (error) {
      // Handle error manually
      showApiError(
        'Custom error message for this specific API call',
        (error as any)?.statusCode,
        '/api/custom-endpoint',
        'GET'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Example 4: Async operation with retry
  const handleAsyncWithRetry = async () => {
    setIsLoading(true);
    
    const result = await executeWithErrorHandling(
      async () => {
        // Simulate an operation that might fail
        const random = Math.random();
        if (random < 0.7) {
          throw new Error('Random failure for demonstration');
        }
        return { data: 'Success!' };
      },
      {
        retries: 3,
        onSuccess: (result) => {
          showSuccess(`Operation succeeded: ${result.data}`);
        },
        onError: (error) => {
          console.error('Operation failed after retries:', error);
        }
      }
    );
    
    setIsLoading(false);
    console.log('Final result:', result);
  };

  // Example 5: Form validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate individual fields (errors are shown automatically)
    validateField(formData.name, 'Name', {
      required: true,
      minLength: 2,
      maxLength: 50
    });
    
    validateField(formData.email, 'Email', {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    });
    
    validateField(formData.phone, 'Phone', {
      required: true,
      pattern: /^\+?[\d\s-()]+$/,
      minLength: 10
    });
    
    // Or validate the entire form at once
    const formErrors = validateForm(formData, {
      name: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      phone: { required: true, pattern: /^\+?[\d\s-()]+$/, minLength: 10 }
    });
    
    if (Object.keys(formErrors).length === 0) {
      showSuccess('Form validation passed!');
      console.log('Form data:', formData);
    } else {
      console.log('Form validation errors:', formErrors);
    }
  };

  // Example 6: Network error simulation
  const handleNetworkError = () => {
    showNetworkError(
      'Failed to connect to server',
      navigator.onLine,
      false
    );
  };

  // Example 7: Critical error
  const handleCriticalError = () => {
    showCritical('Critical system error occurred! Please contact support.');
  };

  // Example 8: Simulate validation error
  const handleValidationError = () => {
    showValidationError(
      'The email address format is invalid',
      'email',
      'invalid-email',
      'format'
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Error Handling System Examples
        </h1>
        
        {/* Manual Error Examples */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            1. Manual Error Triggering
          </h2>
          <button
            onClick={handleManualErrors}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Show Different Error Types
          </button>
        </div>

        {/* API Call Examples */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            2. API Calls with Error Handling
          </h2>
          <div className="space-x-4">
            <button
              onClick={handleApiCall}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Standard API Call
            </button>
            <button
              onClick={handleCustomApiCall}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Custom Error Handling
            </button>
          </div>
        </div>

        {/* Async with Retry */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            3. Async Operations with Retry
          </h2>
          <button
            onClick={handleAsyncWithRetry}
            disabled={isLoading}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            Execute with Auto-Retry
          </button>
        </div>

        {/* Form Validation */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            4. Form Validation with Error Handling
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Validate Form
            </button>
          </form>
        </div>

        {/* Specific Error Types */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            5. Specific Error Types
          </h2>
          <div className="space-x-4">
            <button
              onClick={handleNetworkError}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Network Error
            </button>
            <button
              onClick={handleValidationError}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            >
              Validation Error
            </button>
            <button
              onClick={handleCriticalError}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
            >
              Critical Error
            </button>
          </div>
        </div>

        {/* Error Status */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Error Handling Guide */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Error Handling Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Use <code>useError()</code> hook for manual error handling</li>
          <li>• Use <code>useAsyncError()</code> for async operations with retry logic</li>
          <li>• Use <code>useFormError()</code> for form validation</li>
          <li>• API errors are automatically handled by the enhanced API service</li>
          <li>• Wrap components with <code>ErrorBoundary</code> to catch React errors</li>
          <li>• Critical errors are persistent and require user action</li>
          <li>• Network errors show different messages based on connectivity</li>
          <li>• All errors are automatically logged and can be reported to external services</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorHandlingExamples;
