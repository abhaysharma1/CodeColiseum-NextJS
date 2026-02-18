import { canGiveExam, validateAttempt } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { examId } = reqBody;
  let session;

  const examDetails = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!examDetails) {
    return NextResponse.json({ error: "Exam Doesn't Exists" }, { status: 404 });
  }

  try {
    session = await canGiveExam(examDetails);
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: { message: error.message, status: 401 } },
      { status: 401 }
    );
  }

  return NextResponse.json(examDetails, { status: 200 });
}
