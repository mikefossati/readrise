# ReadRise Development Guide 🌊

**A comprehensive guide for implementing new features in ReadRise**

This guide ensures consistency, quality, and maintainability for all new features added to ReadRise. Follow these patterns to maintain the high standards of the existing codebase.

---

## 🎯 Development Philosophy

### Core Principles
1. **User-First**: Every feature should enhance the reading experience
2. **Type Safety**: Leverage TypeScript for robust code
3. **Performance**: Optimize for speed and memory efficiency
4. **Accessibility**: Design for all users
5. **Consistency**: Follow established patterns
6. **Error Recovery**: Graceful handling of all failure scenarios

### ReadRise-Specific Patterns
- **Reading-Focused**: All features should support the core reading habit loop
- **Achievement-Driven**: Consider how new features integrate with the achievement system
- **Session-Aware**: Respect active reading sessions and user focus
- **Progress-Oriented**: Show user progress and growth over time

---

## 📁 File Organization & Naming

### Directory Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── [feature]/          # Feature-specific components
│   ├── layout/             # Layout and navigation
│   └── common/             # Shared utilities (ErrorBoundary, etc.)
├── hooks/
│   ├── use[Feature].ts     # Feature-specific hooks
│   └── use[Utility].ts     # Reusable utility hooks
├── services/
│   ├── [feature]Service.ts # Business logic and calculations
│   └── [integration].ts    # External API integrations
├── types/
│   ├── [feature].ts        # Feature-specific types
│   └── [shared].ts         # Shared type definitions
└── utils/
    ├── [feature]Utils.ts   # Feature-specific utilities
    └── [shared]Utils.ts    # Shared utility functions
```

### Naming Conventions
```typescript
// Components: PascalCase
export const ReadingGoalCard: React.FC<Props> = () => {};

// Hooks: camelCase with 'use' prefix
export function useReadingGoals() {}

// Services: camelCase with 'Service' suffix  
export const goalTrackingService = {};

// Types: PascalCase
export interface ReadingGoal {}

// Constants: SCREAMING_SNAKE_CASE
export const MAX_DAILY_READING_MINUTES = 480;

// Files: kebab-case for components, camelCase for others
reading-goal-card.tsx
useReadingGoals.ts
goalTrackingService.ts
```

---

## 🧩 Component Development Patterns

### 1. Component Structure Template

```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, BookOpen } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

// 1. Props Interface (always define)
interface FeatureComponentProps {
  // Required props first
  userId: string;
  onSuccess: (result: FeatureResult) => void;
  
  // Optional props with defaults
  initialValue?: string;
  disabled?: boolean;
  className?: string;
  
  // Event handlers
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

// 2. Main Component
export const FeatureComponent: React.FC<FeatureComponentProps> = ({
  userId,
  onSuccess,
  initialValue = '',
  disabled = false,
  className = '',
  onError,
  onCancel,
}) => {
  // 3. State Management (useState first, then custom hooks)
  const [localState, setLocalState] = useState<LocalState>({
    loading: false,
    error: null,
    data: null,
  });
  
  // 4. Custom Hooks
  const { data, loading, error, mutate } = useFeatureData(userId);
  const { trackEvent } = useAnalytics();
  
  // 5. Memoized Values
  const processedData = useMemo(() => {
    if (!data) return null;
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);
  
  // 6. Event Handlers (useCallback for passed props)
  const handleSubmit = useCallback(async (formData: FormData) => {
    setLocalState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await mutate(formData);
      trackEvent('feature_success', { userId });
      onSuccess(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setLocalState(prev => ({ ...prev, error }));
      onError?.(error);
    } finally {
      setLocalState(prev => ({ ...prev, loading: false }));
    }
  }, [mutate, onSuccess, onError, trackEvent, userId]);
  
  // 7. Effects
  useEffect(() => {
    // Side effects here
    return () => {
      // Cleanup
    };
  }, []);
  
  // 8. Early Returns (loading, error, empty states)
  if (loading) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border-slate-700/50 ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-2" />
          <span className="text-gray-300">Loading feature...</span>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`bg-red-900/20 border-red-500/30 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Failed to load feature</p>
              <p className="text-sm text-red-300">{error.message}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm" 
            className="mt-3 border-red-500/30 text-red-300"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // 9. Main Render
  return (
    <Card className={`bg-gradient-to-br from-slate-800/70 to-purple-900/60 border-slate-700/50 hover-lift timer-transition ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Feature Title
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature content */}
      </CardContent>
    </Card>
  );
};

