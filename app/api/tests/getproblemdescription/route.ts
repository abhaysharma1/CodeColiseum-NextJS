import { isStudent } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { problemId } = reqBody;

  try {
    await isStudent();
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });

  return NextResponse.json(problem, { status: 200 });
}
