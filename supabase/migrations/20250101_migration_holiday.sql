-- Phase 4: Support Holiday Status
-- Run this in your Supabase SQL Editor to allow the 'holiday' status

ALTER TABLE public.class_sessions DROP CONSTRAINT IF EXISTS class_sessions_status_check;
ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_status_check CHECK (status IN ('present', 'absent', 'cancelled', 'upcoming', 'holiday'));
