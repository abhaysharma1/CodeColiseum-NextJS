"use server";
import prisma from "@/lib/prisma";
import isStudent from "../isStudent";

export async function getGroups() {
  const session = await isStudent();

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          studentId: session.user.id,
        },
      },
    },
    include:{
      creator:true
    },
    orderBy: { createdAt: "desc" },
  });

  return groups;
}
