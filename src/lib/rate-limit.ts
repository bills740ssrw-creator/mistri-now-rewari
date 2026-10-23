type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Small in-process limiter for auth-sensitive actions. Good enough for a
 * single instance; move this to Upstash/Redis (or rely on Supabase's built-in
 * auth limits) when running more than one server instance.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

if (buckets.size === 0) {
  // Opportunistic cleanup so the map cannot grow without bound.
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
      }
    },
    10 * 60_000,
  ).unref?.();
}
