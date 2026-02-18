import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function isTeacher() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  return session.user
}
