'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { headers } from "next/headers";
import { mutationRateLimit, globalRateLimit, getIp } from "@/lib/ratelimit";

// --- SCHEMAS ---

const SemesterSetupSchema = z.object({
  total_semesters: z.number().int().min(1).max(20),
  current_semester: z.number().int().min(1).max(20),
  previous_gpas: z.record(z.string(), z.number().min(0).max(4.0)),
  initialized: z.boolean(),
});

const UpdatePreviousGPASchema = z.object({
  semester_number: z.number().int().min(1),
  gpa: z.number().min(0).max(4.0).nullable(),
});


// --- COURSE SCHEMAS ---

const GradeScaleMappingSchema = z.object({
  threshold: z.number().min(0).max(100),
  gradePoint: z.number().min(0).max(4.0),
});

const SaveGradeScaleSchema = z.object({
  id: z.string().uuid().optional(),
  scale_name: z.string().min(1).max(100),
  mappings: z.array(GradeScaleMappingSchema).min(1),
  is_global: z.boolean(),
});

const SaveManualCourseSchema = z.object({
  id: z.string().uuid().optional(),
  course_name: z.string().min(1).max(200),
  course_code: z.string().max(50).optional(),
  credit_hours: z.number().min(0.5).max(10),
  grade_point_obtained: z.number().min(0).max(4.0),
});

const SaveAutoCourseSchema = z.object({
  id: z.string().uuid().optional(),
  course_name: z.string().min(1).max(200),
  course_code: z.string().max(50).optional(),
  credit_hours: z.number().min(0.5).max(10),
  target_grade_point: z.number().min(0).max(4.0),
  grade_scale_id: z.string().uuid().nullable().optional(),
  ct_total: z.number().int().min(0).max(20),
  ct_best_of: z.number().int().min(0).max(20),
  ct_weight: z.number().min(0).max(100),
  assignment_total_marks: z.number().min(0),
  assignment_obtained: z.number().min(0),
  assignment_weight: z.number().min(0).max(100),
  attendance_linked: z.boolean(),
  attendance_course_id: z.string().uuid().nullable().optional(),
  attendance_total_marks: z.number().min(0),
  attendance_threshold_percentage: z.number().min(0).max(100),
  attendance_weight: z.number().min(0).max(100),
  exam_weight: z.number().min(0).max(100),
  semester_number: z.number().int().min(1).max(20).optional().default(1),
});

const ClassTestSchema = z.object({
  id: z.string().uuid().optional(),
  ct_number: z.number().int().min(1),
  marks_obtained: z.number().min(0),
  total_marks: z.number().min(0),
});

// --- HELPER ---

async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('[JARVIS]: Authentication error:', error);
    throw new Error('UNAUTHORIZED: Please ensure you are logged in, Sir.');
  }
  return user;
}

// --- SETTINGS ACTIONS ---

