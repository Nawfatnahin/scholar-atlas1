-- Migration 001 — Extend subjects table
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS required_threshold   NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  ADD COLUMN IF NOT EXISTS personal_target       NUMERIC(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS total_classes_planned INTEGER      DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS semester_start_date   DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS semester_end_date     DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS schedule_days         TEXT[]       DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS schedule_time         TIME         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS color_tag             TEXT         NOT NULL DEFAULT 'blue',
  ADD CONSTRAINT chk_threshold CHECK (required_threshold BETWEEN 0 AND 100),
  ADD CONSTRAINT chk_personal  CHECK (personal_target IS NULL OR personal_target BETWEEN 0 AND 100);

-- Migration 002 — Extend attendance_records table
ALTER TABLE attendance_records
  ADD COLUMN IF NOT EXISTS absence_type   TEXT    NOT NULL DEFAULT 'unexcused'
    CHECK (absence_type IN ('present', 'unexcused', 'medical', 'excused', 'cancelled')),
  ADD COLUMN IF NOT EXISTS note           TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS class_date     DATE    NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS week_number    INTEGER GENERATED ALWAYS AS (EXTRACT(WEEK FROM class_date)) STORED;

CREATE INDEX IF NOT EXISTS idx_attendance_subject_date
  ON attendance_records (subject_id, class_date DESC);

-- Migration 003 — Holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  date        DATE NOT NULL,
  scope       TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'subject')),
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE DEFAULT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own holidays"
  ON holidays FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
