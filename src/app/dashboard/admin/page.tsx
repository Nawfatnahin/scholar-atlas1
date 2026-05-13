export const runtime = 'edge';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminPanel from "./AdminPanel";
import { getAllSubscriptions } from "./actions";
import { ADMIN_EMAILS } from "@/lib/constants";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }

  const subscriptions = await getAllSubscriptions();

  return (
    <AdminPanel 
      initialSubscriptions={subscriptions} 
      ownerEmail={user.email!} 
    />
  );
}
