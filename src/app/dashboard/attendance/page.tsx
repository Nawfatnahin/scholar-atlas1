export const runtime = 'edge';
import { createClient } from "@/lib/supabase/server";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import Link from "next/link";
import { ArrowLeft, Home, CalendarCheck } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Attendance Tracker - BackLogger Buddy",
};

interface Session {
  id: string;
  status: 'present' | 'absent' | 'cancelled' | 'upcoming' | 'holiday';
  date: string;
  is_extra: boolean;
}

interface Subject {
  id: string;
  name: string;
  course_code: string | null;
  target_percentage: number;
  class_sessions: Session[];
  created_at: string;
  [key: string]: unknown; // Allow other fields from Supabase
}

export default async function AttendancePage() {
  const supabase = await createClient();
  
  // 1. Fetch subjects with explicit ordering on nested class_sessions
  let subjects: Subject[] = [];
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select(`
        *,
        class_sessions (
          id,
          status,
          date,
          is_extra
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error on AttendancePage:", error);
    } else {
      subjects = data || [];
    }
  } catch (err) {
    console.error("Critical crash during data fetch on AttendancePage:", err);
  }

  // 2. Ultra-safe processing (No mutations allowed here to avoid SSR mismatches)
  const processedSubjects = subjects.map(subject => {
    // Defensive cloning and sorting
    const sessions = Array.isArray(subject.class_sessions) 
      ? [...subject.class_sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];
      
    return {
      ...subject,
      class_sessions: sessions
    };
  });

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <header className="bg-white border-b border-border-strong py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="p-3 rounded-2xl bg-bg text-ink-2 hover:bg-stone-100 transition-all border border-border-strong">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-ink tracking-tight uppercase tracking-[0.1em]">Attendance Tracker</h1>
            </div>
          </div>
          
          <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-ink-2 hover:bg-stone-50 transition-all">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto">
          <AttendanceTracker initialSubjects={processedSubjects} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