// 10. Export with display name for debugging
FeatureComponent.displayName = 'FeatureComponent';
```

### 2. Error Boundary Integration

**Wrap all new components in error boundaries:**

```typescript
import ErrorBoundary from '../common/ErrorBoundary';
import { ComponentErrorFallback } from '../common/ErrorFallback';

// In parent component
<ErrorBoundary
  level="component"
  fallback={ComponentErrorFallback}
  isolate={true}
  onError={(error, errorInfo, errorId) => {
    console.error('FeatureComponent error:', { error, errorInfo, errorId });
    // Optional: Report to error service
    errorService.captureError(error, { 
      component: 'FeatureComponent',
      errorInfo,
      errorId 
    });
  }}
>
  <FeatureComponent {...props} />
</ErrorBoundary>
```

---

## 🎨 Styling Guidelines

### 1. Design System Constants

**Use the established design patterns:**

```typescript
// Background patterns
const BACKGROUNDS = {
  primary: 'bg-gradient-to-br from-slate-800/70 to-purple-900/60 border-slate-700/50',
  secondary: 'bg-slate-800/50 backdrop-blur-sm border-slate-700/50',
  glass: 'bg-slate-800/30 backdrop-blur-sm border-slate-700/30',
  error: 'bg-red-900/20 border-red-500/30',
  success: 'bg-green-900/20 border-green-500/30',
};

// Button patterns  
const BUTTONS = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
  secondary: 'bg-slate-800 hover:bg-slate-700 border border-slate-600',
  danger: 'bg-red-600 hover:bg-red-700',
  ghost: 'hover:bg-slate-800/50 text-slate-300 hover:text-white',
};

// Animation classes
const ANIMATIONS = {
  fadeInUp: 'animate-fade-in-up',
  scaleIn: 'animate-scale-in',
  hoverLift: 'hover-lift timer-transition',
  pulseGlow: 'animate-pulse-glow',
};
```

### 2. Component Styling Patterns

```typescript
// Card components
<Card className="bg-gradient-to-br from-slate-800/70 to-purple-900/60 border-slate-700/50 hover-lift timer-transition">

// Primary buttons  
<Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">

// Icons with consistent styling
<BookOpen className="w-5 h-5 text-purple-400" />

// Loading states
<Loader2 className="w-6 h-6 animate-spin text-purple-400" />

// Status badges
<Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">

// Input fields
<input className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500" />
```

### 3. Responsive Design

```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Text scaling  
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">

// Spacing adjustments
<div className="p-4 md:p-6 lg:p-8">

