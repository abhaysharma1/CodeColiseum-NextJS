"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function fetchAllExams() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role != "TEACHER") {
    throw new Error("Unauthorized");
  }

  const exams = await prisma.exam.findMany({
    where: {
      creatorId: session?.user.id,
    },
    orderBy: { endDate: "desc" },
  });

  return exams;
}
