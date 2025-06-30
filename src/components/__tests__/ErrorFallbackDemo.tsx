import React, { useState } from 'react';
import { ErrorBoundary } from '../common/ErrorBoundary';
import {
  NetworkErrorFallback,
  ComponentErrorFallback,
  PageErrorFallback,
  RouteErrorFallback,
  LoadingErrorFallback,
  GenericErrorFallback,
} from '../common/ErrorFallback';
import { Card } from '../ui/card';

const errorTypes = [
  'network',
  'component',
  'page',
  'route',
  'loading',
  'generic',
] as const;

type ErrorType = typeof errorTypes[number];

function getDemoError(type: ErrorType) {
  switch (type) {
    case 'network':
      return new Error('Network request failed');
    case 'component':
      return new Error('Component crashed');
    case 'page':
      return new Error('Page failed to load');
    case 'route':
      return new Error('404 Not Found');
    case 'loading':
      return new Error('Failed to load resource');
    default:
      return new Error('Generic error occurred');
  }
}

function DemoThrower({ error }: { error: Error }) {
  throw error;
}

export const ErrorFallbackDemo: React.FC = () => {
  const [selected, setSelected] = useState<ErrorType>('network');
  const [shouldThrow, setShouldThrow] = useState(false);

  const fallbackMap = {
    network: NetworkErrorFallback,
    component: ComponentErrorFallback,
    page: PageErrorFallback,
    route: RouteErrorFallback,
    loading: (props: any) => <LoadingErrorFallback {...props} resourceName="demo resource" />, // demo
    generic: GenericErrorFallback,
  };

  const Fallback = fallbackMap[selected];
  const error = getDemoError(selected);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Error Fallback Demo</h1>
      <Card className="mb-6 p-4 flex flex-wrap gap-2">
        {errorTypes.map(type => (
          <button
            key={type}
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${selected === type ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-purple-900'}`}
            onClick={() => { setSelected(type); setShouldThrow(false); }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </Card>
      <Card className="p-6">
        <div className="mb-4">
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            onClick={() => setShouldThrow(true)}
          >
            Throw {selected} error
          </button>
        </div>
        <ErrorBoundary fallback={Fallback as any} level={selected === 'page' ? 'page' : selected === 'component' ? 'component' : 'section'}>
          {shouldThrow ? <DemoThrower error={error} /> : <div className="text-green-400 text-center">No error thrown. Click button above to test fallback.</div>}
        </ErrorBoundary>
      </Card>
    </div>
  );
}