// Hide/show elements
<div className="hidden sm:flex items-center">
<div className="block sm:hidden">
```

---

## 🔗 Custom Hook Patterns

### 1. Data Fetching Hook Template

```typescript
interface UseFeatureDataReturn {
  data: FeatureData[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  mutate: (input: MutateInput) => Promise<FeatureData>;
}

export function useFeatureData(userId?: string): UseFeatureDataReturn {
  const [data, setData] = useState<FeatureData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getFeatureData(userId);
      if (result.error) throw new Error(result.error.message);
      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('useFeatureData error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const mutate = useCallback(async (input: MutateInput): Promise<FeatureData> => {
    if (!userId) throw new Error('User ID required');
    
    try {
      const result = await updateFeatureData(userId, input);
      if (result.error) throw new Error(result.error.message);
      
      // Optimistic update
      setData(prev => prev ? [...prev, result.data] : [result.data]);
      return result.data;
    } catch (err) {
      // Refresh on error to get correct state
      await fetchData();
      throw err;
    }
  }, [userId, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    mutate,
  };
}
```

### 2. Achievement Integration Hook

```typescript
export function useAchievementTracking(userId: string) {
  const checkAchievements = useCallback(async (actionData: ActionData) => {
    try {
      const unlocked = await achievementService.checkAllAchievements(userId, actionData);
      
      if (unlocked.length > 0) {
        // Show achievement notifications
        unlocked.forEach(achievement => {
          // Trigger confetti or notification
          console.log('Achievement unlocked:', achievement);
        });
      }
      
      return unlocked;
    } catch (error) {
      console.error('Achievement check failed:', error);
      return [];
    }
  }, [userId]);

  return { checkAchievements };
}
```

---

## 🗃️ Service Layer Patterns

### 1. Service Function Template

```typescript
// services/featureService.ts
import { supabase } from '../lib/supabase';
import type { Result } from '../types/Result';

export interface FeatureData {
  id: string;
  user_id: string;
  name: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export async function getFeatureData(userId: string): Promise<Result<FeatureData[]>> {
  try {
    const { data, error } = await supabase
      .from('feature_table')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { 
        ok: false, 
        data: null, 
        error: { 
          message: error.message, 
          code: error.code,
          from: 'getFeatureData',
          context: { userId }
        } 
      };
    }

    return { ok: true, data: data || [], error: null };
  } catch (error: any) {
    return { 
      ok: false, 
      data: null, 
      error: { 
        message: error.message || 'Unknown error',
        from: 'getFeatureData',
        context: { userId }
      } 
    };
  }
}

export async function createFeatureData(
  userId: string, 
  input: Omit<FeatureData, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Result<FeatureData>> {
  try {
    const { data, error } = await supabase
      .from('feature_table')
      .insert([{ ...input, user_id: userId }])
      .select()
      .single();

    if (error) {
      return { 
        ok: false, 
        data: null, 
        error: { 
          message: error.message,
          code: error.code,
          from: 'createFeatureData',
          context: { userId, input }
        } 
      };
    }

    return { ok: true, data, error: null };
  } catch (error: any) {
    return { 
      ok: false, 
      data: null, 
      error: { 
        message: error.message || 'Unknown error',
        from: 'createFeatureData',
        context: { userId, input }
      } 
    };
  }
}
```

---

## 🧪 Testing Guidelines

### 1. Component Testing Template

```typescript
// __tests__/components/FeatureComponent.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FeatureComponent } from '../FeatureComponent';
import { renderWithProviders } from '../../test/testUtils';

// Mock dependencies
vi.mock('../../hooks/useFeatureData', () => ({
  useFeatureData: vi.fn(),
}));

const mockUseFeatureData = vi.mocked(useFeatureData);

describe('FeatureComponent', () => {
  const defaultProps = {
    userId: 'test-user-id',
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseFeatureData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeatureComponent {...defaultProps} />);
    
    expect(screen.getByText('Loading feature...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to load data';
    mockUseFeatureData.mockReturnValue({
      data: null,
      loading: false,
      error: errorMessage,
      refresh: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeatureComponent {...defaultProps} />);
    
    expect(screen.getByText('Failed to load feature')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders data correctly', () => {
    const mockData = [
      { id: '1', name: 'Test Item', value: 100 },
      { id: '2', name: 'Another Item', value: 200 },
    ];

    mockUseFeatureData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeatureComponent {...defaultProps} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Another Item')).toBeInTheDocument();
  });

  it('handles user interactions correctly', async () => {
    const mockMutate = vi.fn().mockResolvedValue({ id: '3', name: 'New Item' });
    const mockOnSuccess = vi.fn();

    mockUseFeatureData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
      mutate: mockMutate,
    });

    render(<FeatureComponent {...defaultProps} onSuccess={mockOnSuccess} />);
    
    const actionButton = screen.getByText('Add Item');
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalledWith({ id: '3', name: 'New Item' });
    });
  });

  it('handles errors during user actions', async () => {
    const mockMutate = vi.fn().mockRejectedValue(new Error('Action failed'));
    const mockOnError = vi.fn();

    mockUseFeatureData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
      mutate: mockMutate,
    });

    render(<FeatureComponent {...defaultProps} onError={mockOnError} />);
    
    const actionButton = screen.getByText('Add Item');
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('is accessible', () => {
    mockUseFeatureData.mockReturnValue({
      data: [{ id: '1', name: 'Test Item', value: 100 }],
      loading: false,
      error: null,
      refresh: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeatureComponent {...defaultProps} />);
    
    // Check ARIA labels and roles
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    
    // Check keyboard navigation
    const actionButton = screen.getByText('Add Item');
    actionButton.focus();
    expect(actionButton).toHaveFocus();
  });
});
```

### 2. Hook Testing Template

```typescript
// __tests__/hooks/useFeatureData.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFeatureData } from '../useFeatureData';

// Mock the service
vi.mock('../../services/featureService', () => ({
  getFeatureData: vi.fn(),
  updateFeatureData: vi.fn(),
}));

import { getFeatureData, updateFeatureData } from '../../services/featureService';

const mockGetFeatureData = vi.mocked(getFeatureData);
const mockUpdateFeatureData = vi.mocked(updateFeatureData);

describe('useFeatureData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches data on mount', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    mockGetFeatureData.mockResolvedValue({ 
      ok: true, 
      data: mockData, 
      error: null 
    });

    const { result } = renderHook(() => useFeatureData('user-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    expect(mockGetFeatureData).toHaveBeenCalledWith('user-1');
  });

  it('handles fetch errors', async () => {
    mockGetFeatureData.mockResolvedValue({
      ok: false,
      data: null,
      error: { message: 'Fetch failed', from: 'getFeatureData' },
    });

    const { result } = renderHook(() => useFeatureData('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Fetch failed');
    });
  });

