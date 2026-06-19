import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

export type AccessStatus = "LOCKED" | "AVAILABLE" | "NOT_YET_AVAILABLE" | "EXPIRED";

export interface ModuleProblemData {
  moduleProblem: {
    id: string;
    moduleId: string;
    problemId: string;
    orderIndex: number | null;
    isUnlocked: boolean;
    availableFrom: string | null;
    availableUntil: string | null;
    accessStatus: AccessStatus;
  };
  module: {
    id: string;
    title: string;
    description: string | null;
    weekNumber: number;
    orderIndex: number | null;
    unlockAt: string | null;
    dueAt: string | null;
    assessmentExamId: string | null;
  };
  lab: {
    id: string;
    title: string;
    description: string | null;
  };
  progress: {
    attemptCount: number;
    isSolved: boolean;
    solvedAt: string | null;
    lastAttemptAt: string | null;
  } | null;
  previousProblem: {
    id: string;
    problemId: string;
    orderIndex: number | null;
  } | null;
  nextProblem: {
    id: string;
    problemId: string;
    orderIndex: number | null;
  } | null;
}

export function useModuleProblemData(moduleProblemId: string | undefined) {
  return useQuery<ModuleProblemData>({
    queryKey: ["module-problem", moduleProblemId],
    queryFn: async () => {
      const res = await axios.get<ModuleProblemData>(
        `${getBackendURL()}/student/module-problems/${moduleProblemId}`,
        { withCredentials: true }
      );
      return res.data;
    },
    enabled: !!moduleProblemId,
  });
}
