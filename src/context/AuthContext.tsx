import { useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import AuthContext from './AuthContextContext';

import { supabase } from '../lib/supabase';
import { getProfile, updateProfile } from '../lib/supabase';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ComponentErrorFallback } from '../components/common/ErrorFallback';
import { setErrorUser, clearErrorUser, captureError } from '../services/errorService';


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // StrictMode protection flags
  const initialized = useRef(false);
  const mounted = useRef(true);
  const listenerRef = useRef<{ subscription: { unsubscribe: () => void } } | null>(null);
  const sessionHandled = useRef(false);

  // Track component mounting state
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Primary auth state listener (this handles most cases)
  useEffect(() => {
    if (initialized.current) {
      console.log('[AuthProvider] Skipping duplicate listener setup (StrictMode)');
      return;
    }
    
    initialized.current = true;
    console.log('[AuthProvider] Setting up auth state listener');
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current) {
        console.log('[AuthProvider] Auth state change ignored - component unmounted');
        return;
      }
      
      console.log('[AuthProvider] onAuthStateChange:', event, session ? 'has session' : 'no session');
      
      const user = session?.user ?? null;
      setUser(user);
      
      // Mark that we've handled a session
      sessionHandled.current = true;
      
      // Always set loading to false when auth state changes
      setLoading(false);
      setError(null);
      
      // Update user in error service
      if (user) {
        setErrorUser(user.id);
        
        // Handle OAuth user profile creation
        if (event === 'SIGNED_IN' && user.app_metadata?.provider === 'google') {
          console.log('[AuthProvider] OAuth user signed in, checking profile...');
          handleOAuthProfile(user);
        }
      } else {
        clearErrorUser();
      }
    });
    
    // Store listener reference for cleanup
    listenerRef.current = listener;

    // Cleanup function
    return () => {
      console.log('[AuthProvider] Cleaning up auth listener');
      if (listenerRef.current) {
        listenerRef.current.subscription.unsubscribe();
        listenerRef.current = null;
      }
    };
  }, []);

  // Fallback session check (only if auth state listener doesn't fire within 3 seconds)
  useEffect(() => {
    const fallbackSessionCheck = async () => {
      // Wait a bit to see if auth state listener handles it
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (!mounted.current) return;
      
      // If session was already handled by listener, skip manual check
      if (sessionHandled.current) {
        console.log('[AuthProvider] Session already handled by listener, skipping manual check');
        return;
      }
      
      console.log('[AuthProvider] Auth listener didn\'t fire, trying manual session check...');
      
      try {
        // Add a shorter timeout for manual check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log('[AuthProvider] Manual session check timed out, using listener-only approach');
        }, 5000);
        
        const { data, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);
        
        if (!mounted.current) return;
        
        if (error) {
          console.error('[AuthProvider] Manual session check error:', error);
          setError(null); // Don't show error, listener will handle it
          setLoading(false);
          return;
        }
        
        const user = data.session?.user ?? null;
        console.log('[AuthProvider] Manual session check result:', user ? user.id : 'no user');
        
        setUser(user);
        
        if (user) {
          setErrorUser(user.id);
        } else {
          clearErrorUser();
        }
        
        setError(null);
        
      } catch (err) {
        console.log('[AuthProvider] Manual session check failed, relying on listener:', err);
        // Don't set error - the auth state listener will handle auth properly
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    fallbackSessionCheck();
  }, []);

  // Handle OAuth profile creation
  const handleOAuthProfile = async (user: any) => {
    try {
      const { data: profile } = await getProfile(user.id);
      if (!profile && user.user_metadata?.full_name) {
        console.log('[AuthProvider] Creating profile for OAuth user');
        await updateProfile(user.id, { 
          username: user.user_metadata.full_name || user.email?.split('@')[0] 
        });
      }
    } catch (profileError) {
      console.error('[AuthProvider] Profile creation failed:', profileError);
    }
  };

  // Safety timeout (as last resort)
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (mounted.current && loading && !sessionHandled.current) {
        console.log('[AuthProvider] Safety timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(safetyTimeout);
  }, [loading]);

  // Auth actions
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Don't set loading to false here - auth state listener will handle it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setLoading(false);
      captureError(err as Error, { context: 'user_login', email });
      throw err;
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
      // Don't set loading to false here - auth state listener will handle it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      setLoading(false);
      captureError(err as Error, { context: 'user_signup', email });
      throw err;
    }
  };

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
      // Don't set loading to false here - auth state listener will handle it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(errorMessage);
      setLoading(false);
      captureError(err as Error, { context: 'google_oauth' });
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Don't set loading to false here - auth state listener will handle it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      setLoading(false);
      throw err;
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
    googleSignIn,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
