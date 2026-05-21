export const runtime = 'edge';
import { createClient } from "@/lib/supabase/server";
import { TaskTracker } from "@/components/tasks/TaskTracker";
import Link from "next/link";
import { ArrowLeft, Home, LayoutList } from "lucide-react";
import Footer from "@/components/Footer";
import { InstructionButton } from "@/components/InstructionButton";

export const metadata = {
  title: "Task Tracker - BackLogger Buddy",
};

export default async function TasksPage() {
  const supabase = await createClient();
  
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      subjects (
        name
      )
    `)
    .order("created_at", { ascending: false });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <header className="bg-white border-b border-border-strong py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="p-3 rounded-2xl bg-bg text-ink-2 hover:bg-stone-100 transition-all border border-border-strong">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <LayoutList className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-ink tracking-tight uppercase tracking-[0.1em]">Task Tracker</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <InstructionButton 
              title="Task Tracker"
              description="Manage your assignments, projects, and deadlines in one central place."
              options={[
                { title: "Add Tasks", description: "Create new tasks with specific deadlines, priority levels, and link them to your subjects." },
                { title: "Organize & Prioritize", description: "Filter tasks by status (To Do, In Progress, Done) and sort them by priority or deadline." },
                { title: "Track Progress", description: "Toggle task status as you work to keep your backlog clean and visually see your progress." }
              ]}
            />
            <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-ink-2 hover:bg-stone-50 transition-all">
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-8">
        <div className="max-w-[1600px] mx-auto">
          <TaskTracker initialTasks={tasks || []} subjects={subjects || []} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
