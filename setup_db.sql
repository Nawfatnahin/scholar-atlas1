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
  target_percentage INTEGER DEFAULT 75,
  semester_start_date DATE,
  total_weeks INTEGER DEFAULT 15,
  classes_per_day INTEGER DEFAULT 1,
  class_days TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Attendance Logs (Legacy/Simple)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Class Sessions (Automated Schedule)
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'cancelled', 'upcoming', 'holiday')) DEFAULT 'upcoming',
  is_extra BOOLEAN DEFAULT false,
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
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
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

    -- attendance_logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own attendance logs' AND tablename = 'attendance_logs') THEN
        CREATE POLICY "Users can manage own attendance logs" ON public.attendance_logs FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.subjects
            WHERE subjects.id = attendance_logs.subject_id
            AND subjects.user_id = auth.uid()
          )
        );
    END IF;

    -- class_sessions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own sessions' AND tablename = 'class_sessions') THEN
        CREATE POLICY "Users can manage own sessions" ON public.class_sessions FOR ALL USING (auth.uid() = user_id);
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
CREATE INDEX IF NOT EXISTS idx_class_sessions_subject_id ON public.class_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_user_id ON public.class_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date ON public.class_sessions(date);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
