-- Scholar Atlas - Row Level Security (RLS) Migration
-- Date: 2026-06-02
-- Purpose: Enforce data isolation so users can only access their own records
--
-- IMPORTANT: Run this in the Supabase SQL Editor.
-- Safe to run multiple times — policies use IF NOT EXISTS pattern via DROP IF EXISTS first.
-- Test after applying: try accessing data with a different user's token.

-- ============================================================
-- ENABLE RLS ON ALL USER-DATA TABLES
-- ============================================================

ALTER TABLE IF EXISTS subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cgpa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cgpa_semester_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cgpa_grade_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cgpa_courses_manual ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cgpa_courses_auto ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cgpa_class_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SUBJECTS TABLE
-- ============================================================

DROP POLICY IF EXISTS "subjects_select_own" ON subjects;
CREATE POLICY "subjects_select_own"
  ON subjects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subjects_insert_own" ON subjects;
CREATE POLICY "subjects_insert_own"
  ON subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subjects_update_own" ON subjects;
CREATE POLICY "subjects_update_own"
  ON subjects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subjects_delete_own" ON subjects;
CREATE POLICY "subjects_delete_own"
  ON subjects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ATTENDANCE RECORDS TABLE
-- ============================================================

DROP POLICY IF EXISTS "attendance_records_select_own" ON attendance_records;
CREATE POLICY "attendance_records_select_own"
  ON attendance_records FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "attendance_records_insert_own" ON attendance_records;
CREATE POLICY "attendance_records_insert_own"
  ON attendance_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "attendance_records_update_own" ON attendance_records;
CREATE POLICY "attendance_records_update_own"
  ON attendance_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "attendance_records_delete_own" ON attendance_records;
CREATE POLICY "attendance_records_delete_own"
  ON attendance_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TASKS TABLE
-- ============================================================

DROP POLICY IF EXISTS "tasks_select_own" ON tasks;
CREATE POLICY "tasks_select_own"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_insert_own" ON tasks;
CREATE POLICY "tasks_insert_own"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_update_own" ON tasks;
CREATE POLICY "tasks_update_own"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_delete_own" ON tasks;
CREATE POLICY "tasks_delete_own"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- HOLIDAYS TABLE
-- ============================================================

DROP POLICY IF EXISTS "holidays_select_own" ON holidays;
CREATE POLICY "holidays_select_own"
  ON holidays FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "holidays_insert_own" ON holidays;
CREATE POLICY "holidays_insert_own"
  ON holidays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "holidays_update_own" ON holidays;
CREATE POLICY "holidays_update_own"
  ON holidays FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "holidays_delete_own" ON holidays;
CREATE POLICY "holidays_delete_own"
  ON holidays FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- CGPA SETTINGS TABLE
-- ============================================================

DROP POLICY IF EXISTS "cgpa_settings_select_own" ON cgpa_settings;
CREATE POLICY "cgpa_settings_select_own"
  ON cgpa_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_settings_upsert_own" ON cgpa_settings;
CREATE POLICY "cgpa_settings_upsert_own"
  ON cgpa_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_settings_update_own" ON cgpa_settings;
CREATE POLICY "cgpa_settings_update_own"
  ON cgpa_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_settings_delete_own" ON cgpa_settings;
CREATE POLICY "cgpa_settings_delete_own"
  ON cgpa_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- CGPA SEMESTER SETUP TABLE
-- ============================================================

DROP POLICY IF EXISTS "cgpa_semester_setup_select_own" ON cgpa_semester_setup;
CREATE POLICY "cgpa_semester_setup_select_own"
  ON cgpa_semester_setup FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_semester_setup_insert_own" ON cgpa_semester_setup;
CREATE POLICY "cgpa_semester_setup_insert_own"
  ON cgpa_semester_setup FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_semester_setup_update_own" ON cgpa_semester_setup;
CREATE POLICY "cgpa_semester_setup_update_own"
  ON cgpa_semester_setup FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_semester_setup_delete_own" ON cgpa_semester_setup;
CREATE POLICY "cgpa_semester_setup_delete_own"
  ON cgpa_semester_setup FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- CGPA GRADE SCALES TABLE
