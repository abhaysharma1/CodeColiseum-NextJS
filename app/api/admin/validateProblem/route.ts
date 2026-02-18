import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

interface JudgeStatus {
  id: number;
  description: string;
}

interface JudgeResponse {
  stdout: string | null;
  time: string;
  memory: number;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  stdin: string | null;
  status: JudgeStatus;
  expected_output: string | null;
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
  stdin: decodeBase64(raw.stdin),
  expected_output: decodeBase64(raw.expected_output),
});

const testSchema = z.object({
  input: z.string().max(100_000),
  output: z.string().max(100_000),
});

const problemSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().default("MEDIUM"),
  source: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  publicTests: z.array(testSchema).optional().default([]),
  hiddenTests: z.array(testSchema).optional().default([]),
  referenceSolution: z.object({ languageId: z.number(), code: z.string() }),
});

const fileSchema = z.array(problemSchema).max(2000);
type ProblemInput = z.infer<typeof problemSchema>;

type RowResult =
  | { title: string; result: "created"; number: number }
  | { title: string; result: "error"; message: string };

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // only admin can submit questions
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Empty Request" }, { status: 400 });
    }

    // validation using zod
    const parsed = fileSchema.safeParse(body);
    if (!parsed.success) {
      console.log(JSON.stringify(parsed.error.format(), null, 2));
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error" }, { status: 400 });
    }

    const testCasesBefore = [
      ...parsed.data[0].publicTests,
      ...parsed.data[0].hiddenTests,
    ];

    let cases;

    // Handle both string and object formats
    if (typeof testCasesBefore === "string") {
      cases = JSON.parse(testCasesBefore);
    } else {
      cases = JSON.parse(JSON.stringify(testCasesBefore));
    }

    let code: string;
    if (typeof parsed.data[0].referenceSolution.code === "string") {
      code = parsed.data[0].referenceSolution.code;
    } else {
      code = JSON.stringify(parsed.data[0].referenceSolution.code);
    }

    const submissions = cases.map((item: any) => ({
      language_id: parsed.data[0].referenceSolution.languageId,
      source_code: encodeBase64(code),
      stdin: encodeBase64(item.input),
      expected_output: encodeBase64(item.output),
    }));

    const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;

    // 📨 Submit all test cases
    const batchResponse = await axios.post(
      `${JUDGE0_DOMAIN}/submissions/batch`,
      { submissions },
      {
        params: {
          base64_encoded: true,
          wait: false,
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
        const statusResponse = await axios.get<Judge0Raw>(
          `${JUDGE0_DOMAIN}/submissions/${token}`,
          {
            params: {
              base64_encoded: true,
              fields: "*",
            },
            headers: {
              "X-AUTH_TOKEN": process.env.JUDGE0_API_KEY,
            },
          },
        );

        const result = reconstructJudge0Response(statusResponse.data);

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
      tokens.map((token: string) => pollSubmission(token)),
    );

    const reply = { responses, cases };

    return NextResponse.json(reply, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
      },
    );
  }
}
