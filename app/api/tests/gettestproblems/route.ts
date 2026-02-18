import { canGiveExam, isStudent, validateAttempt } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { examId } = reqBody;

  let session;

  try {
    session = await isStudent();
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const examDetails = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!examDetails) {
    return NextResponse.json({ error: "Exam Not Found" }, { status: 404 });
  }

  try {
    validateAttempt(examDetails.id, session.session.user.id);
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const examProblems = await prisma.examProblem.findMany({
    where: {
      examId: examDetails.id,
    },
  });

  if (!examProblems) {
    return NextResponse.json(
      { error: "No Exam Problems Found" },
      { status: 404 }
    );
  }

  return NextResponse.json(examProblems, { status: 200 });
}
