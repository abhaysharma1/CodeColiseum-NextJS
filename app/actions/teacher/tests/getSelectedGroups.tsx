"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import assertExamAccess from "./assertExamAccess";

export default async function getSelectedGroups(examId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  assertExamAccess(examId);

  const groups = await prisma.group.findMany({
    where: {
      examGroups: {
        some: {
          examId: examId,
        },
      },
    },
  });

  return groups;
}
