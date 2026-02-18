import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isStudent } from "@/lib/examHelpers";
import { validateAttempt } from "../../../../lib/examHelpers";

export type SubmissionHistoryItem = {
  id: string;
  language: string;
  sourceCode: string;
  status: string;
  score: number;
  result: any;
  createdAt: Date;
};

export type GetSubmissionsResponse = {
  submissions: SubmissionHistoryItem[];
};

export async function POST(request: NextRequest) {
  try {
    const session = await isStudent();
    const studentId = session.session.user.id;

    const body = await request.json();
    const { attemptId, problemId } = body;

    if (!attemptId || !problemId) {
      return NextResponse.json(
        { error: "attemptId and problemId are required" },
        { status: 400 },
      );
    }

    // Verify that the attempt belongs to the student
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Exam attempt not found" },
        { status: 404 },
      );
    }

    if (attempt.studentId !== studentId) {
      return NextResponse.json(
        { error: "Not authorized to view these submissions" },
        { status: 403 },
      );
    }

    try {
      await validateAttempt(attempt.examId, session.session.user.id);
    } catch (error) {
      return NextResponse.json({ error }, { status: 403 });
    }

    // Fetch all submissions for this problem in this attempt
    const submissions = await prisma.submission.findMany({
      where: {
        attemptId,
        problemId,
      },
      select: {
        id: true,
        language: true,
        sourceCode: true,
        passedTestcases: true,
        totalTestcases: true,
        executionTime: true,
        memory: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        submissions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
