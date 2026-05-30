import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash env variables are configured
const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_URL !== 'https://placeholder.upstash.io' &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== 'placeholder';

// Initialize Redis safely. If env vars are missing, we'll handle it gracefully.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder',
});

// Underling rate limiters
const rawAuthRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

const rawMutationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "ratelimit:mutation",
});

const rawPdfRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:pdf",
});

const rawGlobalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:global",
});

// A safe rate limit runner that falls back gracefully if Redis/Upstash is down or unconfigured
async function safeLimit(limiter: Ratelimit, key: string) {
  if (!isRedisConfigured) {
    console.warn(`[JARVIS]: Upstash Redis is not configured. Gracefully bypassing rate limit for key: ${key}`);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    return await limiter.limit(key);
  } catch (error: any) {
    console.error(`[JARVIS]: Rate limiter failed (likely due to DNS or Upstash service anomaly), falling back to bypass. Error:`, error.message || error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

// Exported Rate Limiters matching standard interface
export const authRateLimit = {
  limit: (key: string) => safeLimit(rawAuthRateLimit, key),
};

export const mutationRateLimit = {
  limit: (key: string) => safeLimit(rawMutationRateLimit, key),
};

export const pdfRateLimit = {
  limit: (key: string) => safeLimit(rawPdfRateLimit, key),
};

export const globalRateLimit = {
  limit: (key: string) => safeLimit(rawGlobalRateLimit, key),
};

export function getIp(req: Request | Headers) {
  const headers = req instanceof Headers ? req : req.headers;
  const ip = headers.get("cf-connecting-ip") || headers.get("x-forwarded-for") || "127.0.0.1";
  return ip.split(",")[0].trim();
}
