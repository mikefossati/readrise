// Generic Result type for API responses
export type Result<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: SupabaseError };

export type SupabaseError = {
  message: string;
  code?: string;
  context?: Record<string, unknown>;
  from?: string; // e.g. function or service name
};
