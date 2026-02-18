import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqbody = await request.json();
    const { groupName, description, emails, allowJoinByLink } = reqbody;

    // Validate required fields
    if (!groupName || !description || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role != "TEACHER") {
      return NextResponse.json({ error: "Not Authorized" }, { status: 403 });
    }

    const groupRedudancyCheck = await prisma.group.findFirst({
      where: {
        name: groupName,
        creatorId: session.user.id,
      },
    });

    if (groupRedudancyCheck?.id) {
      return NextResponse.json(
        { error: "Group with same name already exists" },
        { status: 409 }
      );
    }

    const newGroup = await prisma.group.create({
      data: {
        name: groupName,
        description: description,
        creatorId: session.user.id,
        joinByLink: allowJoinByLink,
      },
    });

    // Filter out empty emails and trim whitespace
    const validEmails = emails
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);

    // Initialize all result arrays
    const notFoundMembers: string[] = [];
    const notStudents: { email: string; name: string }[] = [];
    const alreadyMembers: { email: string; name: string }[] = [];
    const successfullyAdded: { email: string; name: string }[] = [];

    // Fetch all users at once (more efficient)
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: validEmails,
        },
      },
    });

    // Create a map for quick lookup
    const userMap = new Map(users.map((user) => [user.email, user]));

    // Check which emails weren't found
    validEmails.forEach((email: string) => {
      if (!userMap.has(email)) {
        notFoundMembers.push(email);
      }
    });

    // Filter students and check for existing memberships
    const studentsToAdd = users.filter((user) => {
      if (user.role === "TEACHER") {
        notStudents.push({ email: user.email, name: user.name });
        return false;
      }
      return true;
    });

    // Check for existing group memberships
    const existingMembers = await prisma.groupMember.findMany({
      where: {
        groupId: newGroup.id,
        studentId: {
          in: studentsToAdd.map((user) => user.id),
        },
      },
      include: {
        student: true,
      },
    });

    const existingMemberIds = new Set(
      existingMembers.map((member) => member.studentId)
    );

    existingMembers.forEach((member) => {
      alreadyMembers.push({
        email: member.student.email,
        name: member.student.name,
      });
    });

    // Filter out students who are already members
    const newStudents = studentsToAdd.filter(
      (user) => !existingMemberIds.has(user.id)
    );

    // Batch create all group members in a single transaction
    if (newStudents.length > 0) {
      await prisma.$transaction([
        prisma.groupMember.createMany({
          data: newStudents.map((user) => ({
            groupId: newGroup.id,
            studentId: user.id,
          })),
        }),
        prisma.group.update({
          where: { id: newGroup.id },
          data: {
            noOfMembers: { increment: newStudents.length },
          },
        }),
      ]);

      // Populate successfully added emails and names
      successfullyAdded.push(
        ...newStudents.map((user) => ({
          email: user.email,
          name: user.name,
        }))
      );
    }

    return NextResponse.json(
      {
        notFoundMembers: notFoundMembers || [],
        notStudents: notStudents || [],
        alreadyMembers: alreadyMembers || [],
        addedCount: newStudents.length,
        successfullyAdded: successfullyAdded || [],
      },
      { status: 200, statusText: "Group Created Successfully" }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
