import { expectedComplexity } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { Response } from "./types";
import axios from "axios";

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

type cases = {
  expectedComplexity: expectedComplexity;
  cases: {
    input: string;
    output: string;
  }[];
};

const json = z.object({
  expectedComplexity: z.enum(["N", "LOGN", "NLOGN", "N2", "N3", "EXP"]),
  cases: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        size: z.enum(["N", "2N", "4N"]),
      }),
    )
    .length(3),
});

const schema = z.object({
  problemId: z.string(),
  casesData: json,
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role != "ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();

  const valid = schema.safeParse(body);
  if (!valid || !valid.data) {
    return NextResponse.json({ error: "Validation Failed" }, { status: 400 });
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: valid.data.problemId,
    },
    include: {
      referenceSolutions: true,
    },
  });

  if (!problem) {
    return NextResponse.json(
      { error: "Couldn't find problem" },
      { status: 400 },
    );
  }

  const refCode = problem.referenceSolutions;

  if (!refCode[0]) {
    return NextResponse.json(
      { error: "Couldn't find reference code" },
      { status: 500 },
    );
  }

  const expectedComplexity = valid.data.casesData.expectedComplexity;
  const cases = valid.data.casesData.cases;

  let arr: Response[] | [] = [];

  const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;

  for (let i = 0; i < cases.length; i++) {
    try {
      const submission = {
        language_id: refCode[0].languageId,
        source_code: encodeBase64(refCode[0].code),
        stdin: encodeBase64(cases[i].input),
        expected_output: encodeBase64(cases[i].output),
      };
      const res = await axios.post<Judge0Raw>(
        `${JUDGE0_DOMAIN}/submissions`,
        submission,
        {
          params: {
            base64_encoded: true,
            wait: true,
            fields: "*",
          },
          headers: {
            "X-AUTH_TOKEN": process.env.JUDGE0_API_KEY,
          },
        },
      );
      const decoded = reconstructJudge0Response(res.data);
      arr[i] = decoded as unknown as Response;
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Please Run the Validation Again" },
        { status: 500 },
      );
    }
  }

  const t1 = Number(arr[0].time); // n
  const t2 = Number(arr[1].time); // 2n
  const t3 = Number(arr[2].time); // 4n

  const r1 = t2 / t1;
  const r2 = t3 / t2;

  const { complexity, avgRatio } = classifyComplexity(r1, r2);

  console.log(complexity, `\n` + avgRatio + `\n`);

  if (complexity === "UNSTABLE" || complexity === "UNKNOWN") {
    return NextResponse.json(
      { error: "Please Run the Validation Again" },
      { status: 500 },
    );
  }

  //@ts-ignore
  const item = ranges[complexity].idx;
  const expCompItem = ranges[expectedComplexity].idx;

  if (item <= expCompItem) {
    return NextResponse.json(
      {
        validation: "Successful",
        expectedComplexity: expectedComplexity,
        yourComplexity: complexity,
        ratio: avgRatio,
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      validation: "Failed",
      expectedCompexity: expectedComplexity,
      yourComplexity: complexity,
      ratio: avgRatio,
    },
    { status: 300 },
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
  // If ratios are wildly inconsistent, flag as unstable
  if (Math.abs(r1 - r2) / Math.max(r1, r2) > 0.4) {
    return {
      complexity: "UNSTABLE",
      reason: "High runtime variance / noise",
    };
  }

  const avg = (r1 + r2) / 2;

  for (const [name, { min, max }] of Object.entries(ranges)) {
    if (avg >= min && avg < max) {
      return {
        complexity: name,
        avgRatio: avg,
        r1,
        r2,
      };
    }
  }

  return {
    complexity: "UNKNOWN",
    avgRatio: avg,
    r1,
    r2,
  };
}
