// src/services/errorService.ts

export interface ErrorReport {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  buildVersion?: string;
  environment: 'development' | 'staging' | 'production';
  tags: Record<string, string | number | boolean>;
  context: Record<string, any>;
  fingerprint: string;
}

export interface ErrorServiceConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  enableLocalStorage: boolean;
  maxLocalStorageErrors: number;
  remoteEndpoint?: string;
  environment: 'development' | 'staging' | 'production';
  buildVersion?: string;
  enablePerformanceTracking: boolean;
}

class ErrorService {
  private config: ErrorServiceConfig;
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor(config: Partial<ErrorServiceConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: import.meta.env.MODE === 'production',
      enableLocalStorage: true,
      maxLocalStorageErrors: 50,
      environment: (import.meta.env.MODE as any) || 'development',
      enablePerformanceTracking: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.loadStoredErrors();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateFingerprint(message: string, stack?: string): string {
    // Create a fingerprint for error deduplication
    const content = `${message}_${stack?.split('\n')[0] || ''}`;
    return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private setupEventListeners(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          type: 'unhandled_promise_rejection',
        }
      );
    });

    // Network status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushErrorQueue();
      }
    });

    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.flushErrorQueue();
    });
  }

  public setUser(userId: string): void {
    this.userId = userId;
  }

  public clearUser(): void {
    this.userId = undefined;
  }

  public captureError(
    error: Error,
    context: Record<string, any> = {},
    level: 'error' | 'warning' | 'info' = 'error',
    tags: Record<string, string | number | boolean> = {}
  ): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    const fingerprint = this.generateFingerprint(error.message, error.stack);

    const errorReport: ErrorReport = {
      id: errorId,
      timestamp,
      level,
      message: error.message,
      stack: error.stack,
      componentStack: (error as any).componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      buildVersion: this.config.buildVersion,
      environment: this.config.environment,
      tags: {
        ...tags,
        errorName: error.name,
        hasStack: !!error.stack,
      },
      context: {
        ...context,
        timestamp: Date.now(),
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        isOnline: this.isOnline,
        cookiesEnabled: navigator.cookieEnabled,
        ...(this.config.enablePerformanceTracking && this.getPerformanceData()),
      },
      fingerprint,
    };

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorReport);
    }

    // Store locally
    if (this.config.enableLocalStorage) {
      this.storeErrorLocally(errorReport);
    }

    // Queue for remote logging
    if (this.config.enableRemoteLogging) {
      this.queueForRemoteLogging(errorReport);
    }

    return errorId;
  }

  public captureMessage(
    message: string,
    level: 'error' | 'warning' | 'info' = 'info',
    context: Record<string, any> = {},
    tags: Record<string, string | number | boolean> = {}
  ): string {
    const error = new Error(message);
    return this.captureError(error, context, level, tags);
  }

  public captureException(
    exception: any,
    context: Record<string, any> = {},
    tags: Record<string, string | number | boolean> = {}
  ): string {
    const error = exception instanceof Error ? exception : new Error(String(exception));
    return this.captureError(error, context, 'error', tags);
  }

  private getPerformanceData(): Record<string, any> {
    if (!window.performance) return {};

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      const navStart = (navigation as any)?.navigationStart ?? navigation?.startTime ?? 0;
      return {
        loadTime: navigation?.loadEventEnd && navStart ? navigation.loadEventEnd - navStart : 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd && navStart ? navigation.domContentLoadedEventEnd - navStart : 0,
        networkLatency: navigation?.responseStart && navigation?.requestStart ? navigation.responseStart - navigation.requestStart : 0,
        memoryUsed: memory?.usedJSHeapSize || 0,
        memoryLimit: memory?.jsHeapSizeLimit || 0,
      };
    } catch (e) {
      return {};
    }
  }

  private logToConsole(errorReport: ErrorReport): void {
    const { level, message, context, tags } = errorReport;
    
    const style = level === 'error' ? 'color: #ef4444; font-weight: bold;' 
                : level === 'warning' ? 'color: #f59e0b; font-weight: bold;'
                : 'color: #3b82f6;';

    console.group(`%c[${level.toUpperCase()}] ${message}`, style);
    console.log('Error ID:', errorReport.id);
    console.log('Fingerprint:', errorReport.fingerprint);
    console.log('Tags:', tags);
    console.log('Context:', context);
    
    if (errorReport.stack) {
      console.log('Stack Trace:', errorReport.stack);
    }
    
    if (errorReport.componentStack) {
      console.log('Component Stack:', errorReport.componentStack);
    }
    
    console.groupEnd();
  }

  private storeErrorLocally(errorReport: ErrorReport): void {
    try {
      const stored = this.getStoredErrors();
      stored.push(errorReport);

      // Keep only the latest errors
      const trimmed = stored.slice(-this.config.maxLocalStorageErrors);
      
      localStorage.setItem('readrise_errors', JSON.stringify(trimmed));
    } catch (e) {
      // localStorage might be full or unavailable
      console.warn('Failed to store error locally:', e);
    }
  }

  private loadStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('readrise_errors');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private getStoredErrors(): ErrorReport[] {
    return this.loadStoredErrors();
  }

  private queueForRemoteLogging(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Try to flush immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: errorsToSend,
          metadata: {
            sessionId: this.sessionId,
            flushTimestamp: new Date().toISOString(),
          },
        }),
      });

      console.log(`Successfully sent ${errorsToSend.length} errors to remote service`);
    } catch (e) {
      // Re-queue errors on failure
      this.errorQueue.unshift(...errorsToSend);
      console.warn('Failed to send errors to remote service:', e);
    }
  }

  public getErrorHistory(): ErrorReport[] {
    return this.getStoredErrors();
  }

  public clearErrorHistory(): void {
    try {
      localStorage.removeItem('readrise_errors');
    } catch (e) {
      console.warn('Failed to clear error history:', e);
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public exportErrors(): string {
    const errors = this.getStoredErrors();
    return JSON.stringify(errors, null, 2);
  }
}

// Create singleton instance
export const errorService = new ErrorService({
  buildVersion: '1.0.0', // TODO: Get from build process
  remoteEndpoint: import.meta.env.VITE_ERROR_ENDPOINT, // TODO: Set in environment
});

// Convenience functions
export const captureError = (error: Error, context?: Record<string, any>, tags?: Record<string, string | number | boolean>) => {
  return errorService.captureError(error, context, 'error', tags);
};

export const captureWarning = (error: Error, context?: Record<string, any>, tags?: Record<string, string | number | boolean>) => {
  return errorService.captureError(error, context, 'warning', tags);
};

export const captureMessage = (message: string, level: 'error' | 'warning' | 'info' = 'info', context?: Record<string, any>) => {
  return errorService.captureMessage(message, level, context);
};

export const captureException = (exception: any, context?: Record<string, any>) => {
  return errorService.captureException(exception, context);
};

export const setErrorUser = (userId: string) => {
  errorService.setUser(userId);
};

export const clearErrorUser = () => {
  errorService.clearUser();
};

export default errorService;
