import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const questionId = url.searchParams.get("id");

  if (!questionId) {
    return NextResponse.json({ data: "Bad Request" }, { status: 401 });
  }

  const questionCases = await prisma.runTestCase.findFirst({
    where: {
      problemId: questionId as string,
    },
  });

  if (!questionCases) {
    return NextResponse.json(
      { data: "Question Not Found" },
      { status: 401, statusText: "Question not Found" }
    );
  }

  return NextResponse.json(questionCases, {
    status: 201,
    statusText: "Test Cases Fetched Successfully",
  });
}
