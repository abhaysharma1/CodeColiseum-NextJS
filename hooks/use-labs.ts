import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { toast } from "sonner";

export interface TeacherLab {
  id: string;
  title: string;
  description: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  modulesCount: number;
  assignedGroupsCount?: number;
}

export interface TeacherLabPagination {
  take: number;
  skip: number;
  total: number;
  pages: number;
}

export interface TeacherLabListResponse {
  data: TeacherLab[];
  pagination: TeacherLabPagination;
}

export interface TeacherModule {
  id: string;
  title: string;
  description: string | null;
  labId: string;
  weekNumber: number;
  orderIndex: number;
  unlockAt: string;
  dueAt: string | null;
  assessmentExamId: string | null;
  createdAt: string;
  updatedAt: string;
  problemsCount: number;
}

export interface TeacherModuleProblem {
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
}

export interface TeacherAssessment {
  examId: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
}

export interface AssignedGroup {
  groupId: string;
  groupName: string;
}

export interface AssessmentResults {
  totalStudents: number;
  attemptedStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  solvedProblems: number;
  totalProblems: number;
  completionPercentage: number;
}

export interface ProblemAnalytics {
  problemId: string;
  problemNumber: number;
  problemTitle: string;
  attemptedStudents: number;
  solvedStudents: number;
  solveRate: number;
  averageAttempts: number;
}

export interface StudentLab {
  id: string;
  title: string;
  description: string | null;
  modulesCount: number;
  modules: StudentModule[];
}

export interface StudentModule {
  id: string;
  title: string;
  weekNumber: number;
  orderIndex: number;
  unlockAt: string;
  dueAt: string | null;
  problemsCount: number;
  completedProblems: number;
  totalProblems: number;
  completionPercentage: number;
  moduleStatus: "LOCKED" | "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
  progress: {
    moduleProblemId: string;
    attemptCount: number;
    isSolved: boolean;
    lastAttemptAt: string | null;
  }[];
  assessment: {
    examId: string;
    title: string;
    startTime: string;
    status: string;
  } | null;
}

export interface StudentModuleProblems {
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
  problems: {
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
  }[];
}

export interface GroupOption {
  id: string;
  name: string;
}

export function useTeacherLabs(take: number, skip: number, searchValue: string) {
  const [data, setData] = useState<TeacherLab[]>([]);
  const [pagination, setPagination] = useState<TeacherLabPagination | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/teacher/labs`, {
        params: { take, skip, searchvalue: searchValue },
        withCredentials: true,
      });
      const result = res.data as TeacherLabListResponse;
      setData(result.data);
      setPagination(result.pagination);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch labs");
    } finally {
      setLoading(false);
    }
  }, [take, skip, searchValue]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, pagination, loading, refetch: fetch };
}

export function useTeacherLab(labId: string) {
  const [data, setData] = useState<TeacherLab | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!labId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/teacher/labs/${labId}`, {
        withCredentials: true,
      });
      setData(res.data as TeacherLab);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch lab");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherModules(labId: string) {
  const [data, setData] = useState<TeacherModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!labId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${getBackendURL()}/teacher/labs/${labId}/modules`,
        { withCredentials: true }
      );
      setData(res.data as TeacherModule[]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to fetch modules";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useTeacherModule(moduleId: string) {
  const [data, setData] = useState<TeacherModule | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/modules/${moduleId}`,
        { withCredentials: true }
      );
      setData(res.data as TeacherModule);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch module");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherModuleProblems(moduleId: string) {
  const [data, setData] = useState<TeacherModuleProblem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/modules/${moduleId}/problems`,
        { withCredentials: true }
      );
      setData(res.data as TeacherModuleProblem[]);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch problems"
      );
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherAssessment(moduleId: string) {
  const [data, setData] = useState<TeacherAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/modules/${moduleId}/assessment`,
        { withCredentials: true }
      );
      setData(res.data as TeacherAssessment);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch assessment"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherAssignedGroups(labId: string) {
  const [data, setData] = useState<AssignedGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!labId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/labs/${labId}/assign`,
        { withCredentials: true }
      );
      setData(res.data as AssignedGroup[]);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherGroups() {
  const [data, setData] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/teacher/exam/getallgroups`, {
        withCredentials: true,
      });
      const groups = (res.data as any[]) ?? [];
      setData(
        groups.map((g: any) => ({
          id: g.id,
          name: g.name,
        }))
      );
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherAssessmentResults(moduleId: string) {
  const [data, setData] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/modules/${moduleId}/assessment-results`,
        { withCredentials: true }
      );
      setData(res.data as AssessmentResults);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherStudentProgress(moduleId: string) {
  const [data, setData] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/modules/${moduleId}/student-progress`,
        { withCredentials: true }
      );
      setData(res.data as StudentProgress[]);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeacherProblemAnalytics(moduleId: string) {
  const [data, setData] = useState<ProblemAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/modules/${moduleId}/problem-analytics`,
        { withCredentials: true }
      );
      setData(res.data as ProblemAnalytics[]);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useStudentMyLabs() {
  const [data, setData] = useState<StudentLab[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/student/my-labs`, {
        withCredentials: true,
      });
      setData(res.data as StudentLab[]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch labs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useStudentMyLab(labId: string) {
  const [data, setData] = useState<StudentLab | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!labId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/student/my-labs/${labId}`,
        { withCredentials: true }
      );
      setData(res.data as StudentLab);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch lab");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useStudentModuleProblems(moduleId: string) {
  const [data, setData] = useState<StudentModuleProblems | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/student/modules/${moduleId}/problems`,
        { withCredentials: true }
      );
      setData(res.data as StudentModuleProblems);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch module problems"
      );
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}
