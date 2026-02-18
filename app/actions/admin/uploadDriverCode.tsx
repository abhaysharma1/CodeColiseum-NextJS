"use server"
import prisma from "@/lib/prisma";
import z from "zod";

type inJson = {
  languageId: number;
  header: string;
  template: string;
  footer: string;
};

const validation = z.object({
  languageId: z.number(),
  header: z.string().optional(),
  template: z.string().optional(),
  footer: z.string().optional(),
});

export async function uploadDriverCode(problemId: string, json: inJson) {
  const valid = validation.safeParse(json);
  if (!valid.success) {
    throw new Error("Validation Failed");
  }
  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
  });

  if (!problem) {
    throw new Error("Couldn't find Problem");
  }

  const prevCode = await prisma.driverCode.findUnique({
    where: {
      languageId_problemId: {
        languageId: json.languageId,
        problemId: problem.id,
      },
    },
  });

  if (prevCode) {
    const del = await prisma.driverCode.delete({
      where: {
        languageId_problemId: {
          languageId: json.languageId,
          problemId: problem.id,
        },
      },
    });
  }

  const newCode = await prisma.driverCode.create({
    data: {
      languageId: json.languageId,
      header: json.header,
      template: json.template,
      footer: json.footer,
      problemId: problem.id,
    },
  });

  return newCode;
}