  it('performs optimistic updates', async () => {
    const initialData = [{ id: '1', name: 'Test' }];
    const newItem = { id: '2', name: 'New Item' };

    mockGetFeatureData.mockResolvedValue({
      ok: true,
      data: initialData,
      error: null,
    });

    mockUpdateFeatureData.mockResolvedValue({
      ok: true,
      data: newItem,
      error: null,
    });

    const { result } = renderHook(() => useFeatureData('user-1'));

    await waitFor(() => {
      expect(result.current.data).toEqual(initialData);
    });

    await act(async () => {
      await result.current.mutate({ name: 'New Item' });
    });

    expect(result.current.data).toEqual([...initialData, newItem]);
  });
});
```

### 3. Service Testing Template

```typescript
// __tests__/services/featureService.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getFeatureData, createFeatureData } from '../featureService';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
  },
}));

import { supabase } from '../../lib/supabase';

describe('featureService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeatureData', () => {
    it('returns data successfully', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await getFeatureData('user-1');

      expect(result.ok).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('handles database errors', async () => {
      const mockError = { message: 'Database error', code: '23505' };
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      });

      const result = await getFeatureData('user-1');

      expect(result.ok).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Database error');
    });
  });
});
```

---

## 🔄 Integration Patterns

### 1. Achievement System Integration

```typescript
// For any feature that should trigger achievements
export const FeatureWithAchievements: React.FC<Props> = ({ userId }) => {
  const { checkAchievements } = useAchievementTracking(userId);
  
  const handleFeatureAction = useCallback(async (actionData: ActionData) => {
    try {
      // Perform the main action
      const result = await performAction(actionData);
      
      // Check for achievements
      const unlocked = await checkAchievements({
        type: 'feature_action',
        data: result,
        userId,
      });
      
      // Show achievement notifications if any unlocked
      if (unlocked.length > 0) {
        unlocked.forEach(achievement => {
          toast.success(`Achievement unlocked: ${achievement.title}!`);
        });
      }
      
      return result;
    } catch (error) {
      console.error('Feature action failed:', error);
      throw error;
    }
  }, [checkAchievements, userId]);
  
  // Rest of component...
};
```

### 2. Analytics Integration

```typescript
// Track user interactions for analytics
export const FeatureWithAnalytics: React.FC<Props> = ({ userId }) => {
  const { trackEvent, trackTiming } = useAnalytics();
  
  const handleUserAction = useCallback(async (action: string, data?: any) => {
    const startTime = performance.now();
    
    try {
      // Track the action start
      trackEvent('feature_action_start', {
        action,
        userId,
        timestamp: Date.now(),
      });
      
      // Perform the action
      const result = await performAction(data);
      
      // Track successful completion
      const duration = performance.now() - startTime;
      trackTiming('feature_action_duration', duration, { action });
      trackEvent('feature_action_success', { action, userId });
      
      return result;
    } catch (error) {
      // Track errors
      trackEvent('feature_action_error', {
        action,
        userId,
        error: error.message,
      });
      throw error;
    }
  }, [trackEvent, trackTiming, userId]);
  
  // Rest of component...
};
```

---

## 📱 Mobile-First Development

### 1. Responsive Design Checklist

```typescript
// Always test these breakpoints
const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 768px)', 
  desktop: '(min-width: 769px)',
};

// Touch target requirements
const TOUCH_TARGETS = {
  minimum: '44px', // Minimum touch target size
  comfortable: '48px', // Comfortable touch target size
  spacing: '8px', // Minimum spacing between targets
};

// Component example
export const MobileOptimizedComponent: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Mobile: single column, Desktop: multiple columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Mobile-friendly button sizing */}
        <Button className="h-12 px-6 text-base min-w-[44px]">
          Action
        </Button>
        
        {/* Responsive text sizing */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Responsive Title
        </h1>
        
        {/* Touch-friendly spacing */}
        <div className="space-y-4 sm:space-y-6">
          {/* Content with appropriate spacing */}
        </div>
      </div>
    </div>
  );
};
```

---

## 🚦 Performance Guidelines

### 1. Optimization Patterns

```typescript
// 1. Memoization for expensive calculations
const ExpensiveComponent: React.FC<{ data: Data[] }> = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      calculated: expensiveCalculation(item),
    }));
  }, [data]);
  
  return <div>{/* Render processedData */}</div>;
};

// 2. Callback memoization for child components
const ParentComponent: React.FC = () => {
  const [state, setState] = useState();
  
  const handleChildAction = useCallback((childData: ChildData) => {
    setState(prev => ({ ...prev, ...childData }));
  }, []); // No dependencies = stable reference
  
  return <ChildComponent onAction={handleChildAction} />;
};

