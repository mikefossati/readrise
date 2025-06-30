import { useState, useCallback } from 'react';
import { captureError, captureMessage, captureException } from '../services/errorService';

interface UseErrorReportingOptions {
  defaultTags?: Record<string, string | number | boolean>;
  defaultContext?: Record<string, any>;
}

export function useErrorReporting(options: UseErrorReportingOptions = {}) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [lastErrorId, setLastErrorId] = useState<string | null>(null);

  const reportError = useCallback((
    error: Error,
    context: Record<string, any> = {},
    tags: Record<string, string | number | boolean> = {}
  ) => {
    const errorId = captureError(
      error,
      { ...options.defaultContext, ...context, ...options.defaultTags, ...tags }
    );
    setLastErrorId(errorId);
    return errorId;
  }, [options.defaultContext, options.defaultTags]);

  const reportWarning = useCallback((
    error: Error,
    context: Record<string, any> = {},
    tags: Record<string, string | number | boolean> = {}
  ) => {
    const errorId = captureError(
      error,
      { ...options.defaultContext, ...context, ...options.defaultTags, ...tags }
    );
    return errorId;
  }, [options.defaultContext, options.defaultTags]);

  const reportMessage = useCallback((
    message: string,
    level: 'error' | 'warning' | 'info' = 'info',
    context: Record<string, any> = {}
  ) => {
    const errorId = captureMessage(
      message,
      level,
      { ...options.defaultContext, ...context }
    );
    return errorId;
  }, [options.defaultContext]);

  const reportException = useCallback((
    exception: any,
    context: Record<string, any> = {}
  ) => {
    const errorId = captureException(
      exception,
      { ...options.defaultContext, ...context }
    );
    setLastErrorId(errorId);
    return errorId;
  }, [options.defaultContext]);

  const showReportDialog = useCallback(() => {
    setIsReportDialogOpen(true);
  }, []);

  const hideReportDialog = useCallback(() => {
    setIsReportDialogOpen(false);
  }, []);

  return {
    reportError,
    reportWarning,
    reportMessage,
    reportException,
    isReportDialogOpen,
    showReportDialog,
    hideReportDialog,
    lastErrorId,
  };
}
