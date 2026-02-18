export interface submitTestCaseType {
  failedCase?: {
    language_id: number;
    source_code: string;
    stdin: string;
    expected_output: string;
  };
  noOfPassedCases: number;
  totalCases: number;
  totalMemoryUsed?: number;
  totalTimeTaken?: number;
  status: string;
  failedCaseExecutionDetails?: JudgeResponse;
}

export interface runTestCaseType {
  responses: {
    stdout: string | null;
    time: string | null;
    memory: number | null;
    stderr: string | null;
    token: string;
    compile_output: string | null;
    message: string | null;
    status: {
      id: number;
      description: string;
    };
  }[];
  cases: {
    input: string;
    output: string;
  }[];
}

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
