import RequireLogin from "@/components/RequireLogin";
import { supabase } from "@/lib/supabase";
import TaskList from "@/components/TaskList";

export default async function Home() {

  const initialTasks: any[] = [];
  return (
    <RequireLogin>
      <TaskList initialTasks={initialTasks} />
    </RequireLogin>
  );
}