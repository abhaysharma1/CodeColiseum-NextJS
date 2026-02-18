"use server"
import prisma from "@/lib/prisma";
import isStudent from "../isStudent";

export async function getGroupData(id: string) {
  const session = await isStudent();

  const groupData = await prisma.group.findUnique({
    where: { id },
  });

  if (!groupData) {
    throw new Error("No Group Found");
  }

  const canAccessGroup = await prisma.groupMember.findUnique({
    where: {
      groupId_studentId: {
        groupId: groupData.id,
        studentId: session.user.id,
      },
    },
  });

  if (!canAccessGroup) {
    throw new Error("You Don't have access to this Group");
  }

  return groupData;
}
