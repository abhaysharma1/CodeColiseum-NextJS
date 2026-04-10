export type ExecutionStatusType =
  | "PENDING"
  | "RUNNING"
  | "ACCEPTED"
  | "PARTIAL"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "INTERNAL_ERROR"
  | "BAD_SCALING";

/**
 * Response during active polling phase
 * Minimal payload to reduce network traffic
 */
export interface SubmissionPollingResult {
  success?: boolean;
  submissionId: string;
  status: ExecutionStatusType;
}

/**
 * Response when submission processing is complete
 * Complete payload with all execution details
 */
export interface SubmissionTerminalResult {
  success?: boolean;
  submissionId: string;
  sourceCode: string;
  language: string;
  passedTestcases: number;
  totalTestcases: number;
  executionTime?: number; // in seconds
  memory?: number; // in MB
  stderr?: string | null;
  status: ExecutionStatusType;
  createdAt?: Date | string;
}

/**
 * Discriminated union of polling and terminal submission results
 * Type guard: check if 'sourceCode' exists to narrow to SubmissionTerminalResult
 *
 * @example
 * if ('sourceCode' in result) {
 *   // result is SubmissionTerminalResult
 * }
 */
export type SubmissionResult =
  | SubmissionPollingResult
  | SubmissionTerminalResult;

/** @deprecated Use SubmissionResult instead */
export interface submitTestCaseType {
  success?: boolean;
  submissionId?: string;
  failedCase?: {
    language_id: number;
    source_code: string;
    stdin: string;
    expected_output: string;
  };
  noOfPassedCases?: number;
  passedTestcases?: number;
  totalCases?: number;
  totalTestcases?: number;
  totalMemoryUsed?: number;
  totalTimeTaken?: number;
  status: "PENDING" | "RUNNING" | "BAD_ALGORITHM" | "BAD_SCALING" | "ACCEPTED";
  stderr?: string | null;
  failedCaseExecutionDetails?: JudgeResponse;
  yourTimeComplexity?: string;
  expectedTimeComplexity?: string;
  error?: string;
  details?: {
    r1: number;
    r2: number;
    avgRatio: number;
  };
}

export interface runTestCaseType {
  responses: PistonExecutionResponse[];
  cases: {
    input: string;
    output: string;
  }[];
}

export interface PistonExecutionStage {
  stdout: string;
  stderr: string;
  output: string;
  code: number | null;
  signal: string | null;
}

export interface PistonExecutionResponse {
  language: string;
  version: string;
  run: PistonExecutionStage;
  compile?: PistonExecutionStage;
}

export type ProblemSubmissionItem = {
  id: string;
  language: string;
  sourceCode: string;
  noOfPassedCases: number;
  createdAt: Date;
};

export type GetProblemSubmissionsResponse = {
  submissions: ProblemSubmissionItem[];
};

export interface JudgeResponse {
  stdout: string | null;
  time: string;
  memory: number;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}
