import { Exam, ExamAttempt } from "@/interfaces/DB Schema";
import { canGiveExam, validateAttempt } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { verifySEB, SEBError } from "@/lib/SEBhelper";
import { expectedComplexity, GeneratorPattern } from "@/generated/prisma/enums";
import { sanitizeSourceCode } from "@/utils/sanitizeCode";

/* -------------------------- Base64 utils -------------------------- */

const encodeBase64 = (value?: string | null): string | null =>
  value ? Buffer.from(value, "utf8").toString("base64") : null;

const decodeBase64 = (value?: string | null): string | null => {
  if (!value) return null;
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return value;
  }
};

/* -------------------------- Types -------------------------- */

interface JudgeResponse {
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

interface PollResult {
  result: JudgeResponse;
  passed: boolean;
  token: string;
}

type FunctionalCase = {
  input: string;
  output: string;
};

type ComplexityCase = {
  input: string;
};

/* -------------------------- Languages -------------------------- */

const languages = [
  { id: 50, name: "C" },
  { id: 54, name: "C++" },
  { id: 51, name: "C#" },
  { id: 60, name: "Go" },
  { id: 62, name: "Java" },
  { id: 63, name: "JavaScript" },
  { id: 71, name: "Python" },
  { id: 73, name: "Rust" },
  { id: 74, name: "TypeScript" },
];

const getLanguageNameById = (id: number) =>
  languages.find((l) => l.id === id)?.name ?? "Unknown";

/* -------------------------- Route -------------------------- */

interface data {
  languageId: number;
  code: string;
  examDetails: Exam;
  examAttempt: ExamAttempt;
  problemId: string;
}

interface TestCaseResult {
  status: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string;
  memory: number;
}

interface SubmitCodeSuccessResponse {
  success: true;
  submissionId: string;
  status:
    | "ACCEPTED"
    | "PARTIAL"
    | "WRONG_ANSWER"
    | "COMPILE_ERROR"
    | "RUNTIME_ERROR"
    | "TIME_LIMIT"
    | "INTERNAL_ERROR";
  score: number;
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
  yourTimeComplexity?: string | null;
  expectedTimeComplexity?: string | null;
}

interface SubmitCodeErrorResponse {
  error: string;
  details?: string;
}

export type SubmitCodeResponse =
  | SubmitCodeSuccessResponse
  | SubmitCodeErrorResponse;

// Map Judge0 status IDs to our status strings
function mapJudge0Status(statusId: number): string {
  switch (statusId) {
    case 3:
      return "ACCEPTED";
    case 4:
      return "WRONG_ANSWER";
    case 5:
      return "TIME_LIMIT_EXCEEDED";
    case 6:
      return "COMPILATION_ERROR";
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return "RUNTIME_ERROR";
    default:
      return "INTERNAL_ERROR";
  }
}

export async function POST(req: NextRequest) {
  const reqbody = await req.json();
  const data = reqbody as data;
  const language = languages.find((item) => item.id == data.languageId)?.name;
  let session;
  const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

  const examDetails = await prisma.exam.findUnique({
    where: { id: data.examDetails.id },
  });

  if (!examDetails) {
    return NextResponse.json({ error: "Exam Not Found" }, { status: 404 });
  }

  if (examDetails.sebEnabled) {
    try {
      verifySEB(req);
    } catch (error) {
      const status = error instanceof SEBError ? error.status : 403;
      const message =
        error instanceof SEBError
          ? error.message
          : "Please use Safe Exam Browser to give this exam";

      return NextResponse.json({ error: message }, { status });
    }
  }

  try {
    session = await canGiveExam(data.examDetails);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    validateAttempt(examDetails.id, session.user.id);
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const casesData = await prisma.testCase.findUnique({
    where: {
      problemId: data.problemId,
    },
  });

  if (!casesData) {
    return NextResponse.json(
      { error: "Test cases not found for this problem" },
      { status: 404 },
    );
  }

  let cases;

  if (typeof casesData.cases === "string") {
    cases = JSON.parse(casesData.cases);
  } else {
    cases = JSON.parse(JSON.stringify(casesData.cases));
  }

  if (!cases || !Array.isArray(cases) || cases.length === 0) {
    return NextResponse.json(
      { error: "Test cases not found for this problem" },
      { status: 404 },
    );
  }

  // Get driver code for final code assembly
  const driver = await prisma.driverCode.findUnique({
    where: {
      languageId_problemId: {
        languageId: data.languageId,
        problemId: data.problemId,
      },
    },
  });

  const finalCode = sanitizeSourceCode(
    `${driver?.header ?? ""}\n${data.code}\n${driver?.footer ?? ""}`,
  );

  const submissions = cases.map((item) => ({
    language_id: data.languageId,
    source_code: encodeBase64(finalCode),
    stdin: encodeBase64(item.input),
    expected_output: encodeBase64(item.output),
  }));

  // 🌍 Choose the correct Judge0 domain
  const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;

  try {
    // 📨 Submit all test cases
    const batchResponse = await axios.post(
      `${JUDGE0_DOMAIN}/submissions/batch`,
      { submissions },
      {
        params: {
          base64_encoded: "true",
          wait: "false",
          fields: "*",
        },
        headers: {
          "X-AUTH_TOKEN": process.env.JUDGE0_API_KEY,
        },
      },
    );

    const tokens = (batchResponse.data as any[]).map((item: any) => item.token);

    const pollSubmission = async (token: string): Promise<JudgeResponse> => {
      let attempts = 0;
      const maxAttempts = 30; // ~15 seconds (30 * 500ms)

      while (attempts < maxAttempts) {
        const statusResponse = await axios.get(
          `${JUDGE0_DOMAIN}/submissions/${token}`,
          {
            params: {
              base64_encoded: "true",
              fields: "*",
            },
            headers: { "X-AUTH_TOKEN": JUDGE0_API_KEY },
          },
        );

        const result = statusResponse.data as JudgeResponse;

        // Status IDs: 1=In Queue, 2=Processing, 3+=Finished
        if (result.status.id > 2) {
          return result;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
      throw new Error(`Submission ${token} timed out`);
    };

    const responses = await Promise.all(
      tokens.map((token) => pollSubmission(token)),
    );

    let totalTimeTaken = 0;
    let totalMemoryTaken = 0;

    for (const p of responses) {
      totalTimeTaken += Number(p.time);
      totalMemoryTaken += Number(p.memory);
    }

    const finalResults = responses.map((res) => ({
      status: mapJudge0Status(res.status.id),
      stdout: decodeBase64(res.stdout),
      stderr: decodeBase64(res.stderr),
      compile_output: decodeBase64(res.compile_output),
      time: res.time,
      memory: res.memory,
    }));

    // Calculate overall status and score
    const passedCount = finalResults.filter(
      (r) => r.status === "ACCEPTED",
    ).length;
    const totalCount = finalResults.length;
    let score = Math.round((passedCount / totalCount) * 100);

    let overallStatus:
      | "ACCEPTED"
      | "PARTIAL"
      | "WRONG_ANSWER"
      | "COMPILE_ERROR"
      | "RUNTIME_ERROR"
      | "TIME_LIMIT"
      | "INTERNAL_ERROR";

    if (finalResults.some((r) => r.status === "COMPILATION_ERROR")) {
      overallStatus = "COMPILE_ERROR";
    } else if (finalResults.some((r) => r.status === "TIME_LIMIT_EXCEEDED")) {
      overallStatus = "TIME_LIMIT";
    } else if (finalResults.some((r) => r.status === "RUNTIME_ERROR")) {
      overallStatus = "RUNTIME_ERROR";
    } else if (passedCount === totalCount) {
      overallStatus = "ACCEPTED";
    } else if (passedCount > 0) {
      overallStatus = "PARTIAL";
    } else {
      overallStatus = "WRONG_ANSWER";
    }

    let yourTimeComplexity = null;
    let expectedTimeComplexity = null;

    // Only run complexity testing if all functional tests passed
    if (passedCount === totalCount) {
      /* -------------------------- Complexity testing -------------------------- */

      // ------------------ Build complexity cases ------------------

      let complexityCases: ComplexityCase[] = [];

      const complexityCasesGenerator =
        await prisma.problemTestGenerator.findUnique({
          where: {
            problemId: data.problemId,
          },
        });

      if (!complexityCasesGenerator) {
        return NextResponse.json(
          { error: "Couldn't find complexity generator" },
          { status: 500 },
        );
      }

      // Only ARRAY supported for now (safe + explicit)
      if (complexityCasesGenerator.type !== "ARRAY") {
        return NextResponse.json(
          { error: "Unsupported complexity generator type" },
          { status: 500 },
        );
      }

      for (const size of complexityCasesGenerator.sizes) {
        const arr = generateArray(
          size,
          complexityCasesGenerator.minValue,
          complexityCasesGenerator.maxValue,
          complexityCasesGenerator.pattern,
        );

        const input = `${size}\n${arr.join(" ")}`;

        complexityCases.push({ input });
      }

      // Safety: need at least 3 runs for ratios
      if (complexityCases.length < 3) {
        return NextResponse.json(
          { error: "Not enough complexity cases" },
          { status: 422 },
        );
      }

      // ------------------ Run complexity tests ------------------

      const times: number[] = [];

      // Optional warmup run (discard result)
      await axios.post(
        `${JUDGE0_DOMAIN}/submissions`,
        {
          language_id: data.languageId,
          source_code: encodeBase64(finalCode),
          stdin: encodeBase64(complexityCases[0].input),
        },
        {
          params: { base64_encoded: "true", wait: "true" },
          headers: { "X-AUTH_TOKEN": process.env.JUDGE0_API_KEY },
        },
      );

      for (const c of complexityCases) {
        const res = await axios.post<{ time: string }>(
          `${JUDGE0_DOMAIN}/submissions`,
          {
            language_id: data.languageId,
            source_code: encodeBase64(finalCode),
            stdin: encodeBase64(c.input),
          },
          {
            params: { base64_encoded: "true", wait: "true" },
            headers: { "X-AUTH_TOKEN": process.env.JUDGE0_API_KEY },
          },
        );

        const t = Number(res.data.time);
        times.push(Number.isFinite(t) ? t : 0);
      }

      if (times.some((t) => t <= 0)) {
        return NextResponse.json(
          { error: "Unstable complexity measurement" },
          { status: 422 },
        );
      }

      // ------------------ Complexity analysis ------------------

      const r1 = times[1] / times[0];
      const r2 = times[2] / times[1];

      const { complexity } = classifyComplexity(r1, r2);

      // expectedComplexity can be null
      // ...existing code...
      const expectedKey =
        (complexityCasesGenerator.expectedComplexity as keyof typeof ranges) ??
        ("EXP" as keyof typeof ranges);

      const curr = ranges[complexity as keyof typeof ranges].idx;
      const exp = ranges[expectedKey].idx;

      const complexityStatus = curr > exp ? "WRONG_ANSWER" : "ACCEPTED";

      yourTimeComplexity = complexity;
      expectedTimeComplexity = complexityCasesGenerator.expectedComplexity;

      // Update overall status if complexity failed
      if (complexityStatus !== "ACCEPTED") {
        overallStatus = "WRONG_ANSWER";
        score = Math.round(score * 0.5); // Penalty for bad scaling
      }
    }

    //Set The Final Test Case for AI Evaluation

    const prevFinalSubmission = await prisma.submission.findFirst({
      where: {
        userId: session.user.id,
        isFinal: true,
        problemId: data.problemId,
        examId: data.examDetails.id,
        attemptId: data.examAttempt.id,
      },
    });

    // Create submission with final results (after complexity testing)

    let isCurrentSubmissionFinal = false;

    if (
      !prevFinalSubmission ||
      prevFinalSubmission.passedTestcases <= passedCount
    ) {
      isCurrentSubmissionFinal = true;
      if (prevFinalSubmission) {
        await prisma.submission.update({
          where: {
            id: prevFinalSubmission.id,
          },
          data: {
            isFinal: false,
          },
        });
      }
    }

    const submission = await prisma.submission.create({
      data: {
        attemptId: data.examAttempt.id,
        problemId: data.problemId,
        language: language!,
        sourceCode: data.code,
        status: overallStatus,
        totalTestcases: totalCount,
        passedTestcases: passedCount,
        executionTime: totalTimeTaken,
        memory: totalMemoryTaken,
        examId: data.examDetails.id,
        userId: session.user.id,
        isFinal: isCurrentSubmissionFinal,
      },
    });

    return NextResponse.json(
      {
        success: true,
        submissionId: submission.id,
        status: overallStatus,
        score: score,
        passedCount: passedCount,
        totalCount: totalCount,
        results: finalResults,
        totalTimeTaken,
        totalMemoryTaken,
        yourTimeComplexity: yourTimeComplexity,
        expectedTimeComplexity: expectedTimeComplexity,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting code:", error);
    return NextResponse.json(
      {
        error: "Failed to submit code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

const ranges = {
  LOGN: { min: 0, max: 1.3, idx: 0 },
  N: { min: 1.3, max: 1.8, idx: 1 },
  NLOGN: { min: 1.8, max: 2.6, idx: 2 },
  N2: { min: 2.6, max: 4.5, idx: 3 },
  N3: { min: 4.5, max: 7.5, idx: 4 },
  EXP: { min: 7.5, max: Infinity, idx: 5 },
};

function classifyComplexity(r1: number, r2: number) {
  if (Math.abs(r1 - r2) / Math.max(r1, r2) > 0.4) {
    return { complexity: "EXP" };
  }

  const avg = (r1 + r2) / 2;

  for (const [k, v] of Object.entries(ranges)) {
    if (avg >= v.min && avg < v.max) {
      return { complexity: k as keyof typeof ranges };
    }
  }

  return { complexity: "EXP" };
}

function generateArray(
  size: number,
  min: number,
  max: number,
  pattern: GeneratorPattern,
): number[] {
  let arr = Array.from(
    { length: size },
    () => Math.floor(Math.random() * (max - min + 1)) + min,
  );

  if (pattern === "SORTED") arr.sort((a, b) => a - b);
  if (pattern === "REVERSE") arr.sort((a, b) => b - a);
  if (pattern === "CONSTANT") arr.fill(arr[0]);

  return arr;
}
