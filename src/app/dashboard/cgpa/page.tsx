export const runtime = 'edge';
import { createClient } from "@/lib/supabase/server";
import { CGPAManager } from "@/components/cgpa/CGPAManager";
import Link from "next/link";
import { ArrowLeft, Home, GraduationCap } from "lucide-react";
import Footer from "@/components/Footer";
import { InstructionButton } from "@/components/InstructionButton";

export const metadata = {
  title: "CGPA Manager — BackLogger Buddy",
  description: "Dual-engine CGPA calculator with assessment prediction and exam score forecasting.",
};

export default async function CGPAPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all CGPA data in parallel
  let settings = null;
  let gradeScales: any[] = [];
  let manualCourses: any[] = [];
  let autoCourses: any[] = [];
  let attendanceSubjects: any[] = [];

  if (user) {
    try {
      const [settingsRes, scalesRes, manualRes, autoRes, subjectsRes] = await Promise.all([
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
        supabase
          .from('subjects')
          .select('id, name, course_code, attendance_records(absence_type)')
          .eq('user_id', user.id),
      ]);

      settings = settingsRes.data;
      gradeScales = scalesRes.data || [];
      manualCourses = manualRes.data || [];
      autoCourses = autoRes.data || [];

      // Process attendance subjects with percentage calculation
      attendanceSubjects = (subjectsRes.data || []).map((s: any) => {
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
    } catch (err) {
      console.error("[JARVIS]: Critical CGPA data fetch error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <header className="bg-bg/95 backdrop-blur-xl border-b border-[#92400e]/10 py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="p-3 rounded-2xl bg-white text-[#92400e] hover:scale-105 transition-all border border-border-strong shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#92400e]/10 flex items-center justify-center text-[#92400e]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#92400e] tracking-tight uppercase tracking-[0.1em]">CGPA Manager</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <InstructionButton 
              title="CGPA Manager"
              description="Track and predict your cumulative GPA with dual calculation engines."
              options={[
                { title: "Manual Counter", description: "Enter your completed courses and grade points to calculate your current CGPA. Supports inline editing and live recalculation." },
                { title: "Auto Counter", description: "Input your assessment data (class tests, assignments, attendance) and the system predicts what you need in your final exam to hit your target." },
                { title: "Grade Scale", description: "Define your university's numeric grade scale (e.g., 80+ = 4.00). This scale is used across both counters for grade point lookups." },
                { title: "Exam Prediction", description: "After entering your CT marks, assignment scores, and attendance, see exactly what percentage you need in your written exam." },
              ]}
            />
            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-ink-2 hover:bg-white border border-transparent hover:border-border-strong shadow-sm transition-all">
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto">
          <CGPAManager
            initialSettings={settings}
            initialGradeScales={gradeScales}
            initialManualCourses={manualCourses}
            initialAutoCourses={autoCourses}
            attendanceSubjects={attendanceSubjects}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
