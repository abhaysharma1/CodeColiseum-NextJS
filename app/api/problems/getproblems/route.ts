import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const { searchValue, tagName, difficulty, take, skip } = reqBody;

  const where: any = {};

  if (searchValue && searchValue.trim() !== "") {
    where.OR = [
      { title: { contains: searchValue, mode: "insensitive" } },
      { description: { contains: searchValue, mode: "insensitive" } },
      { id:   searchValue },
    ];
  }

  if (tagName) {
    where.tags = {
      some: { name: tagName },
    };
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  const problems = await prisma.problem.findMany({
    where,
    take: take || 10,
    skip: skip || 0,
    orderBy: { number: "asc" },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return NextResponse.json(problems, { status: 200 });
}
