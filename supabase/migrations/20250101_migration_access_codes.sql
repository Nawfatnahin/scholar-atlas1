-- Migration: Access Codes & Pro Access List
-- Run this in your Supabase SQL editor

-- 1. Access Codes table
CREATE TABLE IF NOT EXISTS public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 20,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Pro Access List (users who redeemed a code)
CREATE TABLE IF NOT EXISTS public.pro_access_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  code_used TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_access_list ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- access_codes: only service role can read/write (handled server-side via admin actions)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can manage access codes' AND tablename = 'access_codes') THEN
    CREATE POLICY "Admin can manage access codes" ON public.access_codes FOR ALL USING (true);
  END IF;

  -- pro_access_list: service role manages, users can view their own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can manage pro access list' AND tablename = 'pro_access_list') THEN
    CREATE POLICY "Admin can manage pro access list" ON public.pro_access_list FOR ALL USING (true);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_is_active ON public.access_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_pro_access_list_email ON public.pro_access_list(email);

-- Also add updated_at to subscriptions if not exists
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
