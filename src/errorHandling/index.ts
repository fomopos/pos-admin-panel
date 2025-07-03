// Error handling framework exports
// This file provides convenient imports for the error handling system

// Types
export * from '../types/error';

// Utilities
export * from '../utils/errorUtils';

// Services
export { useErrorHandler, setupGlobalErrorHandlers } from '../services/errorHandler';
export { apiService } from '../services/apiService';
export type { ApiRequestOptions, ApiResponse } from '../services/apiService';

// Hooks
export { useError, useAsyncError, useFormError } from '../hooks/useError';

// Components
export { default as ErrorBoundary, withErrorBoundary, useErrorBoundary } from '../components/ErrorBoundary';
export { default as ToastContainer } from '../components/ToastContainer';
export { default as ErrorHandlingExamples } from '../components/ErrorHandlingExamples';

// Re-export commonly used constants for convenience
import { ErrorSeverity, ErrorCategory } from '../types/error';
export { ErrorSeverity, ErrorCategory };
