import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { problemId, languageId } = await req.json();

  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
  });

  if (!problem) {
    return NextResponse.json(
      { error: "Couldn't find Problem" },
      { status: 401 },
    );
  }

  const template = await prisma.driverCode.findUnique({
    where: {
      languageId_problemId: {
        languageId: languageId,
        problemId: problemId,
      },
    },
    select: {
      template: true,
      languageId: true,
      header: false,
      footer: false,
    },
  });

  return NextResponse.json(template, { status: 200 });
}
