-- CGPA Semester Setup Migration
-- Run this in the Supabase SQL Editor BEFORE deploying the new UI.

-- 1. Create the semester setup table
CREATE TABLE IF NOT EXISTS public.cgpa_semester_setup (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_semesters  INTEGER NOT NULL DEFAULT 8,
  current_semester INTEGER NOT NULL DEFAULT 1,
  -- previous_gpas stores { "1": 3.75, "2": 3.50 } — semester number (string key) -> GPA
  previous_gpas JSONB NOT NULL DEFAULT '{}'::jsonb,
  initialized   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.cgpa_semester_setup ENABLE ROW LEVEL SECURITY;

-- 3. RLS policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can manage own semester setup'
    AND tablename = 'cgpa_semester_setup'
  ) THEN
    CREATE POLICY "Users can manage own semester setup"
      ON public.cgpa_semester_setup
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Add semester_number column to existing auto courses (backward-compatible, defaults to 1)
ALTER TABLE public.cgpa_courses_auto
  ADD COLUMN IF NOT EXISTS semester_number INTEGER NOT NULL DEFAULT 1;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_cgpa_semester_setup_user_id
  ON public.cgpa_semester_setup(user_id);

CREATE INDEX IF NOT EXISTS idx_cgpa_courses_auto_semester
  ON public.cgpa_courses_auto(user_id, semester_number);
