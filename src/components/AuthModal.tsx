import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../context/AuthContext';
import { BookOpen, X } from 'lucide-react';

// Google "G" SVG icon for branding
const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <g>
      <path d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.5a4.7 4.7 0 01-2.04 3.09v2.57h3.3c1.94-1.8 3.04-4.45 3.04-7.45z" fill="#4285F4"/>
      <path d="M10 20c2.7 0 4.97-.9 6.63-2.45l-3.3-2.57c-.92.62-2.1.99-3.33.99-2.56 0-4.73-1.73-5.5-4.07H1.1v2.6A9.97 9.97 0 0010 20z" fill="#34A853"/>
      <path d="M4.5 12.9A5.99 5.99 0 013.7 10c0-.99.18-1.95.5-2.9V4.5H1.1A9.96 9.96 0 000 10c0 1.64.39 3.19 1.1 4.5l3.4-2.6z" fill="#FBBC05"/>
      <path d="M10 3.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.94 9.94 0 0010 0 9.97 9.97 0 001.1 4.5l3.4 2.6C5.27 5.69 7.44 3.96 10 3.96z" fill="#EA4335"/>
    </g>
  </svg>
);


interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, mode: externalMode }) => {
  const { login, signup, clearError, googleSignIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(externalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  const [emailValid, setEmailValid] = useState(true);
  const [usernameValid, setUsernameValid] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  

  // Sync internal mode with external prop only on mount
  React.useEffect(() => {
    setMode(externalMode);
    resetForm();
  }, [externalMode]);

  // Helper to clear fields and errors
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setGoogleError(null);
    setFormError(null);
    setSuccess(false);
    setPasswordStrength('');
    setEmailValid(true);
    setUsernameValid(true);
    if (clearError) clearError();
  };

  const handleSwitchMode = () => {
    setTransitioning(true);
    setTimeout(() => {
      setMode(m => (m === 'login' ? 'signup' : 'login'));
      resetForm();
      setTransitioning(false);
    }, 200); // 200ms for smooth fade
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      await googleSignIn();
      setSuccess(true);
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setGoogleError(formatError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email/password submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setEmailLoading(true);
    // Validate
    if (!validateEmail(email)) {
      setFormError('Please enter a valid email address.');
      setEmailLoading(false);
      return;
    }
    if (mode === 'signup' && !validatePassword(password)) {
      setFormError('Password must be at least 8 characters, with a number and a letter.');
      setEmailLoading(false);
      return;
    }
    if (mode === 'signup' && !username) {
      setFormError('Username is required.');
      setEmailLoading(false);
      return;
    }
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, { username });
      }
      setSuccess(true);
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setFormError(formatError(err));
    } finally {
      setEmailLoading(false);
    }
  };

  // Real-time validation for email
  React.useEffect(() => {
    if (email.length > 0) {
      setEmailValid(validateEmail(email));
    } else {
      setEmailValid(true);
    }
  }, [email]);

  // Real-time password strength
  React.useEffect(() => {
    if (mode === 'signup' && password.length > 0) {
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordStrength('');
    }
  }, [password, mode]);

  // Real-time username validation (stub for async availability)
  React.useEffect(() => {
    if (mode === 'signup' && username.length > 0) {
      setUsernameValid(username.length >= 3);
    } else {
      setUsernameValid(true);
    }
  }, [username, mode]);

  // Clear errors on input change
  React.useEffect(() => {
    setFormError(null);
    setGoogleError(null);
    if (clearError) clearError();
  }, [email, password, username]);

  // Format error messages
  function formatError(err: any): string {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err.message) {
      if (err.message.includes('network')) return 'Network error. Please check your connection and try again.';
      if (err.message.includes('invalid')) return 'Invalid credentials. Please check your input.';
      if (err.message.includes('password')) return 'Incorrect password or password does not meet requirements.';
      if (err.message.includes('email')) return 'Invalid or already used email address.';
      return err.message;
    }
    return 'An unexpected error occurred.';
  }

  // Validation helpers
  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function validatePassword(password: string) {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  }
  function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 8) return 'weak';
    if (/[A-Za-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'strong';
    if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) return 'medium';
    return 'weak';
  }

  const firstFieldRef = React.useRef<HTMLInputElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  // Focus management: focus first field on open, trap focus
  React.useEffect(() => {
    if (open && firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusableEls = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>('input, button, [tabindex]:not([tabindex="-1"])')
        ).filter(el => !el.hasAttribute('disabled'));
        if (focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // SAFETY: Never return or render a DOM node (like document.body, modalRef.current, etc.)
  // Only React elements or null are returned below.

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className={`relative z-[110] w-full max-w-md mx-auto bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-700 transition-all duration-300 ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 transition-all duration-200">
            {mode === 'login' ? 'Welcome Back' : 'Join ReadRise'}
          </h2>
          <p className="text-gray-400 text-sm transition-all duration-200">
            {mode === 'login' 
              ? 'Continue your reading journey' 
              : 'Start tracking your reading habits'
            }
          </p>
        </div>

        {/* Google Sign-In */}
        <div className={`mb-6 transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
          {googleError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3" role="alert" aria-live="assertive">
              <p className="text-red-400 text-sm text-center">{googleError}</p>
              {googleError.includes('Network') && (
                <Button type="button" size="sm" className="mt-2" onClick={handleGoogleSignIn} disabled={googleLoading}>
                  Retry Google Sign-In
                </Button>
              )}
            </div>
          )}
          <Button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || emailLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4"
          >
            <span className="text-lg font-bold"><GoogleG /></span>
            {googleLoading ? (
              <span className="flex items-center">
                <span className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-900 rounded-full animate-spin mr-2"></span>
                Signing in with Google...
              </span>
            ) : 'Continue with Google'}
          </Button>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-slate-700/50"></div>
            <span className="mx-3 text-gray-400 text-xs font-semibold select-none">OR</span>
            <div className="flex-grow border-t border-slate-700/50"></div>
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className={`space-y-5 transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
          {mode === 'signup' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <Input
                id="username"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required={mode === 'signup'}
                className={`bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${username && !usernameValid ? 'border-red-500' : ''}`}
              />
              {username && !usernameValid && (
                <p className="text-red-400 text-xs mt-1">Username must be at least 3 characters.</p>
              )}
              {/* Username availability check can be added here */}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-invalid={!emailValid}
              aria-describedby="email-error"
              className={`bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${email && !emailValid ? 'border-red-500' : ''}`}
            />
            {email && !emailValid && (
              <p id="email-error" className="text-red-400 text-xs mt-1" role="alert">Please enter a valid email address.</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
            {mode === 'signup' && password && (
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${passwordStrength === 'strong' ? 'bg-green-400' : passwordStrength === 'medium' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className={`text-xs ${passwordStrength === 'strong' ? 'text-green-400' : passwordStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>{passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} password</span>
              </div>
            )}
          </div>

          {/* Auth error messages */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{formError}</p>
              {formError.includes('Network') && (
                <Button type="button" size="sm" className="mt-2" onClick={handleSubmit} disabled={emailLoading}>
                  Retry
                </Button>
              )}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-400 text-sm text-center">Success! Redirecting...</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button 
              type="submit" 
              disabled={emailLoading || googleLoading || !emailValid || (mode === 'signup' && (!usernameValid || !password))} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {emailLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="w-full text-gray-400 hover:text-white hover:bg-slate-800/50 transition-colors py-3"
              disabled={emailLoading || googleLoading}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-slate-700/50">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button
              type="button"
              onClick={handleSwitchMode}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              disabled={transitioning}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};