import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  Exam,
  ExamAttempt,
  ExamAttemptStatus,
  ExamProblem,
  Submission,
  User,
} from "@/generated/prisma/client";
import { isStudent } from "@/lib/examHelpers";

// TypeScript Types for the API Response
export type ExamResultResponse = {
  examDetails: {
    id: string;
    examStatus: string;
    title: string;
    description: string | null;
    durationMin: number;
    startDate: Date;
    endDate: Date;
    creator: {
      id: string;
      name: string;
      email: string;
    };
    problems: Array<{
      order: number;
      problem: {
        id: string;
        number: number;
        title: string;
        difficulty: string;
      };
    }>;
  };
  examAttempt: {
    id: string;
    status: ExamAttemptStatus;
    startedAt: Date;
    expiresAt: Date;
    submittedAt: Date | null;
    totalScore: number;
  };
  finalScore: number;
  submissionReports: Array<{
    problemId: string;
    submissionId: string;
    code: string;
    language: string;
    passedTestcases: number;
    totalTestcases: number;
    executionTime: number | null;
    memory: number | null;
    createdAt: Date;
    isSuccessful: boolean;
    status: string;
  }>;
  ranking: {
    currentStudent:
      | {
          rank: number;
          studentId: string;
          studentName: string;
          studentEmail: string;
          totalScore: number;
          submittedAt: Date | null;
        }
      | undefined;
    allRankings: Array<{
      rank: number;
      studentId: string;
      studentName: string;
      studentEmail: string;
      totalScore: number;
      submittedAt: Date | null;
    }>;
  };
};

export type ExamResultRequest = {
  examId: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExamResultRequest;
    const { examId } = body;

    const session = await isStudent();
    const studentId = session.session.user.id;

    if (!examId || !studentId) {
      return NextResponse.json(
        { error: "examId and studentId are required" },
        { status: 400 },
      );
    }

    const examDetails = (await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        problems: {
          include: {
            problem: {
              select: {
                id: true,
                number: true,
                title: true,
                difficulty: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    })) as unknown as Exam & {
      creator: { id: string; name: string; email: string };
      problems: (ExamProblem & {
        problem: {
          id: string;
          number: number;
          title: string;
          difficulty: string;
        };
      })[];
    };

    if (!examDetails) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const examAttempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId,
        },
      },
    });

    if (!examAttempt) {
      return NextResponse.json(
        { error: "Exam attempt not found" },
        { status: 404 },
      );
    }

    const finalScore = examAttempt.totalScore;

    // Fetch ONLY the final submissions for this attempt
    const finalSubmissions = await prisma.submission.findMany({
      where: {
        attemptId: examAttempt.id,
        isFinal: true,
      },
      orderBy: {
        createdAt: "desc", // If multiple exist (accidentally), take the latest
      },
    });

    // Create a map to handle distinct problem IDs (just in case there are duplicates)
    const distinctSubmissionsMap = new Map<string, Submission>();

    finalSubmissions.forEach((sub) => {
      if (!distinctSubmissionsMap.has(sub.problemId)) {
        distinctSubmissionsMap.set(sub.problemId, sub);
      }
    });

    // Generate the report
    const submissionReports = Array.from(distinctSubmissionsMap.values()).map(
      (reportSubmission) => ({
        problemId: reportSubmission.problemId,
        submissionId: reportSubmission.id,
        code: reportSubmission.sourceCode,
        language: reportSubmission.language,
        passedTestcases: reportSubmission.passedTestcases,
        totalTestcases: reportSubmission.totalTestcases,
        executionTime: reportSubmission.executionTime,
        memory: reportSubmission.memory,
        createdAt: reportSubmission.createdAt,
        isSuccessful:
          reportSubmission.passedTestcases === reportSubmission.totalTestcases,
        status: reportSubmission.status,
      }),
    );

    // 5. Get Ranking
    const allAttempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        status: {
          in: [
            "SUBMITTED" as ExamAttemptStatus,
            "AUTO_SUBMITTED" as ExamAttemptStatus,
          ],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { totalScore: "desc" },
        { submittedAt: "asc" }, // Earlier submission as tiebreaker
      ],
    });

    const ranking = allAttempts.map((attempt: any, index: number) => ({
      rank: index + 1,
      studentId: attempt.studentId,
      studentName: attempt.student.name,
      studentEmail: attempt.student.email,
      totalScore: attempt.totalScore,
      submittedAt: attempt.submittedAt,
    }));

    const currentStudentRanking = ranking.find(
      (rank: (typeof ranking)[0]) => rank.studentId === studentId,
    );

    // Return all the requested data
    return NextResponse.json<ExamResultResponse>({
      examDetails: {
        id: examDetails.id,
        title: examDetails.title,
        examStatus: examDetails.status,
        description: examDetails.description,
        durationMin: examDetails.durationMin,
        startDate: examDetails.startDate,
        endDate: examDetails.endDate,
        creator: examDetails.creator,
        problems: examDetails.problems.map(
          (ep: (typeof examDetails.problems)[0]) => ({
            order: ep.order,
            problem: ep.problem,
          }),
        ),
      },
      examAttempt: {
        id: examAttempt.id,
        status: examAttempt.status,
        startedAt: examAttempt.startedAt,
        expiresAt: examAttempt.expiresAt,
        submittedAt: examAttempt.submittedAt,
        totalScore: examAttempt.totalScore,
      },
      finalScore,
      submissionReports,
      ranking: {
        currentStudent: currentStudentRanking,
        allRankings: ranking,
      },
    });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
