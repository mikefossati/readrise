import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseErrorHandlerOptions {
  onError?: (error: Error, context?: Record<string, any>) => void;
  redirectTo?: string;
  showToast?: boolean;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const navigate = useNavigate();
  const { onError, redirectTo, showToast = true } = options;

  const handleError = useCallback((
    error: Error, 
    context?: Record<string, any>
  ) => {
    // Log error
    console.error('Error handled:', error, context);

    // Call custom error handler
    onError?.(error, context);

    // Show toast notification (if you have a toast system)
    if (showToast && typeof window !== 'undefined') {
      // TODO: Integrate with your toast/notification system
      console.log('Would show toast:', error.message);
    }

    // Redirect if specified
    if (redirectTo) {
      navigate(redirectTo);
    }
  }, [onError, redirectTo, showToast, navigate]);

  const handleAsyncError = useCallback(async (
    asyncOperation: () => Promise<any>,
    context?: Record<string, any>
  ) => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, context);
      throw error;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
}