export async function saveGlobalTarget(targetCgpa: number) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { error } = await supabase
      .from('cgpa_settings')
      .upsert({
        user_id: user.id,
        target_cgpa: targetCgpa,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('[JARVIS]: Failed to save target CGPA:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- GRADE SCALE ACTIONS ---

export async function saveGradeScale(input: z.infer<typeof SaveGradeScaleSchema>) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const validated = SaveGradeScaleSchema.parse(input);
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    // Sort mappings by threshold descending before saving
    const sortedMappings = [...validated.mappings].sort((a, b) => b.threshold - a.threshold);

    if (validated.id) {
      // Update existing
      const { error } = await supabase
        .from('cgpa_grade_scales')
        .update({
          scale_name: validated.scale_name,
          mappings: sortedMappings,
          is_global: validated.is_global,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.id)
        .eq('user_id', user.id);

      if (error) return { success: false, error: error.message };
    } else {
      // Insert new
      const { error } = await supabase
        .from('cgpa_grade_scales')
        .insert({
          user_id: user.id,
          scale_name: validated.scale_name,
          mappings: sortedMappings,
          is_global: validated.is_global,
        });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGradeScale(id: string) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { error } = await supabase
      .from('cgpa_grade_scales')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- MANUAL COURSE ACTIONS ---

export async function saveManualCourse(input: z.infer<typeof SaveManualCourseSchema>) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const validated = SaveManualCourseSchema.parse(input);
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (validated.id) {
      const { error } = await supabase
        .from('cgpa_courses_manual')
        .update({
          course_name: validated.course_name,
          course_code: validated.course_code || null,
          credit_hours: validated.credit_hours,
          grade_point_obtained: validated.grade_point_obtained,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.id)
        .eq('user_id', user.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from('cgpa_courses_manual')
        .insert({
          user_id: user.id,
          course_name: validated.course_name,
          course_code: validated.course_code || null,
          credit_hours: validated.credit_hours,
          grade_point_obtained: validated.grade_point_obtained,
        });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteManualCourse(id: string) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { error } = await supabase
      .from('cgpa_courses_manual')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- AUTO COURSE ACTIONS ---

export async function saveAutoCourse(input: z.infer<typeof SaveAutoCourseSchema>) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const validated = SaveAutoCourseSchema.parse(input);
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const payload = {
      course_name: validated.course_name,
      course_code: validated.course_code || null,
      credit_hours: validated.credit_hours,
      target_grade_point: validated.target_grade_point,
      grade_scale_id: validated.grade_scale_id || null,
      ct_total: validated.ct_total,
      ct_best_of: validated.ct_best_of,
      ct_weight: validated.ct_weight,
      assignment_total_marks: validated.assignment_total_marks,
      assignment_obtained: validated.assignment_obtained,
      assignment_weight: validated.assignment_weight,
      attendance_linked: validated.attendance_linked,
      attendance_course_id: validated.attendance_course_id || null,
      attendance_total_marks: validated.attendance_total_marks,
      attendance_threshold_percentage: validated.attendance_threshold_percentage,
      attendance_weight: validated.attendance_weight,
      exam_weight: validated.exam_weight,
      semester_number: validated.semester_number ?? 1,
      updated_at: new Date().toISOString(),
    };

    if (validated.id) {
      const { error } = await supabase
        .from('cgpa_courses_auto')
        .update(payload)
        .eq('id', validated.id)
        .eq('user_id', user.id);

      if (error) return { success: false, error: error.message };
      return { success: true, courseId: validated.id };
    } else {
      const { data, error } = await supabase
        .from('cgpa_courses_auto')
        .insert({ ...payload, user_id: user.id })
        .select('id')
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, courseId: data.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAutoCourse(id: string) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { error } = await supabase
      .from('cgpa_courses_auto')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- CLASS TEST ACTIONS ---

export async function saveClassTests(
  courseId: string,
  tests: z.infer<typeof ClassTestSchema>[]
) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const validatedTests = tests.map((t) => ClassTestSchema.parse(t));
    const supabase = await createClient();
    await getAuthenticatedUser(supabase);

    // Delete existing CTs for this course and re-insert
    const { error: deleteError } = await supabase
      .from('cgpa_class_tests')
      .delete()
      .eq('course_id', courseId);

    if (deleteError) return { success: false, error: deleteError.message };

    if (validatedTests.length > 0) {
      const records = validatedTests.map((t) => ({
        course_id: courseId,
        ct_number: t.ct_number,
        marks_obtained: t.marks_obtained,
        total_marks: t.total_marks,
        is_counted: false, // Will be computed client-side
      }));

      const { error: insertError } = await supabase
        .from('cgpa_class_tests')
        .insert(records);

      if (insertError) return { success: false, error: insertError.message };
    }

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FETCH ALL DATA ---

export async function fetchCGPAData() {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const [settingsRes, scalesRes, manualRes, autoRes] = await Promise.all([
      supabase
        .from('cgpa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('cgpa_grade_scales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('cgpa_courses_manual')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('cgpa_courses_auto')
        .select('*, cgpa_class_tests(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
    ]);

    return {
      settings: settingsRes.data || null,
      gradeScales: scalesRes.data || [],
      manualCourses: manualRes.data || [],
      autoCourses: autoRes.data || [],
    };
  } catch (error: any) {
    console.error('[JARVIS]: Failed to fetch CGPA data:', error);
    return {
      settings: null,
      gradeScales: [],
      manualCourses: [],
      autoCourses: [],
    };
  }
}

// --- FETCH ATTENDANCE DATA FOR LINKING ---

export async function fetchAttendanceSubjects() {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('id, name, course_code, attendance_records(absence_type)')
      .eq('user_id', user.id);

    if (error || !subjects) return [];

    return subjects.map((s: any) => {
      const records = s.attendance_records || [];
      const active = records.filter((r: any) => r.absence_type !== 'cancelled');
      const present = active.filter((r: any) => r.absence_type === 'present').length;
      const total = active.length;

      return {
        id: s.id,
        name: s.name,
        course_code: s.course_code,
        attendance_percentage: total > 0 ? (present / total) * 100 : 0,
      };
    });
  } catch (error: any) {
    console.error('[JARVIS]: Failed to fetch attendance subjects:', error);
    return [];
  }
}

// --- SEMESTER SETUP ACTIONS ---

export async function saveSemesterSetup(input: z.infer<typeof SemesterSetupSchema>) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const validated = SemesterSetupSchema.parse(input);
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { error } = await supabase
      .from('cgpa_semester_setup')
      .upsert({
        user_id: user.id,
        total_semesters: validated.total_semesters,
        current_semester: validated.current_semester,
        previous_gpas: validated.previous_gpas,
        initialized: validated.initialized,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('[JARVIS]: Failed to save semester setup:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePreviousGPA(semesterNumber: number, gpa: number | null) {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const validated = UpdatePreviousGPASchema.parse({ semester_number: semesterNumber, gpa });
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    // Fetch current previous_gpas
    const { data: existing } = await supabase
      .from('cgpa_semester_setup')
      .select('previous_gpas')
      .eq('user_id', user.id)
      .single();

    const currentGPAs: Record<string, number> = (existing?.previous_gpas as Record<string, number>) || {};
    const key = String(validated.semester_number);

    if (validated.gpa === null) {
      delete currentGPAs[key];
    } else {
      currentGPAs[key] = validated.gpa;
    }

    const { error } = await supabase
      .from('cgpa_semester_setup')
      .update({
        previous_gpas: currentGPAs,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetSemesterSetup() {
  try {
    const headersList = await headers();
    const ip = getIp(headersList);
    const { success } = await mutationRateLimit.limit(ip);
    if (!success) return { success: false, error: "Too many requests. Please try again later." };

    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { error } = await supabase
      .from('cgpa_semester_setup')
      .delete()
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/cgpa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
