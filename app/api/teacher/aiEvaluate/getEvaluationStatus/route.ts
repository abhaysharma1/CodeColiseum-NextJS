import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { examId } = reqBody;

  const total = await prisma.submission.count({
    where: { examId, isFinal: true },
  });

  const completed = await prisma.submission.count({
    where: {
      examId,
      isFinal: true,
      aiStatus: "COMPLETED",
    },
  });

  

  return NextResponse.json({ data: { total, completed } }, { status: 200 });
}
