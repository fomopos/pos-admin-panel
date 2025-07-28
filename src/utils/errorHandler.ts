// Error handling utilities for API responses
// Following the CRUD Operations Implementation Guide patterns

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface ValidationErrors {
  [field: string]: string | undefined;
}

/**
 * Handle API errors and return user-friendly messages
 * @param error - The error object from API call
 * @param defaultMessage - Default error message if no specific handling
 * @returns Object with errorMessage and optional field errors
 */
export const handleApiError = (
  error: any,
  defaultMessage: string = 'An error occurred. Please try again.'
): { errorMessage: string; fieldErrors?: ValidationErrors } => {
  console.error('API Error:', error);

  // Network and connection errors
  if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return {
      errorMessage: 'Network connection error. Please check your internet connection.'
    };
  }

  // Request timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      errorMessage: 'Request timed out. Please try again.'
    };
  }

  // HTTP response errors
  if (error?.response) {
    const status = error.response.status;
    const data: ApiErrorResponse = error.response.data || {};

    switch (status) {
      case 400:
        return {
          errorMessage: data.message || 'Invalid data provided. Please check your input.'
        };

      case 401:
        return {
          errorMessage: 'Authentication required. Please sign in again.'
        };

      case 403:
        return {
          errorMessage: 'You do not have permission to perform this action.'
        };

      case 404:
        return {
          errorMessage: 'The requested resource was not found.'
        };

      case 409:
        return {
          errorMessage: data.message || 'A conflict occurred. The resource may already exist.'
        };

      case 422:
        // Validation errors
        if (data.errors) {
          const fieldErrors: ValidationErrors = {};
          
          // Map server validation errors to form fields
          Object.keys(data.errors).forEach(field => {
            if (data.errors![field] && Array.isArray(data.errors![field])) {
              fieldErrors[field] = data.errors![field][0];
            }
          });

          return {
            errorMessage: 'Please fix the validation errors below.',
            fieldErrors
          };
        }
        return {
          errorMessage: data.message || 'Validation failed. Please check your input.'
        };

      case 429:
        return {
          errorMessage: 'Too many requests. Please wait a moment and try again.'
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          errorMessage: 'Server error occurred. Please try again later.'
        };

      default:
        return {
          errorMessage: data.message || defaultMessage
        };
    }
  }

  // Generic JavaScript errors
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return {
        errorMessage: 'Network error. Please check your connection.'
      };
    }
    return {
      errorMessage: error.message || defaultMessage
    };
  }

  return {
    errorMessage: defaultMessage
  };
};

/**
 * Extract field-specific validation errors from server response
 * @param serverErrors - Validation errors from server
 * @returns Formatted field errors for form display
 */
export const extractFieldErrors = (serverErrors: Record<string, string[]>): ValidationErrors => {
  const fieldErrors: ValidationErrors = {};
  
  Object.keys(serverErrors).forEach(field => {
    if (serverErrors[field] && Array.isArray(serverErrors[field])) {
      fieldErrors[field] = serverErrors[field][0];
    }
  });
  
  return fieldErrors;
};

/**
 * Determine if an error is a network/connection issue
 * @param error - The error object
 * @returns True if it's a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    !navigator.onLine ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network')
  );
};

/**
 * Determine if an error is a validation error (422)
 * @param error - The error object
 * @returns True if it's a validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 422;
};

/**
 * Get error message for different contexts
 * @param context - The context where error occurred (create, update, delete, fetch)
 * @param resourceName - Name of the resource (user, product, etc.)
 * @returns Contextual error message
 */
export const getContextualErrorMessage = (
  context: 'create' | 'update' | 'delete' | 'fetch',
  resourceName: string
): string => {
  const actions = {
    create: `create ${resourceName}`,
    update: `update ${resourceName}`,
    delete: `delete ${resourceName}`,
    fetch: `load ${resourceName}`
  };

  return `Failed to ${actions[context]}. Please try again.`;
};
