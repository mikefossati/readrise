import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  RefreshCw, 
  Wifi, 
  AlertTriangle, 
  Bug, 
  Home,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import type { ErrorFallbackProps } from './ErrorBoundary';

// Network Error Fallback
export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorId,
}) => {
  const isOffline = !navigator.onLine;

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 text-center max-w-md mx-auto">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
          <Wifi className="w-8 h-8 text-orange-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {isOffline ? 'You\'re Offline' : 'Connection Problem'}
      </h3>
      
      <p className="text-gray-300 mb-4">
        {isOffline 
          ? 'Please check your internet connection and try again.'
          : 'We couldn\'t load this content. Please check your connection.'
        }
      </p>
      
      <div className="flex gap-2 justify-center">
        <Button onClick={resetError} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Error ID: {errorId}
      </div>
    </Card>
  );
};

// Component Error Fallback
export const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorId,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Card className="p-4 bg-red-900/20 border-red-500/30 border">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Bug className="w-5 h-5 text-red-400 mt-0.5" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-300 mb-1">
            Component Error
          </h4>
          
          <p className="text-xs text-red-200 mb-3">
            This component encountered an error and couldn't render properly.
          </p>
          
          {isDevelopment && (
            <details className="mb-3">
              <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                Error Details
              </summary>
              <div className="mt-1 p-2 bg-slate-900/50 rounded text-xs font-mono text-gray-400">
                {error.message}
              </div>
            </details>
          )}
          
          <Button 
            onClick={resetError} 
            size="sm" 
            variant="outline"
            className="text-xs h-7"
          >
            Retry Component
          </Button>
        </div>
      </div>
      
      {isDevelopment && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          ID: {errorId}
        </div>
      )}
    </Card>
  );
};

// Page Error Fallback
export const PageErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorId,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-lg mx-auto bg-slate-800/90 p-8 text-center border-slate-700/50">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-300 mb-6">
          We encountered an unexpected error. This has been reported to our team, 
          but you can try refreshing the page or returning to the dashboard.
        </p>

        {/* Development Error Details */}
        {isDevelopment && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-red-400 hover:text-red-300 text-sm mb-2">
              🔧 Developer Info
            </summary>
            <Card className="p-4 bg-slate-900/50 border-slate-700/50">
              <div className="space-y-2 text-xs font-mono">
                <div className="text-red-400">
                  <strong>Error:</strong> {error.message}
                </div>
                <div className="text-yellow-400">
                  <strong>Error ID:</strong> {errorId}
                </div>
                {error.stack && (
                  <details>
                    <summary className="text-blue-400 cursor-pointer">Stack Trace</summary>
                    <pre className="mt-2 text-gray-400 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </Card>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={resetError}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <p className="text-sm text-gray-400 mb-2">
            Need help? Contact support with this error ID:
          </p>
          <code className="text-xs bg-slate-700/50 px-2 py-1 rounded text-gray-300">
            {errorId}
          </code>
        </div>
      </Card>
    </div>
  );
};

// Route Error Fallback (for navigation errors)
export const RouteErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorId,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto bg-slate-800/90 p-6 text-center border-slate-700/50">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Page Not Found
        </h2>
        
        <p className="text-gray-300 mb-6">
          The page you're looking for doesn't exist or encountered an error while loading.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Error ID: {errorId}
        </div>
      </Card>
    </div>
  );
};

// Loading Error Fallback (for data fetching errors)
export const LoadingErrorFallback: React.FC<ErrorFallbackProps & { 
  resourceName?: string;
  onRetry?: () => void;
}> = ({
  error,
  resetError,
  errorId,
  resourceName = 'data',
  onRetry,
}) => {
  const handleRetry = () => {
    onRetry?.();
    resetError();
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 text-center">
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-white mb-2">
        Failed to Load {resourceName}
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm">
        We couldn't load the {resourceName.toLowerCase()}. This might be due to a network issue.
      </p>
      
      <div className="flex gap-2 justify-center">
        <Button onClick={handleRetry} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Error ID: {errorId}
      </div>
    </Card>
  );
};

// Generic Error Fallback with custom content
export const GenericErrorFallback: React.FC<ErrorFallbackProps & {
  title?: string;
  description?: string;
  showErrorDetails?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    icon?: React.ReactNode;
  }>;
}> = ({
  error,
  resetError,
  errorId,
  level,
  title,
  description,
  showErrorDetails = false,
  actions = [],
}) => {
  const defaultTitle = level === 'page' ? 'Something went wrong' : 'Error occurred';
  const defaultDescription = level === 'page' 
    ? 'We encountered an unexpected error. Please try again.'
    : 'This section couldn\'t load properly.';

  const defaultActions = [
    {
      label: 'Try Again',
      onClick: resetError,
      variant: 'default' as const,
      icon: <RefreshCw className="w-4 h-4 mr-2" />,
    },
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  const containerClass = level === 'page'
    ? 'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4'
    : 'p-4';

  const cardClass = level === 'page'
    ? 'max-w-md mx-auto bg-slate-800/90 border-slate-700/50'
    : 'bg-slate-800/50 border-slate-700/50';

  return (
    <div className={containerClass}>
      <Card className={`${cardClass} p-6 text-center`}>
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">
          {title || defaultTitle}
        </h3>
        
        <p className="text-gray-300 mb-4">
          {description || defaultDescription}
        </p>

        {showErrorDetails && process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-red-400 hover:text-red-300 text-sm">
              Error Details
            </summary>
            <div className="mt-2 p-3 bg-slate-900/50 rounded text-xs font-mono text-gray-400">
              <div>Message: {error.message}</div>
              <div>ID: {errorId}</div>
            </div>
          </details>
        )}

        <div className="flex gap-2 justify-center flex-wrap">
          {allActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="sm"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Error ID: {errorId}
        </div>
      </Card>
    </div>
  );
};
