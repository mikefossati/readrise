import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, Plus, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface TimerEmptyStateProps {
  type: 'no-books' | 'loading-error' | 'connection-error' | 'session-error';
  onRetry?: () => void;
  onAddBooks?: () => void;
  error?: string;
}

export const TimerEmptyState: React.FC<TimerEmptyStateProps> = ({
  type,
  onRetry,
  onAddBooks,
  error,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'no-books':
        return {
          icon: BookOpen,
          title: 'No Books in Your Library',
          description: 'Add some books to your library to start tracking your reading sessions.',
          action: (
            <Button 
              onClick={onAddBooks}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Book
            </Button>
          ),
          color: 'blue'
        };
        
      case 'loading-error':
        return {
          icon: AlertCircle,
          title: 'Failed to Load Books',
          description: 'We couldn\'t load your book library. Please check your connection and try again.',
          action: (
            <Button onClick={onRetry} variant="outline" className="border-red-500 text-red-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ),
          color: 'red'
        };
        
      case 'connection-error':
        return {
          icon: WifiOff,
          title: 'Connection Lost',
          description: 'Please check your internet connection and try again.',
          action: (
            <Button onClick={onRetry} variant="outline" className="border-orange-500 text-orange-300">
              <Wifi className="w-4 h-4 mr-2" />
              Reconnect
            </Button>
          ),
          color: 'orange'
        };
        
      case 'session-error':
        return {
          icon: AlertCircle,
          title: 'Session Failed to Start',
          description: error || 'Something went wrong while starting your reading session.',
          action: (
            <Button onClick={onRetry} variant="outline" className="border-yellow-500 text-yellow-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ),
          color: 'yellow'
        };
        
      default:
        return {
          icon: AlertCircle,
          title: 'Something went wrong',
          description: 'An unexpected error occurred.',
          action: null,
          color: 'gray'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
      <CardContent className="p-12 text-center">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-${config.color}-500/10 border border-${config.color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-10 h-10 text-${config.color}-400`} />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-3">{config.title}</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">{config.description}</p>
        
        {config.action && (
          <div className="flex justify-center">
            {config.action}
          </div>
        )}
        
        {type === 'no-books' && (
          <div className="mt-8 text-sm text-gray-500">
            <p>Pro tip: You can add books by searching our database or manually entering book details.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
