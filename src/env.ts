// src/env.ts
// Centralized environment variable validation and typing for ReadRise

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GOOGLE_BOOKS_API_KEY',
  'VITE_APP_ENV',
  'VITE_ERROR_ENDPOINT',
] as const;

type EnvKeys = typeof requiredVars[number];

type Env = Record<EnvKeys, string>;

function getEnv(): Env {
  const env: Partial<Env> = {};
  for (const key of requiredVars) {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    // Supabase key safety check
    if (key === 'VITE_SUPABASE_ANON_KEY' && value.includes('service_role')) {
      throw new Error('VITE_SUPABASE_ANON_KEY must NOT be a service role key!');
    }
    env[key] = value;
  }
  return env as Env;
}

export const env = getEnv();
