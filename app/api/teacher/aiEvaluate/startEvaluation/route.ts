import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBatchToSQS } from "@/lib/sqs";
import { headers } from "next/headers";
import { Submission } from "@/generated/prisma/client";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { examId } = reqBody;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1️⃣ Fetch exam
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  const now = new Date();
  if (exam.endDate > now) {
    return NextResponse.json(
      { error: "Exam not ready for AI evaluation" },
      { status: 400 },
    );
  } else {
    await prisma.exam.update({
      where: {
        id: exam.id,
      },
      data: {
        status: "completed",
      },
    });
  }

  // 2️⃣ Get final submissions
  const submissions = await prisma.submission.findMany({
    where: {
      examId,
      isFinal: true,
      aiStatus: "PENDING",
    },
    select: { id: true },
  });

  if (submissions.length === 0) {
    return NextResponse.json({
      message: "No submissions to evaluate",
    });
  }

  const submissionIds = submissions.map((s: { id: string }) => s.id);

  // 3️⃣ Update exam status BEFORE sending
  await prisma.exam.update({
    where: { id: examId },
    data: { status: "ai_processing" },
  });

  // 4️⃣ Send to SQS
  await sendBatchToSQS(submissionIds);

  return NextResponse.json({
    message: "AI evaluation started",
    total: submissionIds.length,
  });
}
