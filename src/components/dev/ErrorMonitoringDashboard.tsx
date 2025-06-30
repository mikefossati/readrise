import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import errorService from '../../services/errorService';

export const ErrorMonitoringDashboard: React.FC = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setErrors(errorService.getErrorHistory());
    setSessionId(errorService.getSessionId());
  }, []);

  const refreshErrors = () => {
    setErrors(errorService.getErrorHistory());
  };

  const clearErrors = () => {
    errorService.clearErrorHistory();
    setErrors([]);
  };

  const exportErrors = () => {
    const data = errorService.exportErrors();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readrise-errors-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="p-6 bg-slate-800 border-slate-700 m-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Error Monitoring Dashboard</h2>
        <div className="space-x-2">
          <Button onClick={refreshErrors} size="sm">Refresh</Button>
          <Button onClick={exportErrors} size="sm" variant="outline">Export</Button>
          <Button onClick={clearErrors} size="sm" variant="destructive">Clear</Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        Session ID: <code>{sessionId}</code>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {errors.length === 0 ? (
          <p className="text-gray-400">No errors recorded in this session.</p>
        ) : (
          errors.map((error, index) => (
            <div key={index} className="p-3 bg-slate-700/50 rounded text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-mono text-xs px-2 py-1 rounded ${
                  error.level === 'error' ? 'bg-red-900/50 text-red-300' :
                  error.level === 'warning' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-blue-900/50 text-blue-300'
                }`}>
                  {error.level.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">{error.timestamp}</span>
              </div>
              <div className="text-white mb-1">{error.message}</div>
              <div className="text-xs text-gray-400">ID: {error.id}</div>
              <div className="text-xs text-gray-400">Fingerprint: {error.fingerprint}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
