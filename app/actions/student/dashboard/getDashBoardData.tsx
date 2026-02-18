"use server";
import prisma from "@/lib/prisma";
import isStudent from "../isStudent";

export default async function getDashboardData() {
  const { user } = await isStudent();
  const nowDate = new Date();

  // groups
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          studentId: user.id,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  //upcoming and ongoing exams
  const exams = await prisma.exam.findMany({
    where: {
      examGroups: {
        some: {
          group: {
            members: {
              some: {
                studentId: user.id,
              },
            },
          },
        },
      },
      isPublished: true,
      endDate: { gte: nowDate },
    },
  });

  const upcomingExams = exams.filter((item) => item.startDate > nowDate);
  const ongoingExams = exams.filter(
    (item) => item.endDate > nowDate && item.startDate < nowDate,
  );

  // get Previous exam Results
  const prevResults = await prisma.examResult.findMany({
    where: {
      userId: user.id,
    },
    take: 10,
  });

  // questions solved by themselves count
  const problemsSolved = await prisma.selfSubmission.findMany({
    where: {
      userId: user.id,
      status: "ACCEPTED",
    },
    include: {
      problem: {
        select: {
          difficulty: true,
        },
      },
    },
    distinct: ["problemId"],
  })

  const totalNoOfQuestions = await prisma.problem.count();

  const totalSolvedProblems = problemsSolved.length;

  const easyProblemSolved = problemsSolved.filter(
    (item) => item.problem.difficulty == "EASY",
  ).length;
  const mediumProblemSolved = problemsSolved.filter(
    (item) => item.problem.difficulty == "MEDIUM",
  ).length;
  const hardProblemSolved = problemsSolved.filter(
    (item) => item.problem.difficulty == "HARD",
  ).length;

  const finalDashboardData = {
    groups,
    exams: { upcomingExams, ongoingExams },
    prevResults,
    problemDetails: {
      totalSolvedProblems,
      easyProblemSolved,
      mediumProblemSolved,
      hardProblemSolved,
      totalNoOfQuestions,
    },
  };

  return finalDashboardData;
}
