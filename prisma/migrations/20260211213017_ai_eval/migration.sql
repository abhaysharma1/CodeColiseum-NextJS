/*
  Warnings:

  - You are about to drop the column `code` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `input` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `session` table. All the data in the column will be lost.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[examId,userId]` on the table `ExamEnrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[problemId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `durationMin` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `difficulty` on the `Problem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `attemptId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceCode` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cases` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "expectedComplexity" AS ENUM ('LOGN', 'N', 'NLOGN', 'N2', 'N3', 'EXP');

-- CreateEnum
CREATE TYPE "problemDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "submissionStatus" AS ENUM ('ACCEPTED', 'BAD_SCALING', 'BAD_ALGORITHM');

-- CreateEnum
CREATE TYPE "GeneratorType" AS ENUM ('ARRAY', 'STRING', 'MATRIX');

-- CreateEnum
CREATE TYPE "GeneratorPattern" AS ENUM ('RANDOM', 'SORTED', 'REVERSE', 'CONSTANT');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('scheduled', 'active', 'completed', 'ai_processing', 'finished');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'RUNNING', 'ACCEPTED', 'PARTIAL', 'WRONG_ANSWER', 'TIME_LIMIT', 'MEMORY_LIMIT', 'RUNTIME_ERROR', 'COMPILE_ERROR', 'INTERNAL_ERROR');

-- CreateEnum
CREATE TYPE "ExamAttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'TERMINATED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "ExamProblem" DROP CONSTRAINT "ExamProblem_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamProblem" DROP CONSTRAINT "ExamProblem_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_examId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_problemId_fkey";

-- DropIndex
DROP INDEX "session_sessionToken_key";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "durationMin" INTEGER NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sebEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "ExamStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'Unknown',
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "problemDifficulty" NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "code",
ADD COLUMN     "aiQueued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attemptId" TEXT NOT NULL,
ADD COLUMN     "executionTime" INTEGER,
ADD COLUMN     "isFinal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memory" INTEGER,
ADD COLUMN     "passedTestcases" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "problemId" TEXT NOT NULL,
ADD COLUMN     "sourceCode" TEXT NOT NULL,
ADD COLUMN     "totalTestcases" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "examId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "input",
DROP COLUMN "output",
ADD COLUMN     "cases" JSONB NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "session" DROP COLUMN "expires",
DROP COLUMN "sessionToken";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole";

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "complexityTestingCases" (
    "id" TEXT NOT NULL,
    "cases" JSONB NOT NULL,
    "expectedComplexity" "expectedComplexity",
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complexityTestingCases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driverCode" (
    "id" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "header" TEXT,
    "template" TEXT,
    "footer" TEXT,
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driverCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referenceSolution" (
    "id" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "referenceSolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunTestCase" (
    "id" TEXT NOT NULL,
    "cases" JSONB NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selfSubmission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "noOfPassedCases" INTEGER NOT NULL,
    "failedCase" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "submissionStatus" NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "selfSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemTestGenerator" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "type" "GeneratorType" NOT NULL,
    "pattern" "GeneratorPattern" NOT NULL,
    "minValue" INTEGER NOT NULL,
    "maxValue" INTEGER NOT NULL,
    "expectedComplexity" "expectedComplexity" NOT NULL,
    "sizes" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemTestGenerator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamGroup" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "ExamGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "ExamAttemptStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL,
    "disconnectCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "totalScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEvaluation" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "timeComplexity" TEXT,
    "spaceComplexity" TEXT,
    "optimal" BOOLEAN,
    "qualityScore" INTEGER,
    "aiScore" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "noOfMembers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinByLink" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemTag" (
    "problemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProblemTag_pkey" PRIMARY KEY ("problemId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "complexityTestingCases_problemId_key" ON "complexityTestingCases"("problemId");

-- CreateIndex
CREATE INDEX "complexityTestingCases_problemId_idx" ON "complexityTestingCases"("problemId");

-- CreateIndex
CREATE INDEX "driverCode_problemId_idx" ON "driverCode"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "driverCode_languageId_problemId_key" ON "driverCode"("languageId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "RunTestCase_problemId_key" ON "RunTestCase"("problemId");

-- CreateIndex
CREATE INDEX "RunTestCase_problemId_idx" ON "RunTestCase"("problemId");

-- CreateIndex
CREATE INDEX "selfSubmission_userId_idx" ON "selfSubmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemTestGenerator_problemId_key" ON "ProblemTestGenerator"("problemId");

-- CreateIndex
CREATE INDEX "ProblemTestGenerator_problemId_idx" ON "ProblemTestGenerator"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamGroup_examId_groupId_key" ON "ExamGroup"("examId", "groupId");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_studentId_idx" ON "ExamAttempt"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAttempt_examId_studentId_key" ON "ExamAttempt"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AiEvaluation_submissionId_key" ON "AiEvaluation"("submissionId");

-- CreateIndex
CREATE INDEX "AiEvaluation_submissionId_idx" ON "AiEvaluation"("submissionId");

-- CreateIndex
CREATE INDEX "Group_creatorId_idx" ON "Group"("creatorId");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_studentId_idx" ON "GroupMember"("groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_studentId_key" ON "GroupMember"("groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Exam_id_creatorId_idx" ON "Exam"("id", "creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamEnrollment_examId_userId_key" ON "ExamEnrollment"("examId", "userId");

-- CreateIndex
CREATE INDEX "ExamProblem_examId_idx" ON "ExamProblem"("examId");

-- CreateIndex
CREATE INDEX "ExamResult_examId_userId_idx" ON "ExamResult"("examId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_number_key" ON "Problem"("number");

-- CreateIndex
CREATE INDEX "Problem_id_number_title_idx" ON "Problem"("id", "number", "title");

-- CreateIndex
CREATE INDEX "Submission_userId_examId_idx" ON "Submission"("userId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_problemId_key" ON "TestCase"("problemId");

-- CreateIndex
CREATE INDEX "TestCase_problemId_idx" ON "TestCase"("problemId");

-- CreateIndex
CREATE INDEX "session_id_idx" ON "session"("id");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complexityTestingCases" ADD CONSTRAINT "complexityTestingCases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driverCode" ADD CONSTRAINT "driverCode_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referenceSolution" ADD CONSTRAINT "referenceSolution_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunTestCase" ADD CONSTRAINT "RunTestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selfSubmission" ADD CONSTRAINT "selfSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selfSubmission" ADD CONSTRAINT "selfSubmission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTestGenerator" ADD CONSTRAINT "ProblemTestGenerator_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProblem" ADD CONSTRAINT "ExamProblem_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProblem" ADD CONSTRAINT "ExamProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGroup" ADD CONSTRAINT "ExamGroup_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGroup" ADD CONSTRAINT "ExamGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiEvaluation" ADD CONSTRAINT "AiEvaluation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
