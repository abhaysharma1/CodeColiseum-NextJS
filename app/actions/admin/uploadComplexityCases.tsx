"use server";
import { expectedComplexity } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import z from "zod";

type cases = {
  expectedComplexity: expectedComplexity;
  cases: {
    input: string;
    output: string;
  }[];
};

const validationObj = z.object({
  expectedComplexity: z.string(),
  cases: z.array(z.object({ input: z.string(), output: z.string() })),
});

async function uploadComplexityCases(problemId: string, cases: cases) {
  const valid = validationObj.safeParse(cases);
  if (!valid.success) {
    throw new Error("Validation Error");
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
  });

  if (!problem) {
    throw new Error("Couldn't find problem");
  }

  const doesExists = await prisma.complexityTestingCases.findMany({
    where: {
      problem: {
        id: problemId,
      },
    },
  });

  if (doesExists) {
    const res = await prisma.complexityTestingCases.deleteMany({
      where: {
        problem: {
          id: problemId,
        },
      },
    });
  }

  const res = await prisma.complexityTestingCases.create({
    data: {
      expectedComplexity: cases.expectedComplexity,
      cases: cases.cases,
      problemId: problemId,
    },
  });

  return res;
}

export default uploadComplexityCases;
