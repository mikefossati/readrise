// scripts/validateEnv.ts
// Script to validate required environment variables and ensure no secrets are exposed
import fs from 'fs';
import path from 'path';

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GOOGLE_BOOKS_API_KEY',
  'VITE_APP_ENV',
  'VITE_ERROR_ENDPOINT',
];

const SAFE_PREFIX = 'VITE_';

function loadEnv(envPath: string) {
  const env: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return env;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  }
  return env;
}

function validateEnv(env: Record<string, string>) {
  let valid = true;
  for (const key of REQUIRED_VARS) {
    if (!env[key] || env[key].trim() === '') {
      console.error(`Missing required env var: ${key}`);
      valid = false;
    }
  }
  // Supabase key safety check
  if (env['VITE_SUPABASE_ANON_KEY'] && env['VITE_SUPABASE_ANON_KEY'].includes('service_role')) {
    console.error('VITE_SUPABASE_ANON_KEY must NOT be a service role key!');
    valid = false;
  }
  return valid;
}

function auditEnv(env: Record<string, string>) {
  for (const key in env) {
    if (!key.startsWith(SAFE_PREFIX)) {
      console.warn(`Warning: ${key} is not prefixed with ${SAFE_PREFIX} and may be exposed to the client.`);
    }
  }
}

const envPath = path.resolve(process.cwd(), '.env.local');
const env = loadEnv(envPath);

const valid = validateEnv(env);
auditEnv(env);
if (!valid) {
  process.exit(1);
} else {
  console.log('All required environment variables are set and safe.');
}
