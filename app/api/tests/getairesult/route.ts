import { isStudent } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { examId } = reqBody;

    let session;

    try {
      session = await isStudent();
    } catch (error) {
      return NextResponse.json({ error: "Not Logged In" }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam Not Found" }, { status: 404 });
    }

    const aiEvalution = await prisma.aiEvaluation.findMany({
      where: {
        submission: {
          examId: exam.id,
          userId: session.session.user.id,
        },
      },
      include: {
        submission: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (aiEvalution.length == 0) {
      return NextResponse.json(
        { error: "Couldn't Find AI Submission" },
        { status: 404 },
      );
    }

    return NextResponse.json(aiEvalution, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
