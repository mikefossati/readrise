export function getErrorType(error: Error): 'network' | 'validation' | 'auth' | 'not_found' | 'server' | 'client' {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network';
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  
  if (message.includes('auth') || message.includes('unauthorized')) {
    return 'auth';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'not_found';
  }
  
  if (message.includes('server') || message.includes('500')) {
    return 'server';
  }
  
  return 'client';
}

export function isNetworkError(error: Error): boolean {
  return getErrorType(error) === 'network' || !navigator.onLine;
}

export function getErrorFallbackComponent(error: Error) {
  const errorType = getErrorType(error);
  
  switch (errorType) {
    case 'network':
      return 'NetworkErrorFallback';
    case 'not_found':
      return 'RouteErrorFallback';
    case 'auth':
      return 'PageErrorFallback';
    default:
      return 'GenericErrorFallback';
  }
}
