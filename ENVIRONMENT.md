# Environment Variable Management for ReadRise

## Overview
ReadRise uses Vite, which exposes all `VITE_`-prefixed environment variables to the client. **Never store secrets or sensitive credentials in any variable prefixed with `VITE_`.**

### Current Variables
| Variable                   | Safe for Client | Description                                 | Example Value                   |
|----------------------------|:--------------:|---------------------------------------------|---------------------------------|
| VITE_SUPABASE_URL          |      Yes       | Supabase project URL                        | https://xxx.supabase.co         |
| VITE_SUPABASE_ANON_KEY     |      Yes       | Supabase anon public key (never service)    | eyJhbGci...                     |
| VITE_GOOGLE_BOOKS_API_KEY  |      Yes*      | Google Books API key (public, rate-limited) | AIzaSyD...                      |
| VITE_APP_ENV               |      Yes       | App environment: development/staging/prod   | development                     |
| VITE_ERROR_ENDPOINT        |      Yes       | Error reporting endpoint                    | https://error.example.com       |

> \*API keys for public APIs are generally safe, but may be abused if exposed. Monitor usage and rotate if needed.

## Sensitive vs Safe Variables
- **Safe for client**: Only variables with the `VITE_` prefix and non-sensitive values.
- **Sensitive**: Never store secrets, database passwords, or service role keys in any `VITE_` variable or in `.env.*` files used by Vite.

## Environment Files
- `.env.example` – Template for all required variables
- `.env.development` – For local development
- `.env.staging` – For staging deployments
- `.env.production` – For production deployments

## Validation & Safety
- All required variables are validated at runtime (see `src/env.ts`).
- The Supabase key must be an **anon** key, never a service role key.
- A script (`scripts/validateEnv.ts`) is provided to check your environment before build/deploy.

## Usage in Code
Import and use the validated environment object:
```ts
import { env } from '@/env';
console.log(env.VITE_SUPABASE_URL);
```

## Adding New Variables
1. Prefix with `VITE_` if it must be available to the client.
2. Add to `.env.example` and all environment files.
3. Add to `src/env.ts` and `src/types/env.d.ts` for validation and typing.
4. Document in this file whether it is safe or sensitive.

## Best Practices
- **Never** commit secrets to the repository.
- Use only public/anon keys in client-side code.
- Rotate keys if you suspect exposure or abuse.
- Use the provided validation script before deploying.

---

For questions or issues, see the README or contact the maintainers.
