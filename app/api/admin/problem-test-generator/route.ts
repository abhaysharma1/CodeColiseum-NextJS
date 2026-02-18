import { GeneratorPattern, GeneratorType, expectedComplexity } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const bodySchema = z.object({
  problemId: z.string(),
  type: z.enum(["ARRAY", "STRING", "MATRIX"]).default("ARRAY"),
  pattern: z.enum(["RANDOM", "SORTED", "REVERSE", "CONSTANT"]),
  minValue: z.number().int(),
  maxValue: z.number().int(),
  sizes: z.array(z.number().int().positive()).min(3),
  expectedComplexity: z
    .enum(["N", "LOGN", "NLOGN", "N2", "N3", "EXP"])
    .default("N"),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) {
    return NextResponse.json({ error: "Missing problemId" }, { status: 400 });
  }

  const generator = await prisma.problemTestGenerator.findUnique({
    where: { problemId },
  });

  if (!generator) {
    return NextResponse.json({ generator: null }, { status: 200 });
  }

  return NextResponse.json({ generator }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  if (data.minValue >= data.maxValue) {
    return NextResponse.json(
      { error: "minValue must be less than maxValue" },
      { status: 400 },
    );
  }

  for (let i = 1; i < data.sizes.length; i++) {
    if (data.sizes[i] <= data.sizes[i - 1]) {
      return NextResponse.json(
        { error: "sizes must be strictly increasing" },
        { status: 400 },
      );
    }
  }

  const saved = await prisma.problemTestGenerator.upsert({
    where: { problemId: data.problemId },
    create: {
      problemId: data.problemId,
      type: GeneratorType.ARRAY,
      pattern: data.pattern as keyof typeof GeneratorPattern,
      minValue: data.minValue,
      maxValue: data.maxValue,
      sizes: data.sizes,
      expectedComplexity:
        expectedComplexity[
          data.expectedComplexity as keyof typeof expectedComplexity
        ],
    },
    update: {
      pattern: data.pattern as keyof typeof GeneratorPattern,
      minValue: data.minValue,
      maxValue: data.maxValue,
      sizes: data.sizes,
      expectedComplexity:
        expectedComplexity[
          data.expectedComplexity as keyof typeof expectedComplexity
        ],
    },
  });

  return NextResponse.json({ generator: saved }, { status: 200 });
}
