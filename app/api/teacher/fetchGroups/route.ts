import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  const creatorId = session?.user.id;

  let fetchedGroups = [];

  fetchedGroups = await prisma.group.findMany({
    where: {
      creatorId: creatorId,
    },
  });


  return NextResponse.json(
    { data: fetchedGroups },
    { status: 200, statusText: "Groups Fetched Successfully" }
  );
}
