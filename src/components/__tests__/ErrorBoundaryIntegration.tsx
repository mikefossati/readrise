import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import ErrorBoundary from '../common/ErrorBoundary';
import { 
  PageErrorFallback, 
  ComponentErrorFallback, 
  NetworkErrorFallback,
  LoadingErrorFallback 
} from '../common/ErrorFallback';
import { ErrorReportingDialog } from '../common/ErrorReportingDialog';
import { useErrorReporting } from '../../hooks/useErrorReporting';

// Test components that simulate different error scenarios
const NetworkErrorComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Network request failed');
  }
  return <div>Network component working</div>;
};

const DataLoadingComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Failed to load user data');
  }
  return <div>Data loaded successfully</div>;
};

const TimerComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Timer worker initialization failed');
  }
  return <div>Timer is running</div>;
};

const AchievementComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Achievement service unavailable');
  }
  return <div>Achievements loaded</div>;
};

export const ErrorBoundaryIntegration: React.FC = () => {
  const [activeErrors, setActiveErrors] = useState<Record<string, boolean>>({});
  const errorReporting = useErrorReporting({
    defaultTags: { testComponent: 'ErrorBoundaryIntegration' }
  });

  const toggleError = (componentName: string) => {
    setActiveErrors(prev => ({
      ...prev,
      [componentName]: !prev[componentName]
    }));
  };

  const simulateGlobalError = () => {
    // Simulate an unhandled error
    setTimeout(() => {
      throw new Error('Simulated global error');
    }, 100);
  };

  const simulatePromiseRejection = () => {
    // Simulate unhandled promise rejection
    Promise.reject(new Error('Simulated promise rejection'));
  };

  const testAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed')), 100);
      });
    } catch (error) {
      errorReporting.reportError(error as Error, { operation: 'test_async' });
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-4">Error Boundary Integration Test</h1>
        <p className="text-gray-300 mb-6">
          This component tests various error scenarios and error boundary behaviors.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button 
            onClick={() => toggleError('network')}
            variant={activeErrors.network ? "destructive" : "outline"}
          >
            {activeErrors.network ? "Fix Network" : "Break Network"}
          </Button>
          
          <Button 
            onClick={() => toggleError('data')}
            variant={activeErrors.data ? "destructive" : "outline"}
          >
            {activeErrors.data ? "Fix Data" : "Break Data"}
          </Button>
          
          <Button 
            onClick={() => toggleError('timer')}
            variant={activeErrors.timer ? "destructive" : "outline"}
          >
            {activeErrors.timer ? "Fix Timer" : "Break Timer"}
          </Button>
          
          <Button 
            onClick={() => toggleError('achievement')}
            variant={activeErrors.achievement ? "destructive" : "outline"}
          >
            {activeErrors.achievement ? "Fix Achievement" : "Break Achievement"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={simulateGlobalError} variant="destructive">
            Simulate Global Error
          </Button>
          
          <Button onClick={simulatePromiseRejection} variant="destructive">
            Simulate Promise Rejection
          </Button>
          
          <Button onClick={testAsyncError} variant="destructive">
            Test Async Error
          </Button>
        </div>

        <Button onClick={errorReporting.showReportDialog} className="mb-8">
          Open Error Report Dialog
        </Button>
      </Card>

      {/* Component-level error boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Network Component */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">Network Component</h3>
          <ErrorBoundary 
            level="component" 
            fallback={NetworkErrorFallback}
            isolate={true}
          >
            <NetworkErrorComponent shouldError={activeErrors.network} />
          </ErrorBoundary>
        </Card>

        {/* Data Loading Component */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">Data Loading Component</h3>
          <ErrorBoundary 
            level="component" 
            fallback={(props) => (
              <LoadingErrorFallback 
                {...props} 
                resourceName="user data"
                onRetry={() => toggleError('data')}
              />
            )}
            isolate={true}
          >
            <DataLoadingComponent shouldError={activeErrors.data} />
          </ErrorBoundary>
        </Card>

        {/* Timer Component */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">Timer Component</h3>
          <ErrorBoundary 
            level="component" 
            fallback={ComponentErrorFallback}
            isolate={true}
            resetKeys={[activeErrors.timer]}
          >
            <TimerComponent shouldError={activeErrors.timer} />
          </ErrorBoundary>
        </Card>

        {/* Achievement Component */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">Achievement Component</h3>
          <ErrorBoundary 
            level="component" 
            fallback={ComponentErrorFallback}
            isolate={true}
            resetOnPropsChange={true}
          >
            <AchievementComponent shouldError={activeErrors.achievement} />
          </ErrorBoundary>
        </Card>
      </div>

      {/* Page-level error boundary test */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Page-level Error Boundary Test</h3>
        <ErrorBoundary 
          level="page" 
          fallback={PageErrorFallback}
        >
          <div className="p-4">
            <p className="text-gray-300 mb-4">
              This section simulates a page-level error. Click the button below to trigger it.
            </p>
            <ErrorBoundary level="component">
              <Button 
                onClick={() => {
                  throw new Error('Page-level component error');
                }}
                variant="destructive"
              >
                Trigger Page Error
              </Button>
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      </Card>

      <ErrorReportingDialog
        isOpen={errorReporting.isReportDialogOpen}
        onClose={errorReporting.hideReportDialog}
        errorId={errorReporting.lastErrorId || undefined}
        prefillDescription="Testing error reporting functionality"
      />
    </div>
  );
};

export default ErrorBoundaryIntegration;
