import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { updateProfile } from '../lib/supabase';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ComponentErrorFallback } from '../components/common/ErrorFallback';
import { setErrorUser, clearErrorUser, captureError } from '../services/errorService';

interface AuthContextProps {
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, profile?: { username?: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user ?? null;
        setUser(user);
        // Set user in error service
        if (user) {
          setErrorUser(user.id);
        } else {
          clearErrorUser();
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to initialize authentication');
        captureError(err as Error, { context: 'auth_initialization' });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUser(user);
      setLoading(false);
      // Update user in error service
      if (user) {
        setErrorUser(user.id);
      } else {
        clearErrorUser();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      captureError(err as Error, { context: 'user_login', email });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, profile?: { username?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        await updateProfile(data.user.id, { username: profile?.username || email });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      captureError(err as Error, { context: 'user_signup', email });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <ErrorBoundary
      level="component"
      fallback={ComponentErrorFallback}
      onError={(error: Error, errorInfo: { componentStack?: string | null }, errorId: string) => {
        console.error('AuthProvider error:', { error, errorInfo, errorId });
      }}
    >
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
