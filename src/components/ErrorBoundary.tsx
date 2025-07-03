import React from 'react';
import type { AppError } from '../types/error';
import { ErrorSeverity, ErrorCategory } from '../types/error';
import { createAppError } from '../utils/errorUtils';
import { useErrorHandler } from '../services/errorHandler';

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: AppError; resetError: () => void }>;
  onError?: (error: AppError) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Error Boundary component to catch React errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Convert the error to our AppError format
    const appError = createAppError(
      error.message || 'A React component error occurred',
      ErrorSeverity.ERROR,
      ErrorCategory.RUNTIME,
      {
        originalError: error,
        stack: error.stack,
        source: 'ErrorBoundary'
      }
    );

    return {
      hasError: true,
      error: appError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = createAppError(
      error.message || 'A React component error occurred',
      ErrorSeverity.ERROR,
      ErrorCategory.RUNTIME,
      {
        originalError: error,
        stack: error.stack,
        details: {
          componentStack: errorInfo.componentStack
        },
        source: 'ErrorBoundary'
      }
    );

    // Handle the error through our error handler (but prevent recursion)
    try {
      const { handleError } = useErrorHandler.getState();
      handleError(appError, { showToast: true });
    } catch (handlerError) {
      // If the error handler itself fails, just log to console
      console.error('Error handler failed:', handlerError);
    }

    // Call custom onError handler if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }

    this.setState({ error: appError });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      } else if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => prevProps.resetKeys?.[index] !== key
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetErrorBoundary} />;
      }

      return <DefaultErrorFallback error={error} resetError={this.resetErrorBoundary} />;
    }

    return children;
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: AppError; resetError: () => void }> = ({
  error,
  resetError
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </p>
              </div>
            </div>
          </div>

          {isDevelopment && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Error Details (Development):
              </h4>
              <p className="text-xs text-gray-600 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Stack Trace
                  </summary>
                  <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={resetError}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Higher-order component wrapper for error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for manual error boundary reset
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { resetError, captureError };
}

export default ErrorBoundary;
