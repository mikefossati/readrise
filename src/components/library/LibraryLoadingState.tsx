import React from 'react';

export const LibraryLoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24 animate-pulse">
    <div className="text-6xl mb-4">⏳</div>
    <h2 className="text-xl font-semibold text-white mb-2">Loading your library...</h2>
    <p className="text-gray-400">Please wait while we fetch your books.</p>
  </div>
);
