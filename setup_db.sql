-- Scholar Atlas: Master Database Setup
-- This script combines all necessary tables and migrations for a fresh setup.

-- 1. Usage Statistics (Analytics)
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subjects (Academic Courses)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  course_code TEXT,
  required_threshold NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  personal_target NUMERIC(5,2) DEFAULT NULL,
  total_classes_planned INTEGER DEFAULT NULL,
  semester_start_date DATE DEFAULT NULL,
  semester_end_date DATE DEFAULT NULL,
  schedule_days TEXT[] DEFAULT '{}',
  schedule_time TIME DEFAULT NULL,
  color_tag TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_threshold CHECK (required_threshold BETWEEN 0 AND 100),
  CONSTRAINT chk_personal CHECK (personal_target IS NULL OR personal_target BETWEEN 0 AND 100)
);

-- 3. Attendance Records
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  absence_type TEXT NOT NULL DEFAULT 'unexcused' CHECK (absence_type IN ('present', 'unexcused', 'medical', 'excused', 'cancelled')),
  note TEXT DEFAULT NULL,
  class_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER GENERATED ALWAYS AS (EXTRACT(WEEK FROM class_date)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_subject_class_date UNIQUE (subject_id, class_date)
);

-- 4. Holidays
CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'subject')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tasks (Kanban Board)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Waitlist (Pro Plan signups)
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Subscriptions (Pro Plan status)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  premium_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Configuration
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- usage_stats
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own stats' AND tablename = 'usage_stats') THEN
        CREATE POLICY "Users can view own stats" ON public.usage_stats FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own stats' AND tablename = 'usage_stats') THEN
        CREATE POLICY "Users can insert own stats" ON public.usage_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- subjects
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own subjects' AND tablename = 'subjects') THEN
        CREATE POLICY "Users can manage own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- attendance_records
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own attendance records' AND tablename = 'attendance_records') THEN
        CREATE POLICY "Users can manage own attendance records" ON public.attendance_records FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- holidays
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own holidays' AND tablename = 'holidays') THEN
        CREATE POLICY "Users manage own holidays" ON public.holidays FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;

    -- tasks
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own tasks' AND tablename = 'tasks') THEN
        CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- waitlist (Admin only for view, Public for insert)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can sign up for waitlist' AND tablename = 'waitlist') THEN
        CREATE POLICY "Public can sign up for waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
    END IF;

    -- subscriptions (User can view own)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own subscription' AND tablename = 'subscriptions') THEN
        CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.email = subscriptions.email
            AND auth.users.id = auth.uid()
          )
        );
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_records_subject_id ON public.attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_class_date ON public.attendance_records(class_date DESC);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_holidays_user_id ON public.holidays(user_id);
