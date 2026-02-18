"use server";
import prisma from "@/lib/prisma";
import isStudent from "../isStudent";

export type newTest = {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "ongoing" | "ended";
  startDate: Date;
  endDate: Date;
};

export default async function fetchAllTests() {
  const session = await isStudent();

  const allTests = await prisma.exam.findMany({
    where: {
      examGroups: {
        some: {
          group: {
            members: {
              some: {
                studentId: session.user.id,
              },
            },
          },
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  let newTests: newTest[] = [];

  for (const p of allTests) {
    let status: "upcoming" | "ongoing" | "ended";

    const now = Date.now();
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.endDate).getTime();

    if (now < start) {
      status = "upcoming";
    } else if (now <= end) {
      status = "ongoing";
    } else {
      status = "ended";
    }

    let addTest: newTest = {
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      status: status,
      startDate: p.startDate,
      endDate: p.endDate,
    };

    newTests.push(addTest);
  }

  return newTests;
}
