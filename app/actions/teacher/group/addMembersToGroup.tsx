"use server";

import z from "zod";
import { isTeacher } from "../isTeacher";
import prisma from "@/lib/prisma";

const emailValidator = z.array(z.string().email().min(1).max(1000));

export async function addMembersToGroup(newEmails: string, groupId: string) {
  let emails = newEmails.split(",");

  const session = await isTeacher();

  const groupData = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!groupData) {
    throw Error("Group Not Found");
  }

  if (groupData?.creatorId != session.id) {
    throw Error("Not Authorized");
  }

  const validationResult = emailValidator.safeParse(emails);

  if (!validationResult) {
    throw Error("Email Validation Failed");
  }

  const setEmails = new Set(emails);
  emails = [...setEmails];

  let studentIds = [];
  let notFoundStudents = [];

  for (const email of emails) {
    const student = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!student || student.role !== "STUDENT") {
      notFoundStudents.push(email);
    } else {
      studentIds.push(student.id);
    }
  }

  const result = await prisma.groupMember.createMany({
    data: studentIds.map((id) => ({
      groupId: groupData.id,
      studentId: id,
    })),
  });

  await prisma.group.update({
    where: { id: groupData.id },
    data: {
      noOfMembers: { increment: result.count },
    },
  });

  return notFoundStudents;
}