// 3. Component memoization for pure components
const PureChildComponent = React.memo<ChildProps>(({ data, onAction }) => {
  return <div>{/* Pure rendering based on props */}</div>;
});

// 4. Lazy loading for large components
const LazyHeavyComponent = React.lazy(() => import('./HeavyComponent'));

const ComponentWithLazyLoading: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyHeavyComponent />
    </Suspense>
  );
};
```

### 2. Memory Management

```typescript
// Proper cleanup in useEffect
export const ComponentWithCleanup: React.FC = () => {
  useEffect(() => {
    const timer = setInterval(() => {
      // Do something
    }, 1000);
    
    const eventListener = (event: Event) => {
      // Handle event
    };
    
    window.addEventListener('resize', eventListener);
    
    // Cleanup function
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', eventListener);
    };
  }, []);
  
  return <div>Component content</div>;
};
```

---

## 🔍 Accessibility Guidelines

### 1. ARIA and Semantic HTML

```typescript
export const AccessibleComponent: React.FC = () => {
  return (
    <div>
      {/* Use semantic HTML */}
      <nav aria-label="Main navigation">
        <ul role="list">
          <li role="listitem">
            <Button 
              aria-label="Open reading timer"
              aria-describedby="timer-description"
            >
              Start Timer
            </Button>
          </li>
        </ul>
      </nav>
      
      {/* Provide descriptions for complex interactions */}
      <div id="timer-description" className="sr-only">
        Start a focused reading session with customizable duration
      </div>
      
      {/* Status announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {status && `Timer status: ${status}`}
      </div>
      
      {/* Keyboard navigation support */}
      <div 
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleAction();
          }
        }}
        onClick={handleAction}
      >
        Interactive element
      </div>
    </div>
  );
};
```

---

## 📋 Feature Implementation Checklist

### Before Starting
- [ ] Define clear user story and acceptance criteria
- [ ] Review existing components for reuse opportunities
- [ ] Plan database schema changes (if needed)
- [ ] Consider achievement system integration
- [ ] Design mobile-first responsive layout

### During Development
- [ ] Follow TypeScript strict mode
- [ ] Implement error boundaries
- [ ] Add loading and error states
- [ ] Write unit tests for logic
- [ ] Test on multiple screen sizes
- [ ] Verify accessibility with screen reader
- [ ] Check performance with React DevTools

### Before Submit
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Component is documented with JSDoc
- [ ] Error scenarios are handled gracefully
- [ ] Mobile experience is optimized
- [ ] Feature integrates with achievement system (if applicable)

---

## 🔧 AI Specific Instructions

### Prompt Structure for Feature Requests

**When implementing a new feature, use this format:**

```
I need to implement [FEATURE_NAME] for ReadRise. 

**Requirements:**
- [List specific requirements]
- [Include user interactions]
- [Specify data requirements]

**Integration Points:**
- [ ] Achievement system (if applicable)
- [ ] Existing components to reuse
- [ ] Database changes needed

**Technical Constraints:**
- Follow ReadRise design patterns
- Mobile-first responsive design
- TypeScript strict mode
- Include comprehensive error handling
- Add unit tests

Please implement following the ReadRise Development Guide patterns.
```

### Code Review Checklist 

When reviewing generated code, verify:

1. **Follows ReadRise patterns** - Uses established component structure
2. **Type safety** - No `any` types, proper interfaces
3. **Error handling** - Includes error boundaries and graceful failures
4. **Styling consistency** - Uses design system classes
5. **Performance** - Includes memoization where appropriate
6. **Accessibility** - ARIA labels and keyboard navigation
7. **Testing** - Unit tests for hooks and components
8. **Mobile optimization** - Responsive design and touch targets

### Common Corrections

```typescript
// ❌ Avoid: Generic error types
const [error, setError] = useState<any>(null);

// ✅ Correct: Specific error types
const [error, setError] = useState<string | null>(null);

// ❌ Avoid: Inline styles
<div style={{ backgroundColor: '#1e293b' }}>

// ✅ Correct: Tailwind classes
<div className="bg-slate-800">

// ❌ Avoid: Missing error boundaries
<NewComponent />

// ✅ Correct: Wrapped in error boundary
<ErrorBoundary level="component" fallback={ComponentErrorFallback}>
  <NewComponent />
</ErrorBoundary>
```

---

**Remember: Every new feature should enhance the reading experience while maintaining the high quality and consistency of the ReadRise codebase. Focus on user value, performance, and maintainability in every implementation.**