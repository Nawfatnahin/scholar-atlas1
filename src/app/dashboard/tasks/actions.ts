'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ADMIN_EMAILS, PRO_EMAILS, MAX_FREE_TASKS } from "@/lib/constants";

export async function addTask(title: string, priority: 'low' | 'medium' | 'high', subjectId?: string, dueDate?: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) throw new Error("Not authenticated");

  // Check Task Limit for free users
  const { data: sub } = await supabase.from('subscriptions').select('*').eq('email', user.email).maybeSingle();
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;
  const isProHardcoded = user.email ? PRO_EMAILS.includes(user.email) : false;
  
  let isPro = sub?.plan === 'pro' || isProHardcoded;
  if (isPro && sub?.premium_until) {
    if (new Date(sub.premium_until) < new Date()) {
      isPro = false;
    }
  }

  if (!isPro && !isAdmin) {
    const { count } = await supabase
      .from("tasks")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id);
    
    if (count !== null && count >= MAX_FREE_TASKS) {
      throw new Error(`Limit reached: You can only have up to ${MAX_FREE_TASKS} total tasks. Upgrade to Pro for unlimited!`);
    }
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    priority,
    subject_id: subjectId || null,
    due_date: dueDate || null,
    user_id: user.id,
    status: 'todo',
  });

  if (error) throw error;
  revalidatePath("/dashboard/tasks");
}

export async function updateTaskStatus(id: string, status: 'todo' | 'in-progress' | 'done') {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/tasks");
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/tasks");
}
