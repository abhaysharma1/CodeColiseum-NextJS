import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Use string literals for enum values since they're not exported from generated client
type ExamStatus =
  | "scheduled"
  | "active"
  | "completed"
  | "ai_processing"
  | "finished";
type ExamAttemptStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED"
  | "TERMINATED";
type SubmissionStatus =
  | "PENDING"
  | "RUNNING"
  | "ACCEPTED"
  | "PARTIAL"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "INTERNAL_ERROR";

// Type definitions for included relations
type ExamWithProblems = {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  startDate: Date;
  endDate: Date;
  isPublished: boolean;
  status: ExamStatus;
  sebEnabled: boolean;
  creatorId: string;
  problems: Array<{
    order: number;
    problemId: string;
    problem: {
      id: string;
      number: number;
      title: string;
      difficulty: string;
    };
  }>;
};

type ExamAttemptWithRelations = {
  id: string;
  examId: string;
  studentId: string;
  status: ExamAttemptStatus;
  lastHeartbeatAt: Date;
  disconnectCount: number;
  startedAt: Date;
  expiresAt: Date;
  submittedAt: Date | null;
  totalScore: number;
  student: {
    id: string;
    name: string;
    email: string;
  };
  submissions: Array<{
    id: string;
    problemId: string;
    status: SubmissionStatus;
    passedTestcases: number;
    totalTestcases: number;
    createdAt: Date;
    isFinal: boolean;
    sourceCode: string;
  }>;
};

export type TeacherTestResultsResponse = {
  examDetails: {
    id: string;
    title: string;
    description: string | null;
    durationMin: number;
    startDate: Date;
    endDate: Date;
    isPublished: boolean;
    status: ExamStatus;
    sebEnabled: boolean;
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
  studentResults: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    attemptId: string;
    status: ExamAttemptStatus;
    startedAt: Date;
    submittedAt: Date | null;
    expiresAt: Date;
    totalScore: number;
    lastHeartbeatAt: Date;
    disconnectCount: number;
    problemScores: Array<{
      problemId: string;
      problemTitle: string;
      problemNumber: number;
      bestScore: number;
      attempts: number;
      latestStatus: SubmissionStatus | null;
      passedTestcases: number;
      totalTestcases: number;
      sourceCode: string | null;
    }>;
  }>;
  statistics: {
    totalStudents: number;
    submitted: number;
    inProgress: number;
    notStarted: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
  };
};

