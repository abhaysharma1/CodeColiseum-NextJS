import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { expectedComplexity, GeneratorPattern } from "@/generated/prisma/enums";
import { sanitizeSourceCode } from "../runcode/route";

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

export async function POST(req: NextRequest) {
  const { questionId, languageId, code } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const problem = await prisma.problem.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!problem) {
    return NextResponse.json(
      { error: "Couldn't find problem" },
      { status: 400 },
    );
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;
  const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

  if (!JUDGE0_DOMAIN || !JUDGE0_API_KEY) {
    return NextResponse.json(
      { error: "Judge0 not configured" },
      { status: 500 },
    );
  }

  /* -------------------------- Load test cases -------------------------- */

  const testCaseRow = await prisma.testCase.findUnique({
    where: { problemId: questionId },
  });

  if (!testCaseRow?.cases) {
    return NextResponse.json(
      { error: "Test cases not found" },
      { status: 404 },
    );
  }

  let functionalCases: FunctionalCase[];
  try {
    functionalCases =
      typeof testCaseRow.cases === "string"
        ? JSON.parse(testCaseRow.cases)
        : testCaseRow.cases;
  } catch {
    return NextResponse.json(
      { error: "Invalid test case format" },
      { status: 500 },
    );
  }

  if (!Array.isArray(functionalCases) || functionalCases.length === 0) {
    return NextResponse.json(
      { error: "No test cases configured" },
      { status: 404 },
    );
  }

  /* -------------------------- Driver code -------------------------- */

  const driver = await prisma.driverCode.findUnique({
    where: {
      languageId_problemId: {
        languageId,
        problemId: questionId,
      },
    },
  });

  const finalCode = sanitizeSourceCode(
    `${driver?.header ?? ""}\n${code}\n${driver?.footer ?? ""}`,
  );

  /* -------------------------- Batch submissions -------------------------- */

  const submissions = functionalCases.map((tc) => ({
    language_id: languageId,
    source_code: encodeBase64(finalCode),
    stdin: encodeBase64(tc.input),
    expected_output: encodeBase64(tc.output),
  }));

  // Judge0 batch endpoint returns an array of submission objects (see runcode route)
  const batch = await axios.post<{ token: string }[]>(
    `${JUDGE0_DOMAIN}/submissions/batch`,
    { submissions },
    {
      params: { base64_encoded: "true", wait: "false" },
      headers: { "X-AUTH_TOKEN": JUDGE0_API_KEY },
    },
  );

  const tokens: string[] = batch.data.map((s) => s.token);

  /* -------------------------- Polling -------------------------- */

  const poll = async (token: string): Promise<PollResult> => {
    for (let i = 0; i < 40; i++) {
      const res = await axios.get<{
        stdout: string | null;
        stderr: string | null;
        compile_output: string | null;
        message: string | null;
        time: string;
        memory: number;
        token: string;
        status: { id: number; description: string };
      }>(`${JUDGE0_DOMAIN}/submissions/${token}`, {
        params: { base64_encoded: "true" },
        headers: { "X-AUTH_TOKEN": JUDGE0_API_KEY },
      });

      const raw = res.data;
      const result: JudgeResponse = {
        ...raw,
        stdout: decodeBase64(raw.stdout),
        stderr: decodeBase64(raw.stderr),
        compile_output: decodeBase64(raw.compile_output),
        message: decodeBase64(raw.message),
      };

      if (result.status.id > 2) {
        return {
          token,
          result,
          passed: result.status.description === "Accepted",
        };
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    throw new Error("Judge0 timeout");
  };

  let passed = 0;
  let totalTime = 0;
  let totalMemory = 0;

  for (let i = 0; i < tokens.length; i++) {
    const res = await poll(tokens[i]);

    totalTime += Number(res.result.time) || 0;
    totalMemory += res.result.memory || 0;

    if (!res.passed) {
      await prisma.selfSubmission.create({
        data: {
          code,
          language: getLanguageNameById(languageId),
          noOfPassedCases: passed,
          failedCase: {
            language_id: languageId,
            source_code: finalCode,
            stdin: functionalCases[i].input,
            expected_output: functionalCases[i].output,
          },
          userId: session.user.id,
          problemId: questionId,
          status: "BAD_ALGORITHM",
        },
      });

      return NextResponse.json(
        {
          status: "BAD_ALGORITHM",
          noOfPassedCases: passed,
          totalCases: functionalCases.length,
          failedCase: {
            language_id: languageId,
            source_code: finalCode,
            stdin: functionalCases[i].input,
            expected_output: functionalCases[i].output,
          },
          failedCaseExecutionDetails: res.result,
        },
        { status: 200 },
      );
    }

    passed++;
  }

  /* -------------------------- Complexity testing -------------------------- */

  // ------------------ Build complexity cases ------------------

  let complexityCases: ComplexityCase[] = [];

  const complexityCasesGenerator = await prisma.problemTestGenerator.findUnique(
    {
      where: {
        problemId: problem.id,
      },
    },
  );

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
      language_id: languageId,
      source_code: encodeBase64(finalCode),
      stdin: encodeBase64(complexityCases[0].input),
    },
    {
      params: { base64_encoded: "true", wait: "true" },
      headers: { "X-AUTH_TOKEN": JUDGE0_API_KEY },
    },
  );

  for (const c of complexityCases) {
    const res = await axios.post<{ time: string }>(
      `${JUDGE0_DOMAIN}/submissions`,
      {
        language_id: languageId,
        source_code: encodeBase64(finalCode),
        stdin: encodeBase64(c.input),
      },
      {
        params: { base64_encoded: "true", wait: "true" },
        headers: { "X-AUTH_TOKEN": JUDGE0_API_KEY },
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
  const expectedKey =
    (complexityCasesGenerator.expectedComplexity as keyof typeof ranges) ??
    ("EXP" as keyof typeof ranges);

  const curr = ranges[complexity as keyof typeof ranges].idx;
  const exp = ranges[expectedKey].idx;

  const status = curr > exp ? "BAD_SCALING" : "ACCEPTED";

  // ------------------ Persist result ------------------

  await prisma.selfSubmission.create({
    data: {
      code,
      language: getLanguageNameById(languageId),
      noOfPassedCases: passed,
      userId: session.user.id,
      problemId: questionId,
      status,
    },
  });

  return NextResponse.json(
    {
      status,
      noOfPassedCases: passed,
      totalCases: functionalCases.length,
      totalTimeTaken: totalTime,
      totalMemoryUsed: totalMemory,
      yourTimeComplexity: complexity,
      expectedTimeComplexity: complexityCasesGenerator.expectedComplexity,
    },
    { status: status === "ACCEPTED" ? 201 : 200 },
  );
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
