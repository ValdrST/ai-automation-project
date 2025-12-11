import RequireLogin from "@/components/RequireLogin";
import { supabase } from "@/lib/supabase";
import TaskList from "@/components/TaskList";
import { cookies } from "next/headers";
export default async function Home() {
  const cookieStore = await cookies();
  const emailFromCookie = cookieStore.get("user_email")?.value || null;
  console.log(emailFromCookie);
  if (!emailFromCookie) {
    return <RequireLogin>Loading...</RequireLogin>;
  }
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_email", emailFromCookie)
    .order("inserted_at", { ascending: true });
  return (
    <TaskList initialTasks={tasks ?? []} />
  );
}