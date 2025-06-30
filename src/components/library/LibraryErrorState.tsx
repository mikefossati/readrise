import React from 'react';

interface LibraryErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const LibraryErrorState: React.FC<LibraryErrorStateProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24">
    <div className="text-6xl mb-4">❌</div>
    <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
    <p className="text-gray-400 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="mt-2 px-6 py-2 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors"
    >
      Retry
    </button>
  </div>
);
