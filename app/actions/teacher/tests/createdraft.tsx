"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function draftTest() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  const now = new Date();

  const exam = await prisma.exam.create({
    data: {
      title: "Untitled Exam",
      description: "",
      isPublished: false,
      creatorId: session.user.id,
      startDate: now,
      endDate: new Date(now.getTime() + 60 * 60 * 1000), // +1 hour
      durationMin: 60,
      sebEnabled: false,
      status: "scheduled",
    },
  });

  redirect(`/dashboard/teacher/test/edit/${exam.id}`);
}
