import { supabase } from "@/lib/supabase";
import TaskList from "@/components/TaskList";

export default async function Home() {
  // Esto ocurre en servidor
  const userEmail = "... leer desde cookie, no desde localstorage ...";

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_email", userEmail)
    .order("inserted_at", { ascending: true });

  return <TaskList initialTasks={tasks || []} />;
}