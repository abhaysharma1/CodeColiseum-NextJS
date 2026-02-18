"use server";
import assertExamAccess from "./assertExamAccess";
import prisma from "@/lib/prisma";

export default async function getSelectedProblems(examId: string) {
  assertExamAccess(examId);
  const problems = await prisma.examProblem.findMany({
    where: {
      examId: examId,
    },
  });

  return problems;
}
