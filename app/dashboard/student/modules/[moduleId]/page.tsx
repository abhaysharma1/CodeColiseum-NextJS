"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, FlaskConical, BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, Circle, Lock, Unlock, CalendarX, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { ProgressCard } from "@/components/labs/progress-card";
import { AssessmentCard } from "@/components/labs/assessment-card";
import { getBackendURL } from "@/utils/utilities";
import { useIsSEB } from "@/hooks/useIsSEB";
import { launchSEB } from "@/lib/utils";

type AccessStatus = "LOCKED" | "AVAILABLE" | "NOT_YET_AVAILABLE" | "EXPIRED";

interface ProblemData {
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

interface ModuleData {
  id: string;
  title: string;
  weekNumber: number;
  unlockAt: string;
  dueAt: string | null;
  assessmentExamId: string | null;
  sebEnabled?: boolean;
}

interface AssessmentData {
  examId: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  score?: number;
  rank?: number;
}

interface ModuleProblemsData {
  module: ModuleData;
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

const difficultyStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  EASY: {
    bg: "bg-green-500/5",
    text: "text-green-600",
    border: "border-green-500/20",
    label: "Easy",
  },
  MEDIUM: {
    bg: "bg-yellow-500/5",
    text: "text-yellow-600",
    border: "border-yellow-500/20",
    label: "Medium",
  },
  HARD: {
    bg: "bg-red-500/5",
    text: "text-red-600",
    border: "border-red-500/20",
    label: "Hard",
  },
};

const statusConfig = {
  solved: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Solved", border: "border-green-500/30" },
  attempted: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Attempted", border: "border-yellow-500/30" },
  not_started: { icon: Circle, color: "text-muted-foreground", bg: "bg-transparent", label: "Not started", border: "border-muted" },
};

const accessBadgeConfig: Record<AccessStatus, { icon: any; label: string; className: string }> = {
  AVAILABLE: { icon: Unlock, label: "Available", className: "text-green-600 border-green-300 bg-green-50 dark:bg-green-950/20" },
  LOCKED: { icon: Lock, label: "Locked", className: "text-red-600 border-red-300 bg-red-50 dark:bg-red-950/20" },
  NOT_YET_AVAILABLE: { icon: Clock, label: "Available Soon", className: "text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/20" },
  EXPIRED: { icon: CalendarX, label: "Expired", className: "text-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-800" },
};

export default function StudentModuleViewPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const router = useRouter();
  const isSecureBrowser = useIsSEB();
  const [data, setData] = useState<ModuleProblemsData | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${getBackendURL()}/student/modules/${moduleId}/problems`,
          { withCredentials: true }
        );
        const moduleData = res.data as ModuleProblemsData;
        setData(moduleData);
      } catch (error: any) {
        if (error?.response?.status === 403) {
          toast.error("This module is locked");
        } else {
          toast.error("Failed to load module");
        }
        router.back();
        return;
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [moduleId]);

  useEffect(() => {
    if (!data?.module.assessmentExamId) return;
    const fetchAssessment = async () => {
      try {
        const res = await axios.get(
          `${getBackendURL()}/student/modules/${moduleId}/assessment`,
          { withCredentials: true }
        );
        setAssessmentData(res.data as AssessmentData);
      } catch {
        // Assessment not available
      }
    };
    fetchAssessment();
  }, [moduleId, data?.module.assessmentExamId]);

  if (loading) {
    return (
      <div className="w-full h-full">
        <SiteHeader name="Module" />
        <div className="flex items-center justify-center py-20">
          <Spinner variant="infinite" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full h-full">
      <SiteHeader name={data.module.title} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{data.module.title}</h1>
                  <Badge variant="secondary" className="text-xs">
                    Week {data.module.weekNumber}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {data.module.dueAt
                    ? `Due ${new Date(data.module.dueAt).toLocaleDateString()}`
                    : "No due date"}
                </p>
              </div>
              <div className="flex-shrink-0">
                <ProgressCard
                  completedProblems={data.completedProblems}
                  totalProblems={data.totalProblems}
                  completionPercentage={data.completionPercentage}
                  showLabel={false}
                  size="sm"
                />
              </div>
            </motion.div>

            {data.module.sebEnabled && !isSecureBrowser && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                    <h3 className="text-lg font-semibold">Safe Exam Browser Required</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      This lab requires Safe Exam Browser to be running. Please launch SEB to access module problems and assessments.
                    </p>
                    <Button variant="default" onClick={launchSEB}>
                      Launch SEB
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {(!data.module.sebEnabled || isSecureBrowser) && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Problems</h2>
                  <span className="text-sm text-muted-foreground">
                    ({data.completedProblems}/{data.totalProblems} solved)
                  </span>
                </motion.div>

                {data.problems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No problems in this module</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {data.problems
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((p, i) => {
                    const isAccessible = p.accessStatus === "AVAILABLE";
                    const status = p.progress?.isSolved
                      ? "solved"
                      : p.progress && p.progress.attemptCount > 0
                      ? "attempted"
                      : "not_started";
                    const cfg = statusConfig[status];
                    const StatusIcon = cfg.icon;
                    const diff = difficultyStyles[p.problem.difficulty] || difficultyStyles.EASY;
                    const accessCfg = accessBadgeConfig[p.accessStatus];
                    const AccessIcon = accessCfg.icon;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        whileHover={isAccessible ? { y: -2, scale: 1.01 } : undefined}
                      >
                        <Card
                          className={`transition-all overflow-hidden border-t-2 ${cfg.border} ${
                            isAccessible ? "cursor-pointer hover:shadow-md" : "cursor-default opacity-60"
                          }`}
                          onClick={() => {
                            if (isAccessible) {
                              router.push(`/problems?id=${p.problemId}&moduleProblemId=${p.id}`);
                            }
                          }}
                        >
                          <CardContent className="p-4 relative">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 p-1 rounded-md ${cfg.bg}`}>
                                <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {p.problem.number}. {p.problem.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 h-5 ${diff.text}`}
                                  >
                                    {diff.label}
                                  </Badge>
                                  {isAccessible ? (
                                    <span className="text-xs text-muted-foreground">
                                      {status === "solved"
                                        ? "Solved"
                                        : status === "attempted"
                                        ? `${p.progress!.attemptCount} attempt${p.progress!.attemptCount !== 1 ? "s" : ""}`
                                        : "Not started"}
                                    </span>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${accessCfg.className}`}
                                    >
                                      <AccessIcon className="h-3 w-3" />
                                      {accessCfg.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}

            {data.assessment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Assessment</h2>
                </div>
                <AssessmentCard
                  title={data.assessment.title}
                  startTime={data.assessment.startTime}
                  status={data.assessment.status}
                  durationMinutes={assessmentData?.durationMinutes}
                  score={assessmentData?.score}
                  rank={assessmentData?.rank}
                  onEnter={() => {
                    if (assessmentData?.status === "ACTIVE") {
                      router.push(`/tests/start/${data.assessment!.examId}`);
                    } else if (assessmentData?.status === "UPCOMING") {
                      router.push(`/tests/start/${data.assessment!.examId}`);
                    }
                  }}
                  onViewResult={() =>
                    router.push(
                      `/dashboard/student/results/${data.assessment!.examId}`
                    )
                  }
                />
              </motion.div>
            )}
          </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
