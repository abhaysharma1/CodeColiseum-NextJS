export type ProblemStatus = "DRAFT" | "PUBLISHED";

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
}
