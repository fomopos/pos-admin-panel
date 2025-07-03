import { useCallback } from 'react';
import type { AppError, ErrorDisplayOptions } from '../types/error';
import { ErrorSeverity, ErrorCategory } from '../types/error';
import { createAppError, createApiError, createValidationError, createNetworkError } from '../utils/errorUtils';
import { useErrorHandler } from '../services/errorHandler';

/**
 * Hook for convenient error handling in components
 */
export function useError() {
  const { handleError, clearError, clearAllErrors } = useErrorHandler();

  // Generic error handler
  const showError = useCallback((
    error: unknown,
    options?: ErrorDisplayOptions
  ) => {
    return handleError(error, options);
  }, [handleError]);

  // Specific error type handlers
  const showInfo = useCallback((
    message: string,
    options?: Omit<ErrorDisplayOptions, 'severity'>
  ) => {
    const infoError = createAppError(message, ErrorSeverity.INFO, ErrorCategory.UNKNOWN);
    return handleError(infoError, options);
  }, [handleError]);

  const showWarning = useCallback((
    message: string,
    options?: Omit<ErrorDisplayOptions, 'severity'>
  ) => {
    const warningError = createAppError(message, ErrorSeverity.WARNING, ErrorCategory.UNKNOWN);
    return handleError(warningError, options);
  }, [handleError]);

  const showErrorMessage = useCallback((
    message: string,
    options?: Omit<ErrorDisplayOptions, 'severity'>
  ) => {
    const error = createAppError(message, ErrorSeverity.ERROR, ErrorCategory.UNKNOWN);
    return handleError(error, options);
  }, [handleError]);

  const showCritical = useCallback((
    message: string,
    options?: Omit<ErrorDisplayOptions, 'severity'>
  ) => {
    const criticalError = createAppError(message, ErrorSeverity.CRITICAL, ErrorCategory.UNKNOWN);
    return handleError(criticalError, { ...options, persistent: true });
  }, [handleError]);

  // API error handler
  const showApiError = useCallback((
    message: string,
    statusCode?: number,
    endpoint?: string,
    method?: string,
    options?: ErrorDisplayOptions
  ) => {
    const apiError = createApiError(message, statusCode, endpoint, method);
    return handleError(apiError, options);
  }, [handleError]);

  // Validation error handler
  const showValidationError = useCallback((
    message: string,
    field?: string,
    value?: any,
    constraint?: string,
    options?: ErrorDisplayOptions
  ) => {
    const validationError = createValidationError(message, field, value, constraint);
    return handleError(validationError, options);
  }, [handleError]);

  // Network error handler
  const showNetworkError = useCallback((
    message: string,
    isOnline?: boolean,
    timeout?: boolean,
    options?: ErrorDisplayOptions
  ) => {
    const networkError = createNetworkError(message, isOnline, timeout);
    return handleError(networkError, options);
  }, [handleError]);

  // Success message (using info severity)
  const showSuccess = useCallback((
    message: string,
    options?: Omit<ErrorDisplayOptions, 'severity'>
  ) => {
    const successError = createAppError(message, ErrorSeverity.INFO, ErrorCategory.UNKNOWN);
    return handleError(successError, options);
  }, [handleError]);

  return {
    // Generic handlers
    showError,
    showInfo,
    showWarning,
    showErrorMessage,
    showCritical,
    showSuccess,
    
    // Specific error type handlers
    showApiError,
    showValidationError,
    showNetworkError,
    
    // Management functions
    clearError,
    clearAllErrors,
  };
}

/**
 * Hook for async operation error handling with automatic retry
 */
export function useAsyncError() {
  const { handleError, retryWithError } = useErrorHandler();
  const error = useError();

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      onError?: (error: AppError) => void;
      onSuccess?: (result: T) => void;
      suppressErrorToast?: boolean;
      retries?: number;
      context?: Record<string, any>;
    }
  ): Promise<T | null> => {
    try {
      const result = await operation();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const appError = handleError(err, { 
        showToast: !options?.suppressErrorToast 
      });
      
      if (options?.onError) {
        options.onError(appError);
      }
      
      // Try to retry if applicable
      if (options?.retries && options.retries > 0) {
        try {
          return await retryWithError(operation, appError, options.retries);
        } catch (retryError) {
          // Final failure after retries
          const finalError = handleError(retryError, { 
            showToast: !options?.suppressErrorToast 
          });
          
          if (options?.onError) {
            options.onError(finalError);
          }
          
          return null;
        }
      }
      
      return null;
    }
  }, [handleError, retryWithError]);

  return {
    ...error,
    executeWithErrorHandling,
  };
}

/**
 * Hook for form validation errors
 */
export function useFormError() {
  const { showValidationError } = useError();

  const validateField = useCallback((
    value: any,
    fieldName: string,
    rules: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      custom?: (value: any) => string | null;
    }
  ): string | null => {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      const message = `${fieldName} is required`;
      showValidationError(message, fieldName, value, 'required');
      return message;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      const message = `${fieldName} must be at least ${rules.minLength} characters`;
      showValidationError(message, fieldName, value, 'minLength');
      return message;
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      const message = `${fieldName} must not exceed ${rules.maxLength} characters`;
      showValidationError(message, fieldName, value, 'maxLength');
      return message;
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      const message = `${fieldName} format is invalid`;
      showValidationError(message, fieldName, value, 'pattern');
      return message;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        showValidationError(customError, fieldName, value, 'custom');
        return customError;
      }
    }

    return null;
  }, [showValidationError]);

  const validateForm = useCallback((
    formData: Record<string, any>,
    validationRules: Record<string, Parameters<typeof validateField>[2]>
  ): Record<string, string> => {
    const errors: Record<string, string> = {};

    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const error = validateField(formData[fieldName], fieldName, rules);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }, [validateField]);

  return {
    validateField,
    validateForm,
    showValidationError,
  };
}

export default useError;
