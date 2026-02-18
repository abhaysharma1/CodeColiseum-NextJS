import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type ProblemSubmissionItem = {
  id: string;
  language: string;
  code: string;
  noOfPassedCases: number;
  createdAt: Date;
};

export type GetProblemSubmissionsResponse = {
  submissions: ProblemSubmissionItem[];
};

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: "problemId is required" },
        { status: 400 }
      );
    }

    // Verify that the problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const submissions = await prisma.selfSubmission.findMany({
      where: {
        problemId,
        userId,
      },
      select: {
        id: true,
        language: true,
        createdAt: true,
        noOfPassedCases: true,
        code: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json<GetProblemSubmissionsResponse>({
      submissions,
    });
  } catch (error) {
    console.error("Error fetching problem submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
