import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, profile?: { username?: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  googleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export default AuthContext;
