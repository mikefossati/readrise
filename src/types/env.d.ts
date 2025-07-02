// src/types/env.d.ts
// TypeScript types for environment variables

declare module 'env' {
  export interface Env {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_GOOGLE_BOOKS_API_KEY: string;
    VITE_APP_ENV: 'development' | 'staging' | 'production';
    VITE_ERROR_ENDPOINT: string;
  }
  export const env: Env;
}
