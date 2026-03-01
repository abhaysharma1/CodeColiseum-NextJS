"use client";

import {
  GroupOverallStats,
  GroupProblemStats,
} from "@/generated/prisma/browser";
import { getBackendURL } from "@/utils/utilities";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Trophy,
  Clock,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Cpu,
  HardDrive,
  CheckCircle2,
  RotateCcw,
  Zap,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProblemInfo {
  id: string;
  number: number;
  title: string;
  difficulty: string;
}

type ProblemStatsWithProblem = GroupProblemStats & {
  problem: ProblemInfo;
};

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">
          {label}
        </CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

function Page() {
  const params = useParams();
  const groupId = params.id as string;

  const [groupStats, setGroupStats] = useState<GroupOverallStats | undefined>();
  const [loading, setLoading] = useState(true);

  // Problem stats state
  const [problemStats, setProblemStats] = useState<ProblemStatsWithProblem[]>(
    []
  );
  const [problemStatsLoading, setProblemStatsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const TAKE = 10;

  const router = useRouter();

  const getGroupOverallStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/group-overall-stats`,
        {
          params: { groupId },
          withCredentials: true,
        }
      );
      const data = res.data as GroupOverallStats;
      setGroupStats(data);
    } catch (error) {
      toast.error("Couldn't get data");
    } finally {
      setLoading(false);
    }
  };

  const getGroupProblemStats = useCallback(async () => {
    try {
      setProblemStatsLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/group-problem-stats`,
        {
          params: {
            groupId,
            take: TAKE,
            skip: page * TAKE,
            searchValue: debouncedSearch || undefined,
          },
          withCredentials: true,
        }
      );
      const data = res.data as ProblemStatsWithProblem[];
      setProblemStats(data);
      setHasMore(data.length === TAKE);
    } catch (error) {
      toast.error("Couldn't get problem stats");
    } finally {
      setProblemStatsLoading(false);
    }
  }, [groupId, page, debouncedSearch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    getGroupOverallStats();
  }, []);

  useEffect(() => {
    getGroupProblemStats();
  }, [getGroupProblemStats]);

  if (loading) return <LoadingSkeleton />;

  if (!groupStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available.</p>
      </div>
    );
  }

  const passRate = groupStats.overallPassRate
    ? Number(groupStats.overallPassRate) * 100
    : 0;

  const passRateLabel =
    passRate >= 75
      ? "Excellent"
      : passRate >= 50
        ? "Good"
        : "Needs Improvement";
  const passRateBadgeVariant: "default" | "secondary" | "destructive" =
    passRate >= 75 ? "default" : passRate >= 50 ? "secondary" : "destructive";

  const scoreRange =
    Number(groupStats.highestExamAvg ?? 0) -
    Number(groupStats.lowestExamAvg ?? 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex gap-2">
          <Button variant={"ghost"} onClick={() => router.back()}>
            <ArrowLeft />{" "}
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Group Analytics</h2>
        </div>
        <p className="text-muted-foreground">
          Overview of group performance across all exams
        </p>
      </div>

      <Separator />

      {/* Top-level stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={groupStats.totalStudents ?? 0}
          description="Enrolled in this group"
        />
        <StatCard
          icon={FileText}
          label="Total Exams"
          value={groupStats.totalExams ?? 0}
          description="Exams conducted"
        />
        <StatCard
          icon={BarChart3}
          label="Avg Score"
          value={Number(groupStats.avgScoreAllExams ?? 0).toFixed(1)}
          description="Average across all exams"
        />
        <StatCard
          icon={Trophy}
          label="Pass Rate"
          value={`${passRate.toFixed(1)}%`}
          description={passRateLabel}
        />
      </div>

      {/* Detail cards row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pass Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Overall Pass Rate
              <Badge variant={passRateBadgeVariant}>{passRateLabel}</Badge>
            </CardTitle>
            <CardDescription>
              Percentage of students passing across all exams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{passRate.toFixed(1)}%</span>
            </div>
            <Progress value={passRate} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {passRate >= 75
                ? "Great job! Most students are passing."
                : passRate >= 50
                  ? "Decent performance. Some students may need help."
                  : "Many students are struggling. Consider reviewing material."}
            </p>
          </CardContent>
        </Card>

        {/* Score Range Card */}
        <Card >
          <CardHeader>
            <CardTitle>Exam Score Distribution</CardTitle>
            <CardDescription>Highest and lowest exam averages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Highest Avg</p>
                <p className="text-xl font-bold">
                  {Number(groupStats.highestExamAvg ?? 0).toFixed(1)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Lowest Avg</p>
                <p className="text-xl font-bold">
                  {Number(groupStats.lowestExamAvg ?? 0).toFixed(1)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Score Range</span>
              <Badge variant="outline">{scoreRange.toFixed(1)} pts</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Problem Stats Section */}
      <Separator />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Problem-wise Statistics</CardTitle>
              <CardDescription>
                Detailed breakdown of student performance per problem
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {problemStatsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : problemStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">
                No problem statistics found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchValue
                  ? "Try a different search term"
                  : "Stats will appear once students attempt problems"}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {problemStats.map((stat) => {
                const acceptRate =
                  stat.attemptedCount > 0
                    ? (stat.acceptedCount / stat.attemptedCount) * 100
                    : 0;
                const attemptRate =
                  stat.totalStudents > 0
                    ? (stat.attemptedCount / stat.totalStudents) * 100
                    : 0;

                const difficultyConfig = {
                  EASY: {
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                  },
                  MEDIUM: {
                    color: "text-amber-500",
                    bg: "bg-amber-500/10 border-amber-500/20",
                  },
                  HARD: {
                    color: "text-rose-500",
                    bg: "bg-rose-500/10 border-rose-500/20",
                  },
                } as const;

                const diff =
                  difficultyConfig[
                    stat.problem.difficulty as keyof typeof difficultyConfig
                  ] ?? difficultyConfig.MEDIUM;

                return (
                  <AccordionItem
                    key={stat.id}
                    value={stat.id}
                    className="border rounded-lg px-4 data-[state=open]:bg-muted/30 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-4 w-full mr-4">
                        {/* Problem number */}
                        <span className="text-sm font-mono text-muted-foreground w-8 shrink-0 text-left">
                          #{stat.problem.number}
                        </span>

                        {/* Title + Difficulty */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="font-medium text-sm truncate">
                            {stat.problem.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 shrink-0 ${diff.color} ${diff.bg}`}
                          >
                            {stat.problem.difficulty}
                          </Badge>
                        </div>

                        {/* Quick stats on the right */}
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>
                              {stat.attemptedCount}/{stat.totalStudents}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{acceptRate.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1 pb-2">
                        {/* Acceptance Rate */}
                        <div className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Accept Rate
                            </span>
                          </div>
                          <p className="text-xl font-bold tracking-tight">
                            {acceptRate.toFixed(1)}
                            <span className="text-xs font-normal text-muted-foreground">
                              %
                            </span>
                          </p>
                          <Progress value={acceptRate} className="h-1.5" />
                        </div>

                        {/* Attempt Rate */}
                        <div className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
                              <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Attempts
                            </span>
                          </div>
                          <p className="text-xl font-bold tracking-tight">
                            {stat.totalAttempts}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            ~
                            {stat.attemptedCount > 0
                              ? (
                                  stat.totalAttempts / stat.attemptedCount
                                ).toFixed(1)
                              : 0}{" "}
                            per student
                          </p>
                        </div>

                        {/* Avg Runtime */}
                        <div className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10">
                              <Zap className="h-3.5 w-3.5 text-violet-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Avg Runtime
                            </span>
                          </div>
                          <p className="text-xl font-bold tracking-tight">
                            {Number(stat.avgRuntime).toFixed(1)}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              ms
                            </span>
                          </p>
                        </div>

                        {/* Avg Memory */}
                        <div className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/10">
                              <HardDrive className="h-3.5 w-3.5 text-orange-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Avg Memory
                            </span>
                          </div>
                          <p className="text-xl font-bold tracking-tight">
                            {Number(stat.avgMemory).toFixed(1)}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              KB
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Participation bar */}
                      <div className="flex items-center gap-3 px-1 pb-1">
                        <span className="text-xs text-muted-foreground shrink-0">
                          Participation
                        </span>
                        <Progress
                          value={attemptRate}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs font-medium shrink-0">
                          {attemptRate.toFixed(0)}%
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>

        {/* Pagination */}
        {!problemStatsLoading && problemStats.length > 0 && (
          <div className="flex items-between justify-between px-6 h-8 pt-4 align-bottom border-t">
            <p className="text-sm text-muted-foreground">Page {page + 1}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Footer timestamp */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          Last updated:{" "}
          {groupStats.updatedAt
            ? new Date(groupStats.updatedAt).toLocaleString()
            : "N/A"}
        </span>
      </div>
    </div>
  );
}

export default Page;
