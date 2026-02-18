import { canGiveExam, validateAttempt } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { verifySEB, SEBError } from "@/lib/SEBhelper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqbody = await req.json();
  const { examId } = reqbody;

  if (!examId) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  const examDetails = await prisma.exam.findUnique({ where: { id: examId } });

  if (!examDetails) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  if (examDetails.sebEnabled) {
    try {
      verifySEB(req);
    } catch (error) {
      const status = error instanceof SEBError ? error.status : 403;
      const message =
        error instanceof SEBError
          ? error.message
          : "Please use Safe Exam Browser to give this exam";

      return NextResponse.json({ error: message }, { status });
    }
  }

  let session;
  try {
    session = await canGiveExam(examDetails);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    validateAttempt(examDetails.id, session.user.id);
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
      examId: examDetails.id,
    },
  });

  const scoreMap = new Map<string, number>();

  for (const s of submissions) {
    const prev = scoreMap.get(s.problemId) ?? 0;
    const prevScore =
      s.totalTestcases > 0
        ? Math.round((s.passedTestcases / s.totalTestcases) * 100)
        : 0;
    scoreMap.set(s.problemId, Math.max(prevScore, prev));
  }

  const finalScore = Array.from(scoreMap.values()).reduce((a, b) => a + b, 0);

  try {
    const attempt = await prisma.examAttempt.update({
      where: {
        examId_studentId: {
          examId: examDetails.id,
          studentId: session.user.id,
        },
      },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        totalScore: finalScore,
      },
    });

    const result = await prisma.examResult.create({
      data: {
        score: finalScore,
        examId: examDetails.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        attemptId: attempt.id,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      {
        error: "Failed to submit exam",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
