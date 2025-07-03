import { create } from 'zustand';
import { toast } from 'react-toastify';
import type { AppError, ErrorDisplayOptions, ErrorHandlerConfig } from '../types/error';
import { ErrorSeverity } from '../types/error';
import { parseError, getUserFriendlyMessage, shouldRetry } from '../utils/errorUtils';

interface ErrorState {
  errors: AppError[];
  config: ErrorHandlerConfig;
  
  // Actions
  handleError: (error: unknown, options?: ErrorDisplayOptions) => AppError;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  updateConfig: (config: Partial<ErrorHandlerConfig>) => void;
  reportError: (error: AppError) => Promise<void>;
  retryWithError: <T>(
    operation: () => Promise<T>, 
    error: AppError, 
    maxRetries?: number
  ) => Promise<T>;
}

const defaultConfig: ErrorHandlerConfig = {
  enableLogging: true,
  enableReporting: false,
  displayOptions: {
    showToast: true,
    showModal: false,
    autoClose: 5000,
    position: 'top-right',
    persistent: false
  },
  maxRetries: 3,
  retryDelay: 1000
};

// Safe logger to avoid recursion issues
const safeLog = {
  group: (message: string) => {
    try {
      // Use the original console methods directly
      const originalGroup = Object.getPrototypeOf(console).group || console.log;
      originalGroup.call(console, message);
    } catch {
      // Fallback if console methods are compromised
    }
  },
  error: (...args: any[]) => {
    try {
      // Use the original console.error directly
      const originalError = Object.getPrototypeOf(console).error || console.log;
      originalError.apply(console, args);
    } catch {
      // Fallback if console methods are compromised
    }
  },
  groupEnd: () => {
    try {
      const originalGroupEnd = Object.getPrototypeOf(console).groupEnd || (() => {});
      originalGroupEnd.call(console);
    } catch {
      // Fallback if console methods are compromised
    }
  }
};

export const useErrorHandler = create<ErrorState>((set, get) => ({
  errors: [],
  config: defaultConfig,

  handleError: (error: unknown, options?: ErrorDisplayOptions) => {
    const appError = parseError(error);
    const { config } = get();
    
    // Add error to store
    set(state => ({
      errors: [...state.errors, appError]
    }));

    // Log error if enabled
    if (config.enableLogging) {
      safeLog.group(`🚨 ${appError.severity.toUpperCase()} Error [${appError.category}]`);
      safeLog.error('Error ID:', appError.id);
      safeLog.error('Message:', appError.message);
      safeLog.error('Details:', appError.details);
      if (appError.originalError) {
        safeLog.error('Original Error:', appError.originalError);
      }
      if (appError.stack) {
        safeLog.error('Stack:', appError.stack);
      }
      safeLog.groupEnd();
    }

    // Display error based on options
    const displayOptions = { ...config.displayOptions, ...options };
    
    if (displayOptions.showToast) {
      const message = getUserFriendlyMessage(appError);
      const toastOptions = {
        position: displayOptions.position as any,
        autoClose: displayOptions.autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: appError.id, // Prevent duplicate toasts
      };

      switch (appError.severity) {
        case ErrorSeverity.INFO:
          toast.info(message, toastOptions);
          break;
        case ErrorSeverity.WARNING:
          toast.warn(message, toastOptions);
          break;
        case ErrorSeverity.ERROR:
          toast.error(message, toastOptions);
          break;
        case ErrorSeverity.CRITICAL:
          toast.error(message, { ...toastOptions, autoClose: false });
          break;
        default:
          toast(message, toastOptions);
      }
    }

    // Report error if enabled
    if (config.enableReporting) {
      get().reportError(appError).catch(safeLog.error);
    }

    return appError;
  },

  clearError: (errorId: string) => {
    set(state => ({
      errors: state.errors.filter(error => error.id !== errorId)
    }));
  },

  clearAllErrors: () => {
    set({ errors: [] });
  },

  updateConfig: (newConfig: Partial<ErrorHandlerConfig>) => {
    set(state => ({
      config: { ...state.config, ...newConfig }
    }));
  },

  reportError: async (error: AppError) => {
    const { config } = get();
    
    if (!config.reportingEndpoint) {
      safeLog.error('Error reporting is enabled but no endpoint is configured');
      return;
    }

    try {
      const response = await fetch(config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            ...error,
            timestamp: error.timestamp.toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            // Remove potentially sensitive data
            originalError: undefined,
            stack: error.severity === ErrorSeverity.CRITICAL ? error.stack : undefined
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to report error: ${response.status}`);
      }

      safeLog.error('Error reported successfully:', error.id);
    } catch (reportingError) {
      safeLog.error('Failed to report error:', reportingError);
    }
  },

  retryWithError: async <T>(
    operation: () => Promise<T>, 
    error: AppError, 
    maxRetries?: number
  ): Promise<T> => {
    const { config } = get();
    const retries = maxRetries ?? config.maxRetries ?? 3;
    
    if (!shouldRetry(error, 1, retries)) {
      throw error;
    }

    let lastError = error;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Wait before retrying
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay ?? 1000));
        }
        
        console.log(`🔄 Retrying operation (attempt ${attempt}/${retries}) for error:`, error.id);
        return await operation();
      } catch (retryError) {
        lastError = parseError(retryError);
        
        if (!shouldRetry(lastError, attempt, retries)) {
          break;
        }
      }
    }

    // All retries failed
    const finalError = {
      ...lastError,
      message: `Operation failed after ${retries} attempts: ${lastError.message}`,
      details: {
        ...lastError.details,
        attempts: retries,
        originalErrorId: error.id
      }
    };

    throw finalError;
  },
}));

// Global error handlers
let globalErrorHandlersSetup = false;

export const setupGlobalErrorHandlers = () => {
  // Prevent multiple setups
  if (globalErrorHandlersSetup) {
    return;
  }
  globalErrorHandlersSetup = true;

  const { handleError } = useErrorHandler.getState();

  // Store the original console methods to avoid infinite recursion
  const originalConsoleError = console.error;

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    originalConsoleError('Unhandled promise rejection:', event.reason);
    try {
      handleError(event.reason, { 
        showToast: true,
        persistent: true 
      });
    } catch (err) {
      originalConsoleError('Error in unhandledrejection handler:', err);
    }
    event.preventDefault(); // Prevent console error
  });

  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    originalConsoleError('Uncaught error:', event.error);
    try {
      handleError(event.error, { 
        showToast: true,
        persistent: true 
      });
    } catch (err) {
      originalConsoleError('Error in error handler:', err);
    }
  });

  // Only override console in development and with better safety checks
  if (process.env.NODE_ENV === 'development') {
    // Track if we're currently processing an error to prevent recursion
    let isProcessingError = false;
    
    console.error = (...args) => {
      // Always call the original console.error first
      originalConsoleError.apply(console, args);
      
      // Avoid recursion and only handle React-specific errors
      if (!isProcessingError) {
        const isReactError = args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('Warning: ') || arg.includes('Error: '))
        );
        
        const isNotOurErrorLog = !args.some(arg =>
          typeof arg === 'string' && 
          (arg.includes('🚨') || arg.includes('Error ID:') || arg.includes('Unhandled'))
        );
        
        if (isReactError && isNotOurErrorLog) {
          isProcessingError = true;
          try {
            handleError(new Error(args.join(' ')), { 
              showToast: false // Don't show toast for console errors
            });
          } catch (err) {
            originalConsoleError('Error in console.error override:', err);
          } finally {
            isProcessingError = false;
          }
        }
      }
    };
  }
};

export default useErrorHandler;
