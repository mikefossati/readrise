import { useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import AuthContext from './AuthContextContext';

import { supabase } from '../lib/supabase';
import { getProfile, updateProfile } from '../lib/supabase';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ComponentErrorFallback } from '../components/common/ErrorFallback';
import { setErrorUser, clearErrorUser, captureError } from '../services/errorService';


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    console.log('[AuthProvider] useEffect mount');
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] before supabase.auth.getSession()');
        try {
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('getSession timeout')), 5000)
          );
          const { data } = await Promise.race([
            supabase.auth.getSession(),
            timeout,
          ]) as { data: { session: Session | null }, error: any };
          console.log('[AuthProvider] after supabase.auth.getSession()', data);
          const user = data.session?.user ?? null;
          console.log('[AuthProvider] setUser (initializeAuth):', user);
          setUser(user);
          // Set user in error service
          if (user) {
            setErrorUser(user.id);
          } else {
            clearErrorUser();
          }
        } catch (err) {
          console.error('[AuthProvider] getSession error:', err);
          throw err;
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] onAuthStateChange:', event, session);
      const user = session?.user ?? null;
      setUser(user);
      try {
        if (user && event === 'SIGNED_IN') {
          // Check if this is an OAuth user without a profile
          const { ok, data: profile, error: profileError } = await getProfile(user.id);
          if (!ok && profileError) {
            // Only log error, don't block
            console.warn('[AuthContext] Profile fetch error:', profileError);
          }
          if (!profile && user.app_metadata?.provider === 'google') {
            // Create profile for new OAuth user
            const username = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Reader';
            const updateRes = await updateProfile(user.id, { username });
            if (!updateRes.ok) {
              setError(updateRes.error.message || 'Failed to create OAuth profile');
              captureError(updateRes.error as Error, { context: 'oauth_profile_creation', userId: user.id });
            }
          }
        }
      } catch (err) {
        setError('Failed to handle OAuth profile creation');
        captureError(err as Error, { context: 'oauth_profile_creation', userId: user?.id });
      } finally {
        // Update user in error service
        if (user) {
          setErrorUser(user.id);
        } else {
          clearErrorUser();
        }
        setLoading(false);
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

  const googleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(errorMessage);
      captureError(err as Error, { context: 'google_oauth' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    googleSignIn,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

