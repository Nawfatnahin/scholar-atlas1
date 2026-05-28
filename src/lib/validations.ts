import { z } from "zod";

// Auth
export const authSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Subjects
export const subjectSchema = z.object({
  name: z.string().max(100, "Subject name must not exceed 100 characters").regex(/^[^<>]*$/, "No script injection allowed"),
  required_threshold: z.number().min(0).max(100),
  personal_target: z.number().min(0).max(100),
  total_classes_planned: z.number().int().positive(),
  semester_start_date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  schedule_days: z.array(z.enum(["0", "1", "2", "3", "4", "5", "6"])),
});

// Attendance
export const attendanceSchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID"),
  class_date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.enum(['present', 'absent', 'cancelled']),
}).refine((data) => {
  const date = new Date(data.class_date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date <= tomorrow;
}, {
  message: "Class date cannot be in the future beyond 1 day",
  path: ["class_date"],
});

// Tasks
export const taskSchema = z.object({
  title: z.string().max(200, "Title must not exceed 200 characters").regex(/^[^<>]*$/, "No script injection allowed"),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

// CGPA
export const cgpaGradeSchema = z.object({
  grade: z.string(), // further validation against scale inside route if necessary, or check standard strings
  credit_hours: z.number().positive(),
});

// Shared response helper for Zod errors
export function formatZodError(error: z.ZodError) {
  const firstError = error.errors[0];
  return {
    error: firstError.message,
    field: firstError.path.join("."),
  };
}
