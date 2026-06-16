-- CGPA Management: Database Migration
-- Execute this in Supabase SQL Editor

-- 1. CGPA Settings (global target per user)
CREATE TABLE IF NOT EXISTS public.cgpa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  target_cgpa NUMERIC(3,2) DEFAULT 3.50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Grade Scales
CREATE TABLE IF NOT EXISTS public.cgpa_grade_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scale_name TEXT NOT NULL DEFAULT 'Default Scale',
  mappings JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_global BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Manual CGPA Courses
CREATE TABLE IF NOT EXISTS public.cgpa_courses_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_code TEXT,
  credit_hours NUMERIC(3,1) NOT NULL DEFAULT 3.0,
  grade_point_obtained NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Auto CGPA Courses
CREATE TABLE IF NOT EXISTS public.cgpa_courses_auto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_code TEXT,
  credit_hours NUMERIC(3,1) NOT NULL DEFAULT 3.0,
  target_grade_point NUMERIC(3,2) NOT NULL DEFAULT 4.00,
  grade_scale_id UUID REFERENCES public.cgpa_grade_scales(id) ON DELETE SET NULL,
  ct_total INTEGER DEFAULT 0,
  ct_best_of INTEGER DEFAULT 0,
  ct_weight NUMERIC(5,2) DEFAULT 0,
  assignment_total_marks NUMERIC(6,2) DEFAULT 0,
  assignment_obtained NUMERIC(6,2) DEFAULT 0,
  assignment_weight NUMERIC(5,2) DEFAULT 0,
  attendance_linked BOOLEAN DEFAULT false,
  attendance_course_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  attendance_total_marks NUMERIC(5,2) DEFAULT 0,
  attendance_threshold_percentage NUMERIC(5,2) DEFAULT 75,
  attendance_weight NUMERIC(5,2) DEFAULT 0,
  exam_weight NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Class Tests
CREATE TABLE IF NOT EXISTS public.cgpa_class_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.cgpa_courses_auto(id) ON DELETE CASCADE,
  ct_number INTEGER NOT NULL,
  marks_obtained NUMERIC(6,2) DEFAULT 0,
  total_marks NUMERIC(6,2) DEFAULT 0,
  is_counted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cgpa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cgpa_grade_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cgpa_courses_manual ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cgpa_courses_auto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cgpa_class_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
    -- cgpa_settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own cgpa settings' AND tablename = 'cgpa_settings') THEN
        CREATE POLICY "Users can manage own cgpa settings" ON public.cgpa_settings FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- cgpa_grade_scales
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own grade scales' AND tablename = 'cgpa_grade_scales') THEN
        CREATE POLICY "Users can manage own grade scales" ON public.cgpa_grade_scales FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- cgpa_courses_manual
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own manual courses' AND tablename = 'cgpa_courses_manual') THEN
        CREATE POLICY "Users can manage own manual courses" ON public.cgpa_courses_manual FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- cgpa_courses_auto
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own auto courses' AND tablename = 'cgpa_courses_auto') THEN
        CREATE POLICY "Users can manage own auto courses" ON public.cgpa_courses_auto FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- cgpa_class_tests (via course ownership)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own class tests' AND tablename = 'cgpa_class_tests') THEN
        CREATE POLICY "Users can manage own class tests" ON public.cgpa_class_tests FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.cgpa_courses_auto
            WHERE cgpa_courses_auto.id = cgpa_class_tests.course_id
            AND cgpa_courses_auto.user_id = auth.uid()
          )
        );
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cgpa_settings_user_id ON public.cgpa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_cgpa_grade_scales_user_id ON public.cgpa_grade_scales(user_id);
CREATE INDEX IF NOT EXISTS idx_cgpa_courses_manual_user_id ON public.cgpa_courses_manual(user_id);
CREATE INDEX IF NOT EXISTS idx_cgpa_courses_auto_user_id ON public.cgpa_courses_auto(user_id);
CREATE INDEX IF NOT EXISTS idx_cgpa_class_tests_course_id ON public.cgpa_class_tests(course_id);
