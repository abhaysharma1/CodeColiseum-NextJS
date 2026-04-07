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
  code: string;
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
