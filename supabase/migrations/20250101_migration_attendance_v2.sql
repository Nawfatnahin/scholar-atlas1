-- Phase 1: Update subjects table
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS course_code TEXT,
ADD COLUMN IF NOT EXISTS semester_start_date DATE,
ADD COLUMN IF NOT EXISTS total_weeks INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS classes_per_day INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS class_days TEXT[] DEFAULT '{}';

-- Phase 2: Create class_sessions table
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'cancelled', 'upcoming')) DEFAULT 'upcoming',
  is_extra BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 3: Enable RLS and set policies
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own sessions' AND tablename = 'class_sessions') THEN
        CREATE POLICY "Users can manage own sessions" ON public.class_sessions FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Optional: Indexing for performance
CREATE INDEX IF NOT EXISTS idx_class_sessions_subject_id ON public.class_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_user_id ON public.class_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date ON public.class_sessions(date);
