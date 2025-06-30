import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

interface CustomRenderOptions extends RenderOptions {
  withRouter?: boolean;
  withAuth?: boolean;
  withErrorBoundary?: boolean;
  user?: any;
  errorBoundaryLevel?: 'page' | 'component' | 'section';
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    withRouter = true,
    withAuth = true,
    withErrorBoundary = false,
    user = mockUser,
    errorBoundaryLevel = 'component',
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    let wrapped = children;

    if (withErrorBoundary) {
      wrapped = (
        <ErrorBoundary level={errorBoundaryLevel}>
          {wrapped}
        </ErrorBoundary>
      );
    }

    if (withAuth) {
      wrapped = (
        <AuthProvider>
          {wrapped}
        </AuthProvider>
      );
    }

    if (withRouter) {
      wrapped = (
        <BrowserRouter>
          {wrapped}
        </BrowserRouter>
      );
    }

    return <>{wrapped}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Error testing utilities
export const createTestError = (message: string = 'Test error') => new Error(message);

export const triggerErrorBoundary = (element: HTMLElement) => {
  // Simulate an error by dispatching an error event
  const errorEvent = new ErrorEvent('error', {
    error: createTestError('Triggered test error'),
    message: 'Triggered test error',
  });
  window.dispatchEvent(errorEvent);
};

// Mock console methods for testing
export const mockConsole = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  const mockError = vi.fn();
  const mockWarn = vi.fn();
  const mockLog = vi.fn();

  console.error = mockError;
  console.warn = mockWarn;
  console.log = mockLog;

  return {
    mockError,
    mockWarn,
    mockLog,
    restore: () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    },
  };
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
