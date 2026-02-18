import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/* ----------------------------- Types ----------------------------- */

interface TestCase {
  input: string;
  output: string;
}

interface RunTestCase {
  id: string;
  cases: TestCase[] | string;
  problemId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JudgeStatus {
  id: number;
  description: string;
}

interface JudgeResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  token: string;
  status: JudgeStatus;
}

interface Judge0Raw extends Omit<
  JudgeResponse,
  "stdout" | "stderr" | "compile_output" | "message"
> {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
}

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

const reconstructJudge0Response = (raw: Judge0Raw): JudgeResponse => ({
  ...raw,
  stdout: decodeBase64(raw.stdout),
  stderr: decodeBase64(raw.stderr),
  compile_output: decodeBase64(raw.compile_output),
  message: decodeBase64(raw.message),
});

export function sanitizeSourceCode(code: string): string {
  return (
    code
      // Replace non-breaking spaces with normal spaces
      .replace(/\u00A0/g, " ")

      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "")

      // Normalize smart quotes (just in case)
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")

      // Normalize line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
  );
}

/* ----------------------------- Route ------------------------------ */

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: {
      questionId: string;
      languageId: number;
      code: string;
    } = await req.json();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const runTestCase = await prisma.runTestCase.findUnique({
      where: { problemId: body.questionId },
    });

    if (!runTestCase) {
      return NextResponse.json(
        { error: "Test cases not found" },
        { status: 404 },
      );
    }

    const cases: TestCase[] =
      typeof runTestCase.cases === "string"
        ? JSON.parse(runTestCase.cases)
        : runTestCase.cases;

    if (!Array.isArray(cases) || cases.length === 0) {
      return NextResponse.json(
        { error: "No test cases available" },
        { status: 404 },
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: body.questionId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const driver = await prisma.driverCode.findUnique({
      where: {
        languageId_problemId: {
          languageId: body.languageId,
          problemId: problem.id,
        },
      },
    });

    const finalCode = sanitizeSourceCode(
      `${driver?.header ?? ""}\n${body.code}\n${driver?.footer ?? ""}`,
    );

    /* ----------------------- Judge0 submit ----------------------- */

    const submissions = cases.map((tc) => ({
      language_id: body.languageId,
      source_code: encodeBase64(finalCode),
      stdin: encodeBase64(tc.input),
      expected_output: encodeBase64(tc.output),
    }));

    const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;
    const API_KEY = process.env.JUDGE0_API_KEY;

    if (!JUDGE0_DOMAIN || !API_KEY) {
      throw new Error("Judge0 environment variables missing");
    }

    const batch = await axios.post<{ token: string }[]>(
      `${JUDGE0_DOMAIN}/submissions/batch`,
      { submissions },
      {
        params: {
          base64_encoded: true,
          wait: false,
          fields: "*",
        },
        headers: {
          "X-AUTH_TOKEN": API_KEY,
        },
      },
    );

    const tokens: string[] = batch.data.map((s) => s.token);

    /* --------------------------- Poll --------------------------- */

    const poll = async (token: string): Promise<JudgeResponse> => {
      for (let i = 0; i < 30; i++) {
        const res = await axios.get<Judge0Raw>(
          `${JUDGE0_DOMAIN}/submissions/${token}`,
          {
            params: {
              base64_encoded: true,
              fields: "*",
            },
            headers: {
              "X-AUTH_TOKEN": API_KEY,
            },
          },
        );

        const decoded = reconstructJudge0Response(res.data);

        if (decoded.status.id > 2) return decoded;

        await new Promise((r) => setTimeout(r, 500));
      }

      throw new Error(`Submission ${token} timed out`);
    };

    const responses = await Promise.all(tokens.map(poll));

    return NextResponse.json({ responses, cases }, { status: 200 });
  } catch (err: any) {
    const error = err;

    console.error("Judge0 error:", error.message);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
