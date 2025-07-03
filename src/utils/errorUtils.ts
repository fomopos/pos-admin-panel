import type { AppError, ApiError, ValidationError, NetworkError } from '../types/error';
import { ErrorSeverity, ErrorCategory } from '../types/error';

/**
 * Generate unique error ID
 */
export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a base AppError
 */
export function createAppError(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  options: Partial<AppError> = {}
): AppError {
  return {
    id: generateErrorId(),
    message,
    severity,
    category,
    timestamp: new Date(),
    ...options
  };
}

/**
 * Create an API error
 */
export function createApiError(
  message: string,
  statusCode?: number,
  endpoint?: string,
  method?: string,
  options: Partial<ApiError> = {}
): ApiError {
  const severity = statusCode && statusCode >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.ERROR;
  
  return {
    ...createAppError(message, severity, ErrorCategory.API, options),
    category: 'api',
    statusCode,
    endpoint,
    method,
    ...options
  } as ApiError;
}

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  field?: string,
  value?: any,
  constraint?: string,
  options: Partial<ValidationError> = {}
): ValidationError {
  return {
    ...createAppError(message, ErrorSeverity.WARNING, ErrorCategory.VALIDATION, options),
    category: 'validation',
    field,
    value,
    constraint,
    ...options
  } as ValidationError;
}

/**
 * Create a network error
 */
export function createNetworkError(
  message: string,
  isOnline: boolean = navigator.onLine,
  timeout: boolean = false,
  options: Partial<NetworkError> = {}
): NetworkError {
  return {
    ...createAppError(message, ErrorSeverity.ERROR, ErrorCategory.NETWORK, options),
    category: 'network',
    isOnline,
    timeout,
    ...options
  } as NetworkError;
}

/**
 * Parse error from unknown source
 */
export function parseError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check if it's a fetch error or network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return createNetworkError(
        'Network connection failed',
        navigator.onLine,
        false,
        { originalError: error, stack: error.stack }
      );
    }

    // Check if it's a timeout error
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return createNetworkError(
        'Request timed out',
        navigator.onLine,
        true,
        { originalError: error, stack: error.stack }
      );
    }

    // Generic runtime error
    return createAppError(
      error.message,
      ErrorSeverity.ERROR,
      ErrorCategory.RUNTIME,
      { originalError: error, stack: error.stack }
    );
  }

  if (typeof error === 'string') {
    return createAppError(error);
  }

  // Unknown error type
  return createAppError(
    'An unknown error occurred',
    ErrorSeverity.ERROR,
    ErrorCategory.UNKNOWN,
    { details: { originalError: error } }
  );
}

/**
 * Type guard to check if an object is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'id' in error &&
    'message' in error &&
    'severity' in error &&
    'category' in error &&
    'timestamp' in error
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.category) {
    case ErrorCategory.NETWORK:
      if (!(error as NetworkError).isOnline) {
        return 'You appear to be offline. Please check your internet connection.';
      }
      if ((error as NetworkError).timeout) {
        return 'The request timed out. Please try again.';
      }
      return 'Network error occurred. Please try again.';

    case ErrorCategory.AUTHENTICATION:
      return 'Authentication failed. Please sign in again.';

    case ErrorCategory.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';

    case ErrorCategory.API:
      const apiError = error as ApiError;
      if (apiError.statusCode === 404) {
        return 'The requested resource was not found.';
      }
      if (apiError.statusCode === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      if (apiError.statusCode && apiError.statusCode >= 500) {
        return 'Server error occurred. Please try again later.';
      }
      return error.message || 'An error occurred while processing your request.';

    case ErrorCategory.VALIDATION:
      return error.message || 'Please check your input and try again.';

    default:
      return error.message || 'An unexpected error occurred.';
  }
}

/**
 * Get error severity color for UI
 */
export function getErrorSeverityColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.INFO:
      return 'blue';
    case ErrorSeverity.WARNING:
      return 'yellow';
    case ErrorSeverity.ERROR:
      return 'red';
    case ErrorSeverity.CRITICAL:
      return 'purple';
    default:
      return 'gray';
  }
}

/**
 * Check if error should be retried
 */
export function shouldRetry(error: AppError, attemptCount: number = 1, maxRetries: number = 3): boolean {
  if (attemptCount >= maxRetries) {
    return false;
  }

  // Don't retry validation errors or authentication errors
  if (error.category === ErrorCategory.VALIDATION || error.category === ErrorCategory.AUTHENTICATION) {
    return false;
  }

  // Retry network errors and 5xx API errors
  if (error.category === ErrorCategory.NETWORK) {
    return true;
  }

  if (error.category === ErrorCategory.API) {
    const apiError = error as ApiError;
    return apiError.statusCode ? apiError.statusCode >= 500 : false;
  }

  return false;
}
