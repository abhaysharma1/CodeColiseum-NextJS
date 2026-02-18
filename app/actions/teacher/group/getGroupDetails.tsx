"use server";
import prisma from "@/lib/prisma";
import { isTeacher } from "../isTeacher";

export async function getGroupDetails(id: string) {
  const session = await isTeacher();

  const groupData = await prisma.group.findUnique({
    where: { id },
  });

  if (!groupData) {
    throw Error("Group Not Found");
  }

  if (groupData?.creatorId != session.id) {
    throw Error("Not Authorized");
  }

  return groupData;
}
