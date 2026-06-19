import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

export type AccessStatus = "LOCKED" | "AVAILABLE" | "NOT_YET_AVAILABLE" | "EXPIRED";

export interface ProblemData {
  id: string;
  moduleId: string;
  problemId: string;
  orderIndex: number;
  problem: {
    id: string;
    number: number;
    title: string;
    difficulty: string;
  };
  progress: {
    attemptCount: number;
    isSolved: boolean;
    lastAttemptAt: string | null;
  } | null;
  isUnlocked: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  accessStatus: AccessStatus;
}

export interface ModuleProblemsData {
  module: {
    id: string;
    title: string;
    weekNumber: number;
    unlockAt: string;
    dueAt: string | null;
    assessmentExamId: string | null;
  };
  completedProblems: number;
  totalProblems: number;
  completionPercentage: number;
  assessment: {
    examId: string;
    title: string;
    startTime: string;
    status: string;
  } | null;
  problems: ProblemData[];
}

export function useModuleProblemsList(moduleId: string | undefined) {
  return useQuery<ModuleProblemsData>({
    queryKey: ["module-problems-list", moduleId],
    queryFn: async () => {
      const res = await axios.get<ModuleProblemsData>(
        `${getBackendURL()}/student/modules/${moduleId}/problems`,
        { withCredentials: true }
      );
      return res.data;
    },
    enabled: !!moduleId,
  });
}
