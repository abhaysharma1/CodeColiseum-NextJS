"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { getBackendURL } from "@/utils/utilities";
import { usePermission } from "@/hooks/usePermission";

import { OverviewCards } from "@/components/analytics/OverviewCards";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import {
  StudentFilters,
  FilterState,
} from "@/components/analytics/StudentFilters";
import { StudentTable, StudentData } from "@/components/analytics/StudentTable";
import { StudentExpandedRow } from "@/components/analytics/StudentExpandedRow";
import { AnalyticsPagination } from "@/components/analytics/AnalyticsPagination";

type GroupStatsResponse = {
  groupId: string;
  groupName: string;
  totalExams: number;
  totalStudents: number;
  avgScoreAllExams: number;
  overallPassRate: number;
  lowestExamAvg?: number;
  highestExamAvg?: number;
};

type StudentsResponse = {
  data: Array<{
    id: string;
    name: string;
    email: string;
    rank: number;
    avgScore: number;
    totalAttempts: number;
    avgAttemptsPerProblem: number;
    completionPercentage: number;
    weakTopics: string[];
    strongTopics: string[];
    scoreTrend: string;
    lastActive: string | null;
    avgTimePerProblem: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type StudentDetailResponse = {
  problemPerformance: Array<{
    problemId: string;
    problemNumber: number;
    problemTitle: string;
    difficulty: string;
    attempts: number;
    solved: boolean;
    isWeak: boolean;
    successRate: number;
    avgTime: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    problem: string;
    status: string;
    score: number;
    createdAt: string;
  }>;
  examHistory: Array<{
    examId: string;
    examTitle: string;
    score: number;
    createdAt: string;
  }>;
};

type TeacherGroup = {
  id: string;
  name: string;
};

const BACKEND_URL = getBackendURL();

export default function TeacherAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const queryGroupId = params.get("groupId") ?? "";

  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(queryGroupId);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const canViewAnalytics = usePermission(
    "analytics:view",
    selectedGroupId || undefined
  );

  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "problems" | "exams"
  >("overview");
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingStudentDetail, setIsLoadingStudentDetail] = useState(false);

  const [groupStats, setGroupStats] = useState<GroupStatsResponse | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    scoreMin: 0,
    scoreMax: 100,
    completionStatus: "all",
    weakTopic: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );
  const [expandedStudentData, setExpandedStudentData] = useState<
    StudentDetailResponse | undefined
  >();

  const updateUrlGroupId = useCallback(
    (nextGroupId: string) => {
      const nextParams = new URLSearchParams(params.toString());
      nextParams.set("groupId", nextGroupId);
      router.replace(`${pathname}?${nextParams.toString()}`);
    },
    [params, pathname, router]
  );

  const fetchGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const res = await axios.get<TeacherGroup[]>(
        `${BACKEND_URL}/teacher/getallgroups`,
        {
          params: {
            take: 200,
            skip: 0,
            searchValue: "",
            groupType: "ALL",
          },
          withCredentials: true,
        }
      );

      const fetchedGroups = res.data || [];
      setGroups(fetchedGroups);

      if (!fetchedGroups.length) {
        setSelectedGroupId("");
        return;
      }

      const hasQueryGroup =
        queryGroupId && fetchedGroups.some((g) => g.id === queryGroupId);
      const defaultGroupId = hasQueryGroup ? queryGroupId : fetchedGroups[0].id;

      setSelectedGroupId(defaultGroupId);

      if (defaultGroupId !== queryGroupId) {
        updateUrlGroupId(defaultGroupId);
      }
    } finally {
      setIsLoadingGroups(false);
    }
  }, [queryGroupId, updateUrlGroupId]);

  const fetchStats = useCallback(async () => {
    if (!selectedGroupId) return;
    setIsLoadingStats(true);
    try {
      const res = await axios.get<GroupStatsResponse>(
        `${BACKEND_URL}/teacher/group-overall-stats`,
        {
          params: { groupId: selectedGroupId },
          withCredentials: true,
        }
      );
      setGroupStats(res.data);
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedGroupId]);

  const fetchStudents = useCallback(async () => {
    if (!selectedGroupId) return;
    setIsLoadingStudents(true);
    try {
      const res = await axios.get<StudentsResponse>(
        `${BACKEND_URL}/teacher/analytics/students`,
        {
          params: {
            groupId: selectedGroupId,
            page: currentPage,
            limit: pageSize,
            search: filters.search,
            scoreMin: filters.scoreMin,
            scoreMax: filters.scoreMax,
            completionStatus: filters.completionStatus,
            weakTopic: filters.weakTopic,
          },
          withCredentials: true,
        }
      );

      setStudents(
        res.data.data.map((s) => ({
          ...s,
          lastActive: s.lastActive ? new Date(s.lastActive) : null,
        }))
      );
      setTotalStudents(res.data.pagination.total);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedGroupId, currentPage, pageSize, filters]);

  const fetchStudentDetail = useCallback(
    async (studentId: string) => {
      if (!selectedGroupId) return;
      setIsLoadingStudentDetail(true);
      try {
        const res = await axios.get<StudentDetailResponse>(
          `${BACKEND_URL}/teacher/analytics/students/${studentId}/details`,
          {
            params: { groupId: selectedGroupId },
            withCredentials: true,
          }
        );
        setExpandedStudentData({
          ...res.data,
          recentSubmissions: res.data.recentSubmissions.map((s) => ({
            ...s,
            createdAt: new Date(s.createdAt).toISOString(),
          })),
          examHistory: res.data.examHistory.map((e) => ({
            ...e,
            createdAt: new Date(e.createdAt).toISOString(),
          })),
        });
      } finally {
        setIsLoadingStudentDetail(false);
      }
    },
    [selectedGroupId]
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const chartData = useMemo(() => {
    if (!students.length) return undefined;

    const scoreDistribution: Record<string, number> = {
      "0-20": 0,
      "20-40": 0,
      "40-60": 0,
      "60-80": 0,
      "80-100": 0,
    };

    students.forEach((s) => {
      if (s.avgScore < 20) scoreDistribution["0-20"] += 1;
      else if (s.avgScore < 40) scoreDistribution["20-40"] += 1;
      else if (s.avgScore < 60) scoreDistribution["40-60"] += 1;
      else if (s.avgScore < 80) scoreDistribution["60-80"] += 1;
      else scoreDistribution["80-100"] += 1;
    });

    const completionDistribution = {
      notStarted: students.filter((s) => s.completionPercentage === 0).length,
      inProgress: students.filter(
        (s) => s.completionPercentage > 0 && s.completionPercentage < 100
      ).length,
      completed: students.filter((s) => s.completionPercentage >= 100).length,
    };

    return {
      scoreDistribution,
      completionDistribution,
      performanceTrend: [
        {
          date: "Current",
          avgScore:
            students.reduce((acc, s) => acc + s.avgScore, 0) /
            Math.max(students.length, 1),
          count: students.length,
        },
      ],
      timeSpentByProblem: [],
    };
  }, [students]);

  const overviewData = useMemo(() => {
    if (!groupStats) return undefined;
    return {
      totalStudents: groupStats.totalStudents,
      activeStudents: students.filter((s) => s.lastActive).length,
      avgScore: groupStats.avgScoreAllExams,
      completionRate:
        students.reduce((acc, s) => acc + s.completionPercentage, 0) /
        Math.max(students.length, 1),
      overallPassRate: groupStats.overallPassRate,
      avgAttempts:
        students.reduce((acc, s) => acc + s.avgAttemptsPerProblem, 0) /
        Math.max(students.length, 1),
    };
  }, [groupStats, students]);

  const handleRowExpand = async (studentId: string) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
      setExpandedStudentData(undefined);
      return;
    }
    setExpandedStudentId(studentId);
    await fetchStudentDetail(studentId);
  };

  const selectedStudentName =
    students.find((s) => s.id === expandedStudentId)?.name ?? "Student";

  const canRender = !!selectedGroupId && canViewAnalytics;

  return (
    <div className="min-h-screen  p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Analytics</h1>
          <p className="text-muted-foreground">
            Track performance, completion, and student trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedGroupId || undefined}
            onValueChange={(value) => {
              setCurrentPage(1);
              setExpandedStudentId(null);
              setExpandedStudentData(undefined);
              setSelectedGroupId(value);
              updateUrlGroupId(value);
            }}
            disabled={isLoadingGroups || groups.length === 0}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue
                placeholder={
                  isLoadingGroups ? "Loading groups..." : "Select group"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {!isLoadingGroups && groups.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No groups found</CardTitle>
          </CardHeader>
          <CardContent>
            Create a group first, then analytics will be available here.
          </CardContent>
        </Card>
      )}

      {!!selectedGroupId && !canViewAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Not authorized</CardTitle>
          </CardHeader>
          <CardContent>
            You do not have permission to view analytics for this group.
          </CardContent>
        </Card>
      )}

      {canRender && (
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "overview" | "students" | "problems" | "exams")
          }
        >
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewCards
              groupId={selectedGroupId}
              isLoading={isLoadingStats}
              data={overviewData}
            />
            <AnalyticsCharts
              groupId={selectedGroupId}
              isLoading={isLoadingStats}
              data={chartData}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <StudentFilters
              onFilterChange={(next) => {
                setCurrentPage(1);
                setFilters(next);
              }}
              isLoading={isLoadingStudents}
            />

            <StudentTable
              data={students}
              isLoading={isLoadingStudents}
              onRowExpand={handleRowExpand}
            />

            {expandedStudentId && (
              <StudentExpandedRow
                studentId={expandedStudentId}
                studentName={selectedStudentName}
                data={expandedStudentData}
                isLoading={isLoadingStudentDetail}
              />
            )}

            <AnalyticsPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalStudents}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              isLoading={isLoadingStudents}
            />
          </TabsContent>

          <TabsContent value="problems">
            <Card>
              <CardHeader>
                <CardTitle>Problem Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                Problem-level analytics is wired in backend and can be added
                here next.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Exam Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                Exam-level analytics can be added here next.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
