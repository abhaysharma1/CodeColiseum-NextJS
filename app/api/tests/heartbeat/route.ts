import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await prisma.examAttempt.updateMany({
    where: {
      studentId: session.user.id,
      status: "IN_PROGRESS",
    },
    data: {
      lastHeartbeatAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
