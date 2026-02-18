/**
 * Exam & Submission Schema Types
 * Generated from Prisma schema
 */

export enum SubmissionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  ACCEPTED = "ACCEPTED",
  PARTIAL = "PARTIAL",
  WRONG_ANSWER = "WRONG_ANSWER",
  TIME_LIMIT = "TIME_LIMIT",
  MEMORY_LIMIT = "MEMORY_LIMIT",
  RUNTIME_ERROR = "RUNTIME_ERROR",
  COMPILE_ERROR = "COMPILE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export enum ExamAttemptStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  AUTO_SUBMITTED = "AUTO_SUBMITTED",
  TERMINATED = "TERMINATED",
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  creatorId: string;
  startDate: Date;
  endDate: Date;
  durationMin: number;
}

export interface ExamProblem {
  id: string;
  order: number;
  examId: string;
  problemId: string;
}

export interface ExamEnrollment {
  id: string;
  createdAt: Date;
  examId: string;
  userId: string;
}

export interface Submission {
  id: string;
  attemptId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  status: SubmissionStatus;
  score: number;
  result: SubmissionResult | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  examId: string | null;
}

export interface SubmissionResult {
  status?: {
    id: number;
    description: string;
  };
  time?: string;
  memory?: number;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  testCases?: {
    passed: number;
    total: number;
    details?: Array<{
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
    }>;
  };
}

export interface ExamResult {
  id: string;
  score: number;
  createdAt: Date;
  examId: string;
  userId: string;
}

export interface ExamGroup {
  id: string;
  examId: string;
  groupId: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  status: ExamAttemptStatus;
  startedAt: Date;
  expiresAt: Date;
  submittedAt: Date | null;
  totalScore: number;
  lastHeartbeatAt: Date;
}

// Extended types with relations
export interface ExamWithRelations extends Exam {
  creator?: any;
  problems?: ExamProblem[];
  enrollments?: ExamEnrollment[];
  submissions?: Submission[];
  results?: ExamResult[];
  examGroups?: ExamGroup[];
  examAttempts?: ExamAttempt[];
}

export interface ExamProblemWithRelations extends ExamProblem {
  exam?: Exam;
  problem?: any;
}

export interface ExamEnrollmentWithRelations extends ExamEnrollment {
  exam?: Exam;
  user?: any;
}

export interface SubmissionWithRelations extends Submission {
  attempt?: ExamAttempt;
  problem?: any;
  user?: any;
  exam?: Exam;
}

export interface ExamResultWithRelations extends ExamResult {
  exam?: Exam;
  user?: any;
}

export interface ExamGroupWithRelations extends ExamGroup {
  exam?: Exam;
  group?: any;
}

export interface ExamAttemptWithRelations extends ExamAttempt {
  exam?: Exam;
  student?: any;
  submissions?: Submission[];
}
