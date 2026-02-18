import { canGiveExam } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifySEB, SEBError } from "@/lib/SEBhelper";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { examId } = reqBody;

    const now = new Date();

    const examDetails = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!examDetails) {
      return NextResponse.json({ error: "Exam Not Found" }, { status: 404 });
    }

    if (examDetails.sebEnabled) {
      verifySEB(req);
    }

    let session;
    try {
      session = await canGiveExam(examDetails);
    } catch (error) {
      return NextResponse.json(
        { error: "Not allowed to give exam" },
        { status: 403 },
      );
    }

    const expiresAt = new Date(
      now.getTime() + examDetails.durationMin * 60 * 1000,
    );

    const newAttempt = await prisma.examAttempt.upsert({
      where: {
        examId_studentId: {
          examId: examDetails.id,
          studentId: session.user.id,
        },
      },
      update: {
        lastHeartbeatAt: new Date(),
      },
      create: {
        examId: examDetails.id,
        studentId: session.user.id,
        status: "IN_PROGRESS",
        lastHeartbeatAt: new Date(),
        startedAt: new Date(),
        expiresAt,
      },
    });

    return NextResponse.json(newAttempt, { status: 201 });
  } catch (error) {
    if (error instanceof SEBError) {
      console.log(error)
      return NextResponse.json({ error: error }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
