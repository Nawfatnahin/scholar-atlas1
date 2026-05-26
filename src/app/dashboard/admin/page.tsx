import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminPanel from "./AdminPanel";
import { getAllSubscriptions, getActiveCode, getAllWaitlistUsers, getAllProAccessList } from "./actions";
import { ADMIN_EMAILS } from "@/lib/constants";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }

  const [subscriptions, codeInfo, waitlistUsers, proAccessList] = await Promise.all([
    getAllSubscriptions(),
    getActiveCode(),
    getAllWaitlistUsers(),
    getAllProAccessList(),
  ]);

  return (
    <AdminPanel 
      initialSubscriptions={subscriptions} 
      ownerEmail={user.email!}
      initialCodeInfo={codeInfo}
      initialWaitlist={waitlistUsers}
      initialProAccessList={proAccessList}
    />
  );
}
