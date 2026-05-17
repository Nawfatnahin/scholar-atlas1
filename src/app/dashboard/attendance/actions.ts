'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateStats, AttendanceRecord, Subject } from "@/lib/attendance/calculator";

// --- SCHEMAS ---

const MarkAttendanceSchema = z.object({
  subjectId: z.string().uuid(),
  absenceType: z.enum(['present', 'unexcused', 'medical', 'excused']),
  classDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(200).optional(),
  confirmed: z.boolean().optional(),
});

const UpsertSubjectScheduleSchema = z.object({
  subjectId: z.string().uuid(),
  requiredThreshold: z.number().min(0).max(100),
  personalTarget: z.number().min(0).max(100).optional().nullable(),
  totalClassesPlanned: z.number().min(1).max(200).optional().nullable(),
  semesterStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  semesterEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  scheduleDays: z.array(z.string()).optional(),
  scheduleTime: z.string().optional().nullable(),
});

const AddHolidaySchema = z.object({
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scope: z.enum(['global', 'subject']),
  subjectId: z.string().uuid().optional(),
});

// --- HELPER ---

async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('Authentication error:', error);
    throw new Error('UNAUTHORIZED: Please ensure you are logged in, Sir.');
  }
  return user;
}

// --- ACTIONS ---

export async function addSubject(data: {
  name: string;
  courseCode?: string;
  requiredThreshold: number;
  personalTarget?: number | null;
  classDays: string[];
  semesterStartDate: string;
  totalWeeks: number;
}) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({
        name: data.name,
        course_code: data.courseCode || null,
        required_threshold: data.requiredThreshold,
        personal_target: data.personalTarget || null,
        schedule_days: data.classDays,
        semester_start_date: data.semesterStartDate,
        total_classes_planned: data.totalWeeks * data.classDays.length,
        user_id: user.id,
        color_tag: 'blue'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    revalidatePath('/dashboard/attendance');
    return { success: true, data: subject };
  } catch (error: any) {
    console.error('AddSubject exception:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSubject(id: string) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }
    
    revalidatePath('/dashboard/attendance');
    return { success: true };
  } catch (error: any) {
    console.error('DeleteSubject exception:', error);
    return { success: false, error: error.message };
  }
}

export async function markAttendance(input: z.infer<typeof MarkAttendanceSchema>) {
  const validated = MarkAttendanceSchema.parse(input);
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  // 1. Fetch current data for calculations
  const { data: subjectData, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', validated.subjectId)
    .single();

  if (subjectError || !subjectData) throw new Error('Subject not found');

  const { data: recordsData, error: recordsError } = await supabase
    .from('attendance_records')
    .select('absence_type, class_date')
    .eq('subject_id', validated.subjectId);

  if (recordsError) throw new Error('Failed to fetch attendance records');

  // 2. Alert Gate Logic (only for absences)
  if (validated.absenceType !== 'present' && !validated.confirmed) {
    const currentRecords: AttendanceRecord[] = recordsData.map(r => ({
      absence_type: r.absence_type as any,
      class_date: r.class_date
    }));

    // Recompute with hypothetical absence
    const hypotheticalRecords: AttendanceRecord[] = [
      ...currentRecords.filter(r => r.class_date !== validated.classDate),
      { absence_type: validated.absenceType, class_date: validated.classDate }
    ];

    const stats = calculateStats(subjectData as any, hypotheticalRecords);

    if (stats.safeSkipsLeft !== null && stats.safeSkipsLeft <= 1) {
      return {
        requiresConfirmation: true,
        alertLevel: stats.safeSkipsLeft === 1 ? 'warning' : 'critical',
        stats
      };
    }
  }

  // 3. Save to database (Upsert)
  const { error: upsertError } = await supabase
    .from('attendance_records')
    .upsert({
      subject_id: validated.subjectId,
      user_id: user.id,
      class_date: validated.classDate,
      absence_type: validated.absenceType,
      note: validated.note || null
    }, { onConflict: 'subject_id, class_date' });

  if (upsertError) throw new Error(`Failed to mark attendance: ${upsertError.message}`);

  // 4. Streak Detection & Goals (Optional post-save checks)
  // [Logic for streak detection could go here or be handled client-side]

  revalidatePath('/dashboard/attendance');
  return { success: true };
}

export async function updateAttendanceRecord(input: {
  recordId: string;
  absenceType?: string;
  note?: string;
}) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const { error } = await supabase
    .from('attendance_records')
    .update({
      absence_type: input.absenceType,
      note: input.note
    })
    .eq('id', input.recordId)
    .eq('user_id', user.id);

  if (error) throw new Error(`Failed to update record: ${error.message}`);
  revalidatePath('/dashboard/attendance');
}

export async function bulkMarkAttendance(input: {
  records: Array<{ subjectId: string; classDate: string; absenceType: string; note?: string }>
}) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const recordsToUpsert = input.records.map(r => ({
    subject_id: r.subjectId,
    user_id: user.id,
    class_date: r.classDate,
    absence_type: r.absenceType,
    note: r.note || null
  }));

  const { error } = await supabase
    .from('attendance_records')
    .upsert(recordsToUpsert, { onConflict: 'subject_id, class_date' });

  if (error) throw new Error(`Failed to bulk mark attendance: ${error.message}`);
  revalidatePath('/dashboard/attendance');
}

export async function upsertSubjectSchedule(input: z.infer<typeof UpsertSubjectScheduleSchema>) {
  const validated = UpsertSubjectScheduleSchema.parse(input);
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const { error } = await supabase
    .from('subjects')
    .update({
      required_threshold: validated.requiredThreshold,
      personal_target: validated.personalTarget,
      total_classes_planned: validated.totalClassesPlanned,
      semester_start_date: validated.semesterStartDate,
      semester_end_date: validated.semesterEndDate,
      schedule_days: validated.scheduleDays,
      schedule_time: validated.scheduleTime
    })
    .eq('id', validated.subjectId)
    .eq('user_id', user.id);

  if (error) throw new Error(`Failed to update schedule: ${error.message}`);
  revalidatePath('/dashboard/attendance');
}

export async function addHoliday(input: z.infer<typeof AddHolidaySchema>) {
  const validated = AddHolidaySchema.parse(input);
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const { error } = await supabase
    .from('holidays')
    .insert({
      user_id: user.id,
      name: validated.name,
      date: validated.date,
      scope: validated.scope,
      subject_id: validated.subjectId || null
    });

  if (error) throw new Error(`Failed to add holiday: ${error.message}`);
  revalidatePath('/dashboard/attendance');
}

export async function deleteHoliday(id: string) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const { error } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(`Failed to delete holiday: ${error.message}`);
  revalidatePath('/dashboard/attendance');
}
