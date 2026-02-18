"use server";
import prisma from "@/lib/prisma";
import assertExamAccess from "./assertExamAccess";
import { error } from "console";
import { Exam } from "@/generated/prisma/client";

interface inputProps {
  updatedExamDetails: Exam;
  selectedGroups: Group[];
  selectedProblemsId: string[];
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  noOfMembers: number;
  joinByLink: boolean;
  createdAt: Date;
}
export default async function saveDraft({
  updatedExamDetails,
  selectedGroups,
  selectedProblemsId,
}: {
  updatedExamDetails: Exam;
  selectedGroups: Group[];
  selectedProblemsId: string[];
}) {
  const { session, exam } = await assertExamAccess(updatedExamDetails.id);

  if (exam.isPublished) {
    throw error("Published Exam cannot be Edited");
  }

  await prisma.$transaction(async (tx) => {
    await tx.exam.update({
      where: {
        id: updatedExamDetails.id,
      },
      data: {
        title: updatedExamDetails.title,
        description: updatedExamDetails.description || "",
        isPublished: false,
        startDate: updatedExamDetails.startDate,
        endDate: updatedExamDetails.endDate,
        durationMin: updatedExamDetails.durationMin,
        sebEnabled: updatedExamDetails.sebEnabled,
      },
    });

    await tx.examGroup.deleteMany({ where: { examId: exam.id } });

    await tx.examGroup.createMany({
      data: selectedGroups.map((item) => ({
        examId: exam.id,
        groupId: item.id,
      })),
    });

    await tx.examProblem.deleteMany({ where: { examId: exam.id } });

    await tx.examProblem.createMany({
      data: selectedProblemsId.map((item, index) => ({
        examId: exam.id,
        problemId: item,
        order: index + 1,
      })),
    });
  });
}
