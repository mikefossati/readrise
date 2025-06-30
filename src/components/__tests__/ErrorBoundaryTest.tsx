import React, { useState } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';

const BuggyComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error from BuggyComponent');
  }

  return (
    <div className="p-4 bg-blue-100 rounded">
      <h3>Buggy Component</h3>
      <button 
        onClick={() => setShouldThrow(true)}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Throw Error
      </button>
    </div>
  );
};

export const ErrorBoundaryTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1>Error Boundary Test</h1>
      
      <div>
        <h2>Component Level Error Boundary</h2>
        <ErrorBoundary level="component">
          <BuggyComponent />
        </ErrorBoundary>
      </div>

      <div>
        <h2>Section Level Error Boundary</h2>
        <ErrorBoundary level="section" isolate>
          <BuggyComponent />
        </ErrorBoundary>
      </div>
    </div>
  );
};
