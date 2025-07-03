/**
 * Error severity levels for classification
 */
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

/**
 * Error categories for better classification
 */
export const ErrorCategory = {
  API: 'api',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NETWORK: 'network',
  RUNTIME: 'runtime',
  BUSINESS_LOGIC: 'business_logic',
  UNKNOWN: 'unknown'
} as const;

export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

/**
 * Base error interface
 */
export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  code?: string;
  details?: Record<string, any>;
  source?: string;
  userId?: string;
  tenantId?: string;
  storeId?: string;
  stack?: string;
  originalError?: Error;
}

/**
 * API Error structure
 */
export interface ApiError extends AppError {
  category: 'api';
  statusCode?: number;
  endpoint?: string;
  method?: string;
  requestId?: string;
}

/**
 * Validation Error structure
 */
export interface ValidationError extends AppError {
  category: 'validation';
  field?: string;
  value?: any;
  constraint?: string;
}

/**
 * Network Error structure
 */
export interface NetworkError extends AppError {
  category: 'network';
  isOnline?: boolean;
  timeout?: boolean;
}

/**
 * Error display options
 */
export interface ErrorDisplayOptions {
  showToast?: boolean;
  showModal?: boolean;
  autoClose?: number | false;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  persistent?: boolean;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableLogging?: boolean;
  enableReporting?: boolean;
  reportingEndpoint?: string;
  displayOptions?: ErrorDisplayOptions;
  maxRetries?: number;
  retryDelay?: number;
}
