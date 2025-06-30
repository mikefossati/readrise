export interface AppError {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  level: 'page' | 'component' | 'section';
  timestamp: string;
  url: string;
  userAgent: string;
}

export interface ErrorContextType {
  reportError: (error: Error, context?: Record<string, any>) => void;
  clearErrors: () => void;
  errors: AppError[];
}
