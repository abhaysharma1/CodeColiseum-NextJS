import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function assertExamAccess(examId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam || exam.creatorId != session.user.id) {
    throw new Error("Forbidden");
  }

  if (exam.isPublished) {
    throw new Error("Exam is locked");
  }

  return { session, exam };
}
