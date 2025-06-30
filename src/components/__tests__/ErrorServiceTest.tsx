import React from 'react';
import { useErrorReporting } from '../../hooks/useErrorReporting';
import { ErrorReportingDialog } from '../common/ErrorReportingDialog';
import { Button } from '../ui/button';

export const ErrorServiceTest: React.FC = () => {
  const errorReporting = useErrorReporting({
    defaultTags: { component: 'ErrorServiceTest' },
    defaultContext: { testMode: true },
  });

  return (
    <div className="p-8 space-y-4">
      <h2>Error Service Test</h2>
      <div className="space-x-2">
        <Button onClick={() => {
          try {
            throw new Error('Test JavaScript error');
          } catch (e) {
            errorReporting.reportError(e as Error, { action: 'test_error' });
          }
        }}>
          Test Error
        </Button>
        <Button onClick={() => {
          errorReporting.reportWarning(new Error('Test warning'), { action: 'test_warning' });
        }}>
          Test Warning
        </Button>
        <Button onClick={() => {
          errorReporting.reportMessage('Test info message', 'info');
        }}>
          Test Message
        </Button>
        <Button onClick={errorReporting.showReportDialog}>
          Show Report Dialog
        </Button>
      </div>
      <ErrorReportingDialog
        isOpen={errorReporting.isReportDialogOpen}
        onClose={errorReporting.hideReportDialog}
        errorId={errorReporting.lastErrorId || undefined}
      />
    </div>
  );
};
