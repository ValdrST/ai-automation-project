"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const WEBHOOKN8N = "https://valdrst.app.n8n.cloud/webhook/task-beautifier";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  user_email: string;
  inserted_at: string;
}

interface TaskListProps {
  initialTasks: Task[];
  userEmail: string;
}

export default function TaskList({ initialTasks, userEmail }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");

  // Loaders
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  async function toggleComplete(task: Task) {
    setIsUpdatingId(task.id);

    const { data } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .select()
      .single();

    setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
    setIsUpdatingId(null);
  }

  async function updateTitle(task: Task, newTitle: string) {
    if (newTitle === task.title) return;

    setIsUpdatingId(task.id);

    const { data } = await supabase
      .from("tasks")
      .update({ title: newTitle })
      .eq("id", task.id)
      .select()
      .single();

    /*await fetch(WEBHOOKN8N, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });*/

    setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
    setIsUpdatingId(null);
  }

  async function addTask() {
    if (!newTask.trim()) {
      alert("Task title is empty");
      return;
    }

    if (!userEmail) {
      alert("No user email found. Log in again.");
      return;
    }

    setIsAdding(true);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: newTask,
        user_email: userEmail,
      })
      .select()
      .single();

    if (!error) {
      await fetch(WEBHOOKN8N, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    if (error) {
      alert("Error inserting task: " + error.message);
      setIsAdding(false);
      return;
    }

    setTasks([...tasks, data as Task]);
    setNewTask("");
    setIsAdding(false);
  }

  async function deleteTask(taskId: string) {
    setIsDeletingId(taskId);

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      alert("Error deleting task: " + error.message);
      setIsDeletingId(null);
      return;
    }

    setTasks(tasks.filter((t) => t.id !== taskId));
    setIsDeletingId(null);
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>

      <div className="flex mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="New task..."
          value={newTask}
          disabled={isAdding}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
          onClick={addTask}
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>

      <ul>
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between mb-2">
            <input
              type="checkbox"
              checked={t.completed}
              disabled={isUpdatingId === t.id}
              onChange={() => toggleComplete(t)}
            />

            <input
              className={`flex-1 mx-2 ${t.completed ? "line-through" : ""}`}
              defaultValue={t.title}
              disabled={isUpdatingId === t.id}
              onBlur={(e) => updateTitle(t, e.target.value)}
            />

            <button
              type="button"
              className="text-red-600"
              onClick={() => deleteTask(t.id)}
              disabled={isDeletingId === t.id}
            >
              {isDeletingId === t.id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}