export type ProblemStatus = "DRAFT" | "PUBLISHED";

export type TeacherSubmitStatus = "DRAFT" | "SUBMIT";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type LanguageId = "c" | "cpp" | "python" | "java";

export interface TestCase {
  id: string;
  input: string;
  output: string;
}

export interface TestCaseGroups {
  public: TestCase[];
  hidden: TestCase[];
}

export interface DriverCodeSections {
  header: string;
  template: string;
  footer: string;
}

export type DriverCodeByLanguage = Record<LanguageId, DriverCodeSections>;

export interface ReferenceSolution {
  id: string;
  language: LanguageId;
  code: string;
}

export interface PerformanceConstraints {
  cppTimeLimitMs: number;
  javaTimeLimitMs: number;
  pythonTimeLimitMs: number;
  jsTimeLimitMs: number;
  memoryLimitMB: number;
}

export interface PerformanceTestCase {
  id: string;
  name: string;
  inputFileKey: string;
  outputFileKey: string;
}

export interface ProblemEditorState {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  testCases: TestCaseGroups;
  driverCode: DriverCodeByLanguage;
  solutions: ReferenceSolution[];
  status: ProblemStatus;
  hidden: boolean;
  performanceConstraints?: PerformanceConstraints;
  performanceTestCases?: PerformanceTestCase[];
}
