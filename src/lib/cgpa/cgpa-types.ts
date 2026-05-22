// /lib/cgpa/cgpa-types.ts — Shared types for CGPA Management

export interface GradeScaleMapping {
  threshold: number;   // Minimum mark threshold (e.g., 80)
  gradePoint: number;  // Corresponding grade point (e.g., 4.00)
}

export interface GradeScale {
  id: string;
  user_id: string;
  scale_name: string;
  mappings: GradeScaleMapping[];
  is_global: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CGPASettings {
  id: string;
  user_id: string;
  target_cgpa: number;
  created_at?: string;
  updated_at?: string;
}

export interface ManualCourse {
  id: string;
  user_id: string;
  course_name: string;
  course_code: string | null;
  credit_hours: number;
  grade_point_obtained: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClassTest {
  id: string;
  course_id: string;
  ct_number: number;
  marks_obtained: number;
  total_marks: number;
  is_counted: boolean;
  created_at?: string;
}

export interface AutoCourse {
  id: string;
  user_id: string;
  course_name: string;
  course_code: string | null;
  credit_hours: number;
  target_grade_point: number;
  grade_scale_id: string | null;
  ct_total: number;
  ct_best_of: number;
  ct_weight: number;
  assignment_total_marks: number;
  assignment_obtained: number;
  assignment_weight: number;
  attendance_linked: boolean;
  attendance_course_id: string | null;
  attendance_total_marks: number;
  attendance_threshold_percentage: number;
  attendance_weight: number;
  exam_weight: number;
  created_at?: string;
  updated_at?: string;
  // Nested data loaded from Supabase
  cgpa_class_tests?: ClassTest[];
}

export interface AttendanceSubject {
  id: string;
  name: string;
  course_code: string | null;
  attendance_percentage: number;
}

// --- Form/UI State Types ---

export interface ManualCourseForm {
  course_name: string;
  course_code: string;
  credit_hours: number | string;
  grade_point_obtained: number | string;
}

export interface AutoCourseForm {
  course_name: string;
  course_code: string;
  credit_hours: number | string;
  target_grade_point: number | string;
  grade_scale_id: string;
  ct_total: number | string;
  ct_best_of: number | string;
  ct_weight: number | string;
  assignment_total_marks: number | string;
  assignment_obtained: number | string;
  assignment_weight: number | string;
  attendance_linked: boolean;
  attendance_course_id: string;
  attendance_total_marks: number | string;
  attendance_threshold_percentage: number | string;
  attendance_weight: number | string;
  exam_weight: number | string;
}

export interface CTForm {
  ct_number: number;
  marks_obtained: number | string;
  total_marks: number | string;
}

// --- Calculation Result Types ---

export interface CTResult {
  ct_number: number;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  is_counted: boolean;
}

export interface CourseBreakdown {
  ctAverage: number;
  assignmentScore: number;
  attendanceMarks: number;
  attendanceMaxMarks: number;
  currentWeightedScore: number;
  requiredExamPercentage: number;
  examWeight: number;
  predictedGradePoint: number;
  targetAchievable: boolean;
  targetAlreadyAchieved: boolean;
}
