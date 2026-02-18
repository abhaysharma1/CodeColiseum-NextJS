"use server"
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function fetchAllGroups() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "TEACHER") {
    throw new Error("Unauthroized");
  }

  const groups = await prisma.group.findMany({
    where: {
      creatorId: session.user.id,
    },
  });

  return groups;
}
