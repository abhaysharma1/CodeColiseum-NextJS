"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Download,
  Users,
  Award,
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  ExamStatus,
  ExamAttemptStatus,
  SubmissionStatus,
} from "@/generated/prisma/enums";
import { IoReload } from "react-icons/io5";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

export type TeacherTestResultsResponse = {
  examDetails: {
    id: string;
    title: string;
    description: string | null;
    durationMin: number;
    startDate: Date;
    endDate: Date;
    isPublished: boolean;
    status: ExamStatus;
    sebEnabled: boolean;
    problems: Array<{
      order: number;
      problem: {
        id: string;
        number: number;
        title: string;
        difficulty: string;
      };
    }>;
  };
  studentResults: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    attemptId: string;
    status: ExamAttemptStatus;
    startedAt: Date;
    submittedAt: Date | null;
    expiresAt: Date;
    totalScore: number;
    lastHeartbeatAt: Date;
    disconnectCount: number;
    problemScores: Array<{
      problemId: string;
      problemTitle: string;
      problemNumber: number;
      bestScore: number;
      attempts: number;
      latestStatus: SubmissionStatus | null;
      passedTestcases: number;
      totalTestcases: number;
      sourceCode: string | null;
    }>;
  }>;
  statistics: {
    totalStudents: number;
    submitted: number;
    inProgress: number;
    notStarted: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
  };
};

type AiEvalUIStatus = "NOT_STARTED" | "EVALUATING" | "COMPLETED";

function TestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);
  const router = useRouter();

  const [data, setData] = useState<TeacherTestResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiEvaluatingStatus, setAiEvaluatingStatus] =
    useState<AiEvalUIStatus>("NOT_STARTED");

  const [aiEvaluationCompletionStatus, setAiEvaluationCompletionStatus] =
    useState<{ completed: number; total: number } | undefined>();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const domain = getBackendURL();
        const res = await axios.get(`${domain}/teacher/exam/getresults`, {
          params: {
            examId: examId,
          },
          withCredentials: true,
        });

        const results: TeacherTestResultsResponse =
          res.data as TeacherTestResultsResponse;
        setData(results);
        if (results.examDetails.status === "finished") {
          setAiEvaluatingStatus("COMPLETED");
        } else if (results.examDetails.status === "ai_processing") {
          setAiEvaluatingStatus("EVALUATING");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error("Failed to load test results");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchResults();
    }
  }, [examId]);

  useEffect(() => {
    if (aiEvaluatingStatus !== "EVALUATING") return;
    if (!data?.examDetails.id) return;

    const examId = data.examDetails.id;
    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `${getBackendURL()}/teacher/exam/get-ai-evaluation-status`,
          {
            params: { examId },
            withCredentials: true,
          }
        );

        const { total, completed } = res.data as {
          total: number;
          completed: number;
        };

        setAiEvaluationCompletionStatus({ total: total, completed: completed });

        if (total === 0) {
          clearInterval(interval);
          setAiEvaluatingStatus("NOT_STARTED");
          return;
        }

        if (completed >= total) {
          clearInterval(interval); // 🔥 IMPORTANT
          setAiEvaluatingStatus("COMPLETED");

          const response = await axios.get(
            `${getBackendURL()}/teacher/exam/getresults`,
            {
              params: { examId },
              withCredentials: true,
            }
          );

          setData(response.data as TeacherTestResultsResponse);
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    fetchStatus(); // run immediately

    interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [aiEvaluatingStatus, data?.examDetails.id]);

  const getStatusBadge = (status: ExamAttemptStatus) => {
    const statusMap: Record<
      ExamAttemptStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      [ExamAttemptStatus.SUBMITTED]: { variant: "default", label: "Submitted" },
      [ExamAttemptStatus.AUTO_SUBMITTED]: {
        variant: "secondary",
        label: "Auto-Submitted",
      },
      [ExamAttemptStatus.IN_PROGRESS]: {
        variant: "outline",
        label: "In Progress",
      },
      [ExamAttemptStatus.NOT_STARTED]: {
        variant: "destructive",
        label: "Not Started",
      },
      [ExamAttemptStatus.TERMINATED]: {
        variant: "destructive",
        label: "Terminated",
      },
    };

    const config = statusMap[status] || {
      variant: "outline" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getExamStatusBadge = (status: ExamStatus) => {
    const statusMap: Record<
      ExamStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        icon?: React.ReactNode;
      }
    > = {
      [ExamStatus.scheduled]: {
        variant: "outline",
        label: "Scheduled",
        icon: <Clock className="w-3 h-3" />,
      },
      [ExamStatus.active]: {
        variant: "default",
        label: "Active",
        icon: <TrendingUp className="w-3 h-3" />,
      },
      [ExamStatus.completed]: { variant: "secondary", label: "Completed" },
      [ExamStatus.ai_processing]: {
        variant: "outline",
        label: "AI Processing",
      },
      [ExamStatus.finished]: { variant: "destructive", label: "Finished" },
    };

    const config = statusMap[status] || {
      variant: "outline" as const,
      label: status,
    };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getSubmissionStatusBadge = (status: SubmissionStatus | null) => {
    if (!status) return <Badge variant="outline">No Submission</Badge>;

    const statusMap: Record<
      SubmissionStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      [SubmissionStatus.ACCEPTED]: { variant: "default", label: "Accepted" },
      [SubmissionStatus.PARTIAL]: { variant: "secondary", label: "Partial" },
      [SubmissionStatus.WRONG_ANSWER]: {
        variant: "destructive",
        label: "Wrong Answer",
      },
      [SubmissionStatus.TIME_LIMIT]: {
        variant: "destructive",
        label: "Time Limit",
      },
      [SubmissionStatus.MEMORY_LIMIT]: {
        variant: "destructive",
        label: "Memory Limit",
      },
      [SubmissionStatus.RUNTIME_ERROR]: {
        variant: "destructive",
        label: "Runtime Error",
      },
      [SubmissionStatus.COMPILE_ERROR]: {
        variant: "destructive",
        label: "Compile Error",
      },
      [SubmissionStatus.PENDING]: { variant: "outline", label: "Pending" },
      [SubmissionStatus.RUNNING]: { variant: "outline", label: "Running" },
      [SubmissionStatus.INTERNAL_ERROR]: {
        variant: "destructive",
        label: "Internal Error",
      },
    };

    const config = statusMap[status] || {
      variant: "outline" as const,
      label: status,
    };
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = [
      "Student Name",
      "Email",
      "Status",
      "Total Score",
      "Started At",
      "Submitted At",
      "Disconnect Count",
      "Last Heartbeat",
      ...data.examDetails.problems.map(
        (p) => `Problem ${p.problem.number} Score`
      ),
      ...data.examDetails.problems.map(
        (p) => `Problem ${p.problem.number} Status`
      ),
    ];

    const rows = data.studentResults.map((student) => [
      student.studentName,
      student.studentEmail,
      student.status,
      student.totalScore.toString(),
      new Date(student.startedAt).toLocaleString(),
      student.submittedAt
        ? new Date(student.submittedAt).toLocaleString()
        : "N/A",
      student.disconnectCount.toString(),
      new Date(student.lastHeartbeatAt).toLocaleString(),
      ...data.examDetails.problems.map((p) => {
        const problemScore = student.problemScores.find(
          (ps) => ps.problemId === p.problem.id
        );
        return problemScore ? problemScore.bestScore.toString() : "0";
      }),
      ...data.examDetails.problems.map((p) => {
        const problemScore = student.problemScores.find(
          (ps) => ps.problemId === p.problem.id
        );
        return problemScore?.latestStatus || "No Submission";
      }),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.examDetails.title}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Results exported successfully");
  };

  const evaluateUsingAI = async () => {
    if (!data?.examDetails.id) return;

    if (aiEvaluatingStatus === "COMPLETED") {
      router.push(
        `/dashboard/teacher/test/seeresults/${data.examDetails.id}/airesults`
      );
      return;
    }

    try {
      console.log("hello");
      const res = await axios.post(
        `${getBackendURL()}/teacher/exam/start-ai-evaluation`,
        {
          examId: data.examDetails.id,
        },
        {
          withCredentials: true,
        }
      );

      console.log(res.data);

      const { total } = res.data as { total: number };

      if (total > 0) {
        toast.success("AI Evaluation Started");
        setAiEvaluatingStatus("EVALUATING");
      } else {
        toast.error("No Submissions To Evaluate");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error("Exam must be completed first");
      }
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || "Failed to load results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader name={"See Test Results"} />
      {loading || !data ? (
        <div className="h-full w-full flex justify-center items-center">
          <Spinner variant="infinite" />
        </div>
      ) : (
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">{data.examDetails.title}</h1>
                <div className="flex items-center gap-2">
                  {getExamStatusBadge(data.examDetails.status)}
                  {data.examDetails.sebEnabled && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Shield className="w-3 h-3" />
                      SEB Enabled
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">
                {data.examDetails.description || "Test results overview"}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button
                onClick={evaluateUsingAI}
                disabled={
                  aiEvaluatingStatus === "EVALUATING" ||
                  (data.examDetails.endDate > new Date() &&
                    aiEvaluatingStatus === "NOT_STARTED")
                }
              >
                <Sparkles />

                {aiEvaluatingStatus === "NOT_STARTED" && "Evaluate Using AI"}

                {aiEvaluatingStatus === "EVALUATING" && (
                  <>
                    Evaluating...
                    {aiEvaluationCompletionStatus && (
                      <span className="ml-2">
                        {aiEvaluationCompletionStatus.completed} /{" "}
                        {aiEvaluationCompletionStatus.total}
                      </span>
                    )}
                  </>
                )}

                {aiEvaluatingStatus === "COMPLETED" &&
                  "See AI Evaluation Results"}
              </Button>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.statistics.submitted} submitted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.averageScore}%
                </div>
                <p className="text-xs text-muted-foreground">Of total points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Highest Score
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.highestScore}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Best performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.completionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.statistics.inProgress} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Disconnections
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.studentResults.reduce(
                    (total, student) => total + student.disconnectCount,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total across all students
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Scores</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Results</CardTitle>
                  <CardDescription>
                    Overview of all student attempts and scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-fit max-h-[600px] overflow-y-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total Score</TableHead>
                          <TableHead>Started At</TableHead>
                          <TableHead>Submitted At</TableHead>
                          <TableHead>Disconnections</TableHead>
                          <TableHead>Last Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody >
                        {data.studentResults.map((student, index) => (
                          <TableRow key={student.attemptId}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {student.studentEmail}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(student.status)}
                            </TableCell>
                            <TableCell className="font-bold">
                              {student.totalScore}%
                            </TableCell>
                            <TableCell>
                              {new Date(student.startedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {student.submittedAt
                                ? new Date(student.submittedAt).toLocaleString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {student.disconnectCount > 0 ? (
                                <Badge variant="destructive">
                                  {student.disconnectCount}
                                </Badge>
                              ) : (
                                <Badge variant="outline">0</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(
                                student.lastHeartbeatAt
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {data.studentResults.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        No student attempts yet
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Problem Scores</CardTitle>
                  <CardDescription>
                    Individual problem performance for each student
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-fit max-h-[600px] overflow-y-scroll">
                    <Accordion type="multiple" className="space-y-2 ">
                      {data.studentResults.map((student) => (
                        <AccordionItem
                          key={student.attemptId}
                          value={student.attemptId}
                          className="border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-4">
                                <div className="text-left">
                                  <div className="font-semibold">
                                    {student.studentName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {student.studentEmail}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 mr-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-primary">
                                    {student.totalScore}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Total Score
                                  </div>
                                </div>
                                <div className="text-center">
                                  {getStatusBadge(student.status)}
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold">
                                    {
                                      student.problemScores.filter(
                                        (ps) => ps.attempts > 0
                                      ).length
                                    }
                                    /{data.examDetails.problems.length}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Problems Attempted
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              {/* Student Summary */}
                              <div className="bg-muted/20 p-4 rounded-lg">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                      Started At
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {new Date(
                                        student.startedAt
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                      Submitted At
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {student.submittedAt
                                        ? new Date(
                                            student.submittedAt
                                          ).toLocaleString()
                                        : "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                      Disconnections
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {student.disconnectCount > 0 ? (
                                        <Badge variant="destructive">
                                          {student.disconnectCount}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">0</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                      Last Activity
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {new Date(
                                        student.lastHeartbeatAt
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Problem Details */}
                              <div className="space-y-3">
                                <h4 className="font-semibold">
                                  Problem Performance
                                </h4>
                                <Accordion
                                  type="multiple"
                                  className="space-y-2"
                                >
                                  {data.examDetails.problems.map((problem) => {
                                    const problemScore =
                                      student.problemScores.find(
                                        (ps) =>
                                          ps.problemId === problem.problem.id
                                      );
                                    const sourceCode =
                                      student.problemScores.find(
                                        (item) =>
                                          item.problemId === problem.problem.id
                                      );
                                    return (
                                      <AccordionItem
                                        key={problem.problem.id}
                                        value={`problem-${student.attemptId}-${problem.problem.id}`}
                                        className="border rounded-lg"
                                      >
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                          <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-4">
                                              <div className="text-left">
                                                <div className="font-medium">
                                                  Problem{" "}
                                                  {problem.problem.number}:{" "}
                                                  {problem.problem.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                  {problem.problem.difficulty}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-4 mr-4">
                                              <div className="text-center">
                                                <div className="text-lg font-bold text-primary">
                                                  {problemScore?.bestScore || 0}
                                                  %
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                  Best Score
                                                </div>
                                              </div>
                                              <div className="text-center">
                                                {problemScore?.latestStatus ? (
                                                  getSubmissionStatusBadge(
                                                    problemScore.latestStatus
                                                  )
                                                ) : (
                                                  <Badge variant="outline">
                                                    No Submission
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-4 pb-4">
                                          {problemScore &&
                                          problemScore.attempts > 0 ? (
                                            <div className="space-y-4">
                                              {/* Problem Stats */}
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                  <div className="text-sm font-medium text-muted-foreground">
                                                    Test Cases
                                                  </div>
                                                  <div className="text-lg font-semibold">
                                                    {
                                                      problemScore.passedTestcases
                                                    }
                                                    /
                                                    {
                                                      problemScore.totalTestcases
                                                    }
                                                  </div>
                                                  <div className="text-xs text-muted-foreground">
                                                    passed
                                                  </div>
                                                </div>
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                  <div className="text-sm font-medium text-muted-foreground">
                                                    Attempts
                                                  </div>
                                                  <div className="text-lg font-semibold">
                                                    {problemScore.attempts}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground">
                                                    {problemScore.attempts === 1
                                                      ? "attempt"
                                                      : "attempts"}
                                                  </div>
                                                </div>
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                  <div className="text-sm font-medium text-muted-foreground">
                                                    Status
                                                  </div>
                                                  <div className="mt-1">
                                                    {getSubmissionStatusBadge(
                                                      problemScore.latestStatus
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                  <div className="text-sm font-medium text-muted-foreground">
                                                    Score Progress
                                                  </div>
                                                  <div className="text-lg font-semibold">
                                                    {problemScore.bestScore}%
                                                  </div>
                                                  <div className="text-xs text-muted-foreground">
                                                    out of 100%
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Source Code Section */}
                                              <div className="border-t pt-4">
                                                <h5 className="font-medium mb-3 flex items-center gap-2">
                                                  <span>
                                                    Latest Submission Code
                                                  </span>
                                                </h5>

                                                <div className="bg-muted/20 border rounded-lg overflow-hidden">
                                                  <div className="bg-muted/50 px-3 py-2 border-b">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                      Source Code
                                                    </span>
                                                  </div>
                                                  <pre className="p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto">
                                                    <code>
                                                      {sourceCode
                                                        ? sourceCode.sourceCode
                                                        : "No Submission"}
                                                    </code>
                                                  </pre>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                                              <div className="text-lg font-medium">
                                                No attempts made
                                              </div>
                                              <div className="text-sm">
                                                Student hasn't submitted code
                                                for this problem
                                              </div>
                                            </div>
                                          )}
                                        </AccordionContent>
                                      </AccordionItem>
                                    );
                                  })}
                                </Accordion>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                  {data.studentResults.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No student attempts yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Duration
                </p>
                <p className="text-lg font-semibold">
                  {data.examDetails.durationMin} minutes
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="mt-1">
                  {getExamStatusBadge(data.examDetails.status)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="text-lg font-semibold">
                  {data.examDetails.isPublished ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Date
                </p>
                <p className="text-lg font-semibold">
                  {new Date(data.examDetails.startDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  End Date
                </p>
                <p className="text-lg font-semibold">
                  {new Date(data.examDetails.endDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Safe Exam Browser
                </p>
                <div className="mt-1">
                  {data.examDetails.sebEnabled ? (
                    <Badge
                      variant="default"
                      className="flex items-center gap-1 w-fit"
                    >
                      <Shield className="w-3 h-3" />
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-fit">
                      Not Required
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default TestResultsPage;