export async function GET(request: NextRequest) {
  try {
    // Check if user is a teacher
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Not authorized. Teacher access required." },
        { status: 403 },
      );
    }

    const teacherId = session.user.id;
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json(
        { error: "examId is required" },
        { status: 400 },
      );
    }

    // Fetch exam details and verify teacher owns it
    const examDetails = (await prisma.exam.findUnique({
      where: { id: examId },
      include: {
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
    })) as ExamWithProblems | null;

    if (!examDetails) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (examDetails.creatorId !== teacherId) {
      return NextResponse.json(
        { error: "Not authorized to view this exam's results" },
        { status: 403 },
      );
    }

    // Fetch all exam attempts for this exam
    const examAttempts = (await prisma.examAttempt.findMany({
      where: {
        examId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        submissions: {
          select: {
            id: true,
            problemId: true,
            status: true,
            passedTestcases: true,
            totalTestcases: true,
            createdAt: true,
            isFinal: true,
            sourceCode: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: [{ totalScore: "desc" }, { submittedAt: "asc" }],
    })) as ExamAttemptWithRelations[];

    // Process student results
    const studentResults = examAttempts.map((attempt) => {
      // Group submissions by problem
      const problemSubmissions = new Map<
        string,
        Array<{
          status: SubmissionStatus;
          passedTestcases: number;
          totalTestcases: number;
          isFinal: boolean;
          sourceCode: string;
        }>
      >();

      attempt.submissions.forEach((sub) => {
        if (!problemSubmissions.has(sub.problemId)) {
          problemSubmissions.set(sub.problemId, []);
        }
        problemSubmissions.get(sub.problemId)!.push({
          status: sub.status,
          passedTestcases: sub.passedTestcases,
          totalTestcases: sub.totalTestcases,
          isFinal: sub.isFinal,
          sourceCode: sub.sourceCode,
        });
      });

      // Calculate problem scores based on passed/total test cases
      const problemScores = examDetails.problems.map((examProblem) => {
        const submissions = problemSubmissions.get(examProblem.problemId) || [];

        // Calculate score as percentage of passed test cases
        let bestScore = 0;
        let latestStatus: SubmissionStatus | null = null;
        let passedTestcases = 0;
        let totalTestcases = 0;
        let sourceCode: string | null = null;

        if (submissions.length > 0) {
          // Find the best submission (highest score)
          const bestSubmission = submissions.reduce((best, current) => {
            const currentScore =
              current.totalTestcases > 0
                ? (current.passedTestcases / current.totalTestcases) * 100
                : 0;
            const bestCurrentScore =
              best.totalTestcases > 0
                ? (best.passedTestcases / best.totalTestcases) * 100
                : 0;

            return currentScore > bestCurrentScore ? current : best;
          });

          bestScore =
            bestSubmission.totalTestcases > 0
              ? Math.round(
                  (bestSubmission.passedTestcases /
                    bestSubmission.totalTestcases) *
                    100,
                )
              : 0;
          latestStatus = bestSubmission.status;
          passedTestcases = bestSubmission.passedTestcases;
          totalTestcases = bestSubmission.totalTestcases;
          sourceCode = bestSubmission.sourceCode;
        }

        return {
          problemId: examProblem.problemId,
          problemTitle: examProblem.problem.title,
          problemNumber: examProblem.problem.number,
          bestScore,
          attempts: submissions.length,
          latestStatus,
          passedTestcases,
          totalTestcases,
          sourceCode,
        };
      });

      const totalScore =
        examDetails.problems.length > 0
          ? Math.round(
              problemScores.reduce(
                (sum, problem) => sum + problem.bestScore,
                0,
              ) / examDetails.problems.length,
            )
          : 0;

      return {
        studentId: attempt.student.id,
        studentName: attempt.student.name,
        studentEmail: attempt.student.email,
        attemptId: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        expiresAt: attempt.expiresAt,
        totalScore: totalScore,
        lastHeartbeatAt: attempt.lastHeartbeatAt,
        disconnectCount: attempt.disconnectCount,
        problemScores,
      };
    });

    // Calculate statistics
    const submittedAttempts = examAttempts.filter(
      (a) => a.status === "SUBMITTED" || a.status === "AUTO_SUBMITTED",
    );
    const inProgressAttempts = examAttempts.filter(
      (a) => a.status === "IN_PROGRESS",
    );
    const notStartedAttempts = examAttempts.filter(
      (a) => a.status === "NOT_STARTED",
    );

    const scores = studentResults
      .filter(
        (result) =>
          result.status === "SUBMITTED" || result.status === "AUTO_SUBMITTED",
      )
      .map((result) => result.totalScore);

    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const completionRate =
      examAttempts.length > 0
        ? (submittedAttempts.length / examAttempts.length) * 100
        : 0;

    const statistics = {
      totalStudents: examAttempts.length,
      submitted: submittedAttempts.length,
      inProgress: inProgressAttempts.length,
      notStarted: notStartedAttempts.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      completionRate: Math.round(completionRate * 100) / 100,
    };

    return NextResponse.json<TeacherTestResultsResponse>({
      examDetails: {
        id: examDetails.id,
        title: examDetails.title,
        description: examDetails.description,
        durationMin: examDetails.durationMin,
        startDate: examDetails.startDate,
        endDate: examDetails.endDate,
        isPublished: examDetails.isPublished,
        status: examDetails.status,
        sebEnabled: examDetails.sebEnabled,
        problems: examDetails.problems.map((ep) => ({
          order: ep.order,
          problem: ep.problem,
        })),
      },
      studentResults,
      statistics,
    });
  } catch (error) {
    console.error("Error fetching teacher test results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
