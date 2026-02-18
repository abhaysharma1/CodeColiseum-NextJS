import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const testSchema = z.object({
  input: z.string().max(100_000),
  output: z.string().max(100_000),
});

const problemSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().default("MEDIUM"),
  source: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  publicTests: z.array(testSchema).optional().default([]),
  hiddenTests: z.array(testSchema).optional().default([]),
  referenceSolution: z.object({ languageId: z.number(), code: z.string() }),
});

const fileSchema = z.array(problemSchema).max(2000);
type ProblemInput = z.infer<typeof problemSchema>;

type RowResult =
  | { title: string; result: "created"; number: number }
  | { title: string; result: "error"; message: string };

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // only admin can submit questions
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Empty Request" }, { status: 400 });
    }

    // validation using zod
    const parsed = fileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error" }, { status: 400 });
    }

    const problems = parsed.data;

    console.log(problems[0]);

    // generate starting number
    const currNum = await prisma.problem.aggregate({
      _max: { number: true },
    });

    let nextNum = (currNum._max.number ?? 0) + 1;

    let results: RowResult[] = []; // Problems Finished

    for (const p of problems!) {
      console.log("Uploading Problem ", nextNum);
      try {
        await prisma.$transaction(async (tx) => {
          const problem = await tx.problem.create({
            data: {
              number: nextNum++,
              title: p.title,
              description: p.description,
              difficulty: p.difficulty,
              source: p.source ?? "Unknown",
            },
          });

          if (p.tags) {
            for (const tagName of p.tags) {
              const tag = await tx.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
              });

              await tx.problemTag.create({
                data: {
                  problemId: problem.id,
                  tagId: tag.id,
                },
              });
            }
          }

          await tx.testCase.create({
            data: {
              problemId: problem.id,
              cases: p.hiddenTests,
            },
          });

          await tx.runTestCase.create({
            data: {
              problemId: problem.id,
              cases: p.publicTests,
            },
          });

          await tx.referenceSolution.create({
            data: {
              problemId: problem.id,
              languageId: p.referenceSolution.languageId,
              code: p.referenceSolution.code,
            },
          });
          
        });

        results.push({
          title: p.title,
          result: "created",
          number: nextNum - 1,
        });
        console.log("Uploading Problem ", nextNum - 1);
      } catch (error) {
        results.push({
          title: p.title,
          result: "error",
          message: "Couldn't Upload this Problem",
        });
        console.log(error);
      }
    }

    return NextResponse.json(
      { success: true, results: results },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
      },
    );
  }
}
