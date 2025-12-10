"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TaskList({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const userEmail = localStorage.getItem("user_email");

  async function addTask() {
    const { data } = await supabase
      .from("tasks")
      .insert({ title: newTask, user_email: userEmail })
      .select()
      .single();

    setTasks([...tasks, data]);
    setNewTask("");
  }

  async function toggleComplete(task) {
    const { data } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .select()
      .single();

    setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
  }

  async function updateTitle(task, newTitle) {
    const { data } = await supabase
      .from("tasks")
      .update({ title: newTitle })
      .eq("id", task.id)
      .select()
      .single();
      
    setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
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
