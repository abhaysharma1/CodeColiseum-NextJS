import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { examId } = reqBody;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
    }

    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
      },
      include: {
        creator: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam Not Found" }, { status: 404 });
    }

    if (exam.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You Dont Have Access To this Exam" },
        { status: 403 },
      );
    }

    const aiData = await prisma.submission.findMany({
      where: {
        examId: exam.id,
        aiEvaluation: {
          isNot: null,
        },
      },
      include: {
        aiEvaluation: true,
        user: true,
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    return NextResponse.json(aiData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
}
