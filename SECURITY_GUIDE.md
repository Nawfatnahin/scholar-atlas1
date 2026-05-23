# Security Implementation Guide

I have implemented several security improvements for Scholar Atlas. To finalize the setup, you need to configure some environment variables and database rules.

## 1. Cloudflare Turnstile
I have added Turnstile bot protection to Login, Signup, and PDF tools.
- Go to [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) and create a new site.
- Add these to your Vercel environment variables:
```bash
npx vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production
npx vercel env add TURNSTILE_SECRET_KEY production
```

## 2. Rate Limiting (Upstash)
I have added rate limiting using Upstash Redis.
- Create a Redis database at [Upstash](https://console.upstash.com/).
- Add these to your Vercel environment variables:
```bash
npx vercel env add UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
```

## 3. Supabase RLS Policies
Run the following SQL in your Supabase SQL Editor to secure your data:

```sql
-- Enable RLS on usage_stats
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own usage stats
CREATE POLICY "Users can view own usage stats" ON usage_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own usage stats
CREATE POLICY "Users can insert own usage stats" ON usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on pdf_uploads bucket (Storage)
-- Go to Storage -> Buckets -> pdf_uploads -> Policies
-- Or run this if you have access to storage schema:
-- (Most users use the Supabase Dashboard for Storage policies)
```

**Recommended Storage Policies:**
- **Select:** `(role() = 'authenticated' AND (substring(name from 1 for (36)) = auth.uid()::text))`
- **Insert:** `(role() = 'authenticated' AND (substring(name from 1 for (36)) = auth.uid()::text))`
- **Delete:** `(role() = 'authenticated' AND (substring(name from 1 for (36)) = auth.uid()::text))`

## 4. Security Headers
I have updated `next.config.ts` with:
- Content Security Policy (CSP)
- X-Frame-Options (Anti-Clickjacking)
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

## 5. Upload Protection
- Max file size: 50MB (enforced on client).
- File type validation: MIME type check + Magic number verification (enforced on client before processing).
- Rate limited: 10 operations per minute per IP.
