interface ExamLocalState {
  currentProblemId?: string;
  codeDrafts?: Record<string, string>;
}

type ProblemOwnerType = "ADMIN" | "TEACHER";
type ProblemVisibility = "PUBLIC" | "PRIVATE";
type ProblemApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

