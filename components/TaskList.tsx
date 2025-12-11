"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
const WEBHOOKN8N = 'https://valdrst.app.n8n.cloud/webhook/task-beautifier';
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
  userEmail: string; // ya no es null
}

export default function TaskList({ initialTasks, userEmail }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  async function toggleComplete(task: Task) {
    const { data } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .select()
      .single();

    setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
  }

  async function updateTitle(task: Task, newTitle: string) {
    const { data } = await supabase
      .from("tasks")
      .update({ title: newTitle })
      .eq("id", task.id)
      .select()
      .single();

      await fetch(WEBHOOKN8N, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
    setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
  }

  async function addTask() {
    console.log("ADD CLICKED", { newTask, userEmail });

    if (!newTask.trim()) {
      alert("Task title is empty");
      return;
    }

    if (!userEmail) {
      alert("No user email found. You need to log in again.");
      return;
    }

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
      console.error(error);
      alert("Error inserting task: " + error.message);
      return;
    }

    setTasks([...tasks, data as Task]);
    setNewTask("");
  }

  async function deleteTask(taskId: string) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error(error);
      alert("Error deleting task: " + error.message);
      return;
    }

    setTasks(tasks.filter((task) => task.id !== taskId));
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
            <button type="button" onClick={() => deleteTask(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}