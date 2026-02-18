/**
 * Problem & Test Cases Schema Types
 * Generated from Prisma schema
 */

import { selfSubmission } from "@/generated/prisma/client";


export interface Problem {
  id: string;
  number: number;
  title: string;
  description: string;
  difficulty: string;
  source: string;
}

export interface TestCase {
  id: string;
  cases: string;
  problemId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RunTestCase {
  id: string;
  cases: string;
  problemId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseItem {
  input: string;
  output: string;
}

export interface FailedTestCase {
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

// Extended types with relations
export interface ProblemWithRelations extends Problem {
  examProblems?: any[];
  tags?: any[];
  testCase?: TestCase | null;
  runTestCase?: RunTestCase | null;
  selfSubmissions?: selfSubmission[];
  submissions?: any[];
}

export interface TestCaseWithProblem extends TestCase {
  problem: Problem;
}

export interface RunTestCaseWithProblem extends RunTestCase {
  problem: Problem;
}

export interface SelfSubmissionWithRelations extends selfSubmission {
  user: any;
  problem: Problem;
}
