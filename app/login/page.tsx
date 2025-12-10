"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cookies } from "next/headers";
export default async function Login() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  async function handleLogin() {
    const cookieStore = await cookies();
    cookieStore.set("user_email", email);
    router.push("/");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        className="border p-2 w-full"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleLogin}
      >
        Continue
      </button>
    </div>
  );
}