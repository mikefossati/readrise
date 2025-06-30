import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  level?: 'page' | 'component' | 'section';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  level: 'page' | 'component' | 'section';
  errorId: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error
    const errorId = this.state.errorId || 'unknown';
    this.logError(error, errorInfo, errorId);

    // Call custom error handler
    this.props.onError?.(error, errorInfo, errorId);

    // Report to error tracking service (if available)
    this.reportError(error, errorInfo, errorId);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys changed
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );
      
      if (hasResetKeyChanged) {
        this.resetError();
      }
    }

    // Reset on any prop change if enabled
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.group(`🚨 Error Boundary Caught Error (${errorId})`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.groupEnd();
    }
  };

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
    // For now, we'll just send to a generic error service
    try {
      if (window.navigator.onLine) {
        // Example error reporting
        const errorData = {
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          level: this.props.level || 'component',
          url: window.location.href,
          userAgent: window.navigator.userAgent,
          timestamp: new Date().toISOString(),
        };

        // In development, just log it
        if (process.env.NODE_ENV === 'development') {
          console.log('Would report error:', errorData);
        } else {
          // In production, send to your error reporting service
          // fetch('/api/errors', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(errorData)
          // }).catch(() => {
          //   // Silently fail if error reporting fails
          // });
        }
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private resetError = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleRetry = () => {
    this.resetError();
  };

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback: CustomFallback, level = 'component', isolate = false } = this.props;

    if (hasError && error) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        errorInfo,
        resetError: this.handleRetry,
        level,
        errorId: errorId || 'unknown',
      };

      // Use custom fallback if provided
      if (CustomFallback) {
        return <CustomFallback {...fallbackProps} />;
      }

      // Use default fallback based on level
      return (
        <DefaultErrorFallback 
          {...fallbackProps}
          isolate={isolate}
        />
      );
    }

    return children;
  }
}

// Default fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps & { isolate?: boolean }> = ({
  error,
  resetError,
  level,
  errorId,
  isolate = false,
}) => {
  const isPageLevel = level === 'page';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const containerClass = isPageLevel
    ? 'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4'
    : isolate
    ? 'p-4 rounded-lg bg-red-900/20 border border-red-500/30 m-2'
    : 'p-4 text-center';

  const contentClass = isPageLevel
    ? 'max-w-md mx-auto bg-slate-800/90 rounded-2xl p-8 text-center border border-slate-700/50'
    : '';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Error Icon */}
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-bold text-white mb-2">
          {isPageLevel ? 'Something went wrong' : 'Component Error'}
        </h2>
        
        <p className="text-gray-300 mb-4">
          {isPageLevel 
            ? 'We encountered an unexpected error. Please try refreshing the page.'
            : 'This section encountered an error and couldn\'t load properly.'
          }
        </p>

        {/* Development Error Details */}
        {isDevelopment && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-red-400 hover:text-red-300 text-sm">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-slate-900/50 rounded text-xs font-mono text-gray-400 overflow-auto max-h-32">
              <div className="text-red-400 mb-1">Error ID: {errorId}</div>
              <div className="text-yellow-400 mb-1">Message: {error.message}</div>
              {error.stack && (
                <div className="whitespace-pre-wrap">{error.stack}</div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          {isPageLevel && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>

        {/* Error ID for Support */}
        <div className="mt-4 text-xs text-gray-500">
          Error ID: {errorId}
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
export { ErrorBoundary };
