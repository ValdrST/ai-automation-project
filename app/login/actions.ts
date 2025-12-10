"use server";

import { cookies } from "next/headers";

export async function setUserEmailCookie(email: string) {
  cookies().set("user_email", email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}