-- ============================================================

DROP POLICY IF EXISTS "cgpa_grade_scales_select_own" ON cgpa_grade_scales;
CREATE POLICY "cgpa_grade_scales_select_own"
  ON cgpa_grade_scales FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_grade_scales_insert_own" ON cgpa_grade_scales;
CREATE POLICY "cgpa_grade_scales_insert_own"
  ON cgpa_grade_scales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_grade_scales_update_own" ON cgpa_grade_scales;
CREATE POLICY "cgpa_grade_scales_update_own"
  ON cgpa_grade_scales FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_grade_scales_delete_own" ON cgpa_grade_scales;
CREATE POLICY "cgpa_grade_scales_delete_own"
  ON cgpa_grade_scales FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- CGPA COURSES MANUAL TABLE
-- ============================================================

DROP POLICY IF EXISTS "cgpa_courses_manual_select_own" ON cgpa_courses_manual;
CREATE POLICY "cgpa_courses_manual_select_own"
  ON cgpa_courses_manual FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_courses_manual_insert_own" ON cgpa_courses_manual;
CREATE POLICY "cgpa_courses_manual_insert_own"
  ON cgpa_courses_manual FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_courses_manual_update_own" ON cgpa_courses_manual;
CREATE POLICY "cgpa_courses_manual_update_own"
  ON cgpa_courses_manual FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_courses_manual_delete_own" ON cgpa_courses_manual;
CREATE POLICY "cgpa_courses_manual_delete_own"
  ON cgpa_courses_manual FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- CGPA COURSES AUTO TABLE
-- ============================================================

DROP POLICY IF EXISTS "cgpa_courses_auto_select_own" ON cgpa_courses_auto;
CREATE POLICY "cgpa_courses_auto_select_own"
  ON cgpa_courses_auto FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_courses_auto_insert_own" ON cgpa_courses_auto;
CREATE POLICY "cgpa_courses_auto_insert_own"
  ON cgpa_courses_auto FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_courses_auto_update_own" ON cgpa_courses_auto;
CREATE POLICY "cgpa_courses_auto_update_own"
  ON cgpa_courses_auto FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cgpa_courses_auto_delete_own" ON cgpa_courses_auto;
CREATE POLICY "cgpa_courses_auto_delete_own"
  ON cgpa_courses_auto FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- CGPA CLASS TESTS TABLE (scoped via course_id join)
-- Class tests are linked to auto courses which are user-owned
-- ============================================================

DROP POLICY IF EXISTS "cgpa_class_tests_select_via_course" ON cgpa_class_tests;
CREATE POLICY "cgpa_class_tests_select_via_course"
  ON cgpa_class_tests FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM cgpa_courses_auto WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cgpa_class_tests_insert_via_course" ON cgpa_class_tests;
CREATE POLICY "cgpa_class_tests_insert_via_course"
  ON cgpa_class_tests FOR INSERT
  WITH CHECK (
    course_id IN (
      SELECT id FROM cgpa_courses_auto WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cgpa_class_tests_update_via_course" ON cgpa_class_tests;
CREATE POLICY "cgpa_class_tests_update_via_course"
  ON cgpa_class_tests FOR UPDATE
  USING (
    course_id IN (
      SELECT id FROM cgpa_courses_auto WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cgpa_class_tests_delete_via_course" ON cgpa_class_tests;
CREATE POLICY "cgpa_class_tests_delete_via_course"
  ON cgpa_class_tests FOR DELETE
  USING (
    course_id IN (
      SELECT id FROM cgpa_courses_auto WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = subscriptions.email
    )
  );

-- Subscriptions are write-protected (only service role can insert/update)
-- This prevents users from upgrading themselves to Pro

-- ============================================================
-- AUDIT LOGS TABLE (create if not exists)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- RLS for audit logs: users cannot insert or modify logs (service role only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_service_role_insert" ON audit_logs;
CREATE POLICY "audit_logs_service_role_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Users can view their own audit logs (optional transparency feature)
DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
CREATE POLICY "audit_logs_select_own"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);
