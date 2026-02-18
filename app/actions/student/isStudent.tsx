"use server";
import { auth } from "@/lib/auth";
import { error } from "console";
import { headers } from "next/headers";

export default async function isStudent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "STUDENT") {
    throw error("Not a Student");
  }

  return session;
}
