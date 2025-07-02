// Simple in-memory + localStorage cache for book metadata and covers
// Used by library and book search components

export interface CacheOptions {
  ttl?: number; // ms, default 24h
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(key: string) {
  return `rr_cache_${key}`;
}

export function setCache<T>(key: string, value: T, options?: CacheOptions) {
  const ttl = options?.ttl ?? DEFAULT_TTL;
  const expires = Date.now() + ttl;
  const payload = JSON.stringify({ value, expires });
  try {
    localStorage.setItem(getCacheKey(key), payload);
  } catch {}
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const { value, expires } = JSON.parse(raw);
    if (expires && Date.now() > expires) {
      localStorage.removeItem(getCacheKey(key));
      return null;
    }
    return value as T;
  } catch {
    return null;
  }
}

export function clearCache(key: string) {
  try {
    localStorage.removeItem(getCacheKey(key));
  } catch {}
}

export function clearAllCache() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('rr_cache_'))
      .forEach(k => localStorage.removeItem(k));
  } catch {}
}
