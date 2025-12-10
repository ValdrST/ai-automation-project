"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// 1. Tipo para una tarea (coincide con tu tabla de Supabase)
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  user_email: string;
  inserted_at: string;
}

// 2. Tipar props del componente
interface TaskListProps {
  initialTasks: Task[];
}

export default function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const userEmail = typeof window !== "undefined"
    ? localStorage.getItem("user_email")
    : null;

  async function addTask() {
    if (!newTask.trim() || !userEmail) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: newTask,
        user_email: userEmail,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setTasks([...tasks, data as Task]);
    setNewTask("");
  }

  async function toggleComplete(task: Task) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setTasks(tasks.map((t) => (t.id === task.id ? (data as Task) : t)));
  }

  async function updateTitle(task: Task, newTitle: string) {
    const title = newTitle.trim();
    if (!title) return;

    const { data, error } = await supabase
      .from("tasks")
      .update({ title })
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setTasks(tasks.map((t) => (t.id === task.id ? (data as Task) : t)));
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>

      <div className="flex mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
          onClick={addTask}
        >
          Add
        </button>
      </div>

      <ul>
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between mb-2">
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggleComplete(t)}
            />

            <input
              className={`flex-1 mx-2 ${t.completed ? "line-through" : ""}`}
              defaultValue={t.title}
              onBlur={(e) => updateTitle(t, e.target.value)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}