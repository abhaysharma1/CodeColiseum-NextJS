"use client";
import { AiEvaluation } from "@/generated/prisma/client";
import axios from "axios";
import React, { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  User,
  Calendar,
  Trophy,
  Target,
  ArrowLeft,
  MemoryStick,
  ChevronDown,
  Download,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type SubmissionWithDetails = {
  id: string;
  attemptId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  passedTestcases: number;
  totalTestcases: number;
  executionTime: number;
  memory: number;
  isFinal: boolean;
  aiQueued: boolean;
  aiStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  examId: string;
  aiEvaluation: {
    id: string;
    submissionId: string;
    timeComplexity: string;
    spaceComplexity: string;
    optimal: boolean;
    qualityScore: number;
    aiScore: number;
    feedback: string;
    createdAt: string;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isOnboarded: boolean;
    emailVerified: boolean;
    image: string;
    createdAt: string;
    updatedAt: string;
  };
  problem?: {
    id: string;
    title: string;
    difficulty?: string;
  };
};

function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);
  const [data, setData] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set(),
  );
  const router = useRouter();

  useEffect(() => {
    if (!examId) return;
    getAiEvaluations();
  }, [examId]);

  const getAiEvaluations = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/teacher/aiEvaluate/getResults", {
        examId: examId,
      });
      setData(res.data as SubmissionWithDetails[]);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      "Student Name",
      "Student Email",
      "Total Submissions",
      "Accepted Submissions",
      "Optimal Solutions",
      "Average Quality Score",
      "Average AI Score",
      "Success Rate (%)",
      "Problem Title",
      "Language",
      "Status",
      "Tests Passed",
      "Total Tests",
      "Execution Time (ms)",
      "Memory (KB)",
      "AI Score",
      "Quality Score",
      "Time Complexity",
      "Space Complexity",
      "Optimal",
      "Submission Date",
    ];

    // Prepare CSV rows
    const rows: string[][] = [];
    
    studentsArray.forEach((studentData) => {
      studentData.submissions.forEach((submission) => {
        const row = [
          studentData.user.name,
          studentData.user.email,
          studentData.stats.totalSubmissions.toString(),
          studentData.stats.acceptedSubmissions.toString(),
          studentData.stats.optimalSolutions.toString(),
          studentData.stats.averageQualityScore > 0
            ? studentData.stats.averageQualityScore.toFixed(1)
            : "N/A",
          studentData.stats.averageAiScore > 0
            ? Math.round(studentData.stats.averageAiScore).toString()
            : "N/A",
          (
            (studentData.stats.acceptedSubmissions /
              studentData.stats.totalSubmissions) *
            100
          ).toFixed(0),
          submission.problem?.title || "Unknown",
          submission.language,
          submission.status,
          submission.passedTestcases.toString(),
          submission.totalTestcases.toString(),
          submission.executionTime.toString(),
          submission.memory > 0
            ? (submission.memory / 1024).toFixed(0)
            : "N/A",
          submission.aiEvaluation?.aiScore.toString() || "N/A",
          submission.aiEvaluation?.qualityScore.toString() || "N/A",
          submission.aiEvaluation?.timeComplexity || "N/A",
          submission.aiEvaluation?.spaceComplexity || "N/A",
          submission.aiEvaluation?.optimal ? "Yes" : "No",
          formatDate(submission.createdAt),
        ];
        rows.push(row);
      });
    });

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ai-evaluation-results-${examId}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRowExpansion = (studentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleSubmissionExpansion = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACCEPTED: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      COMPILE_ERROR: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
      RUNTIME_ERROR: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
      PENDING: {
        variant: "secondary" as const,
        icon: AlertCircle,
        color: "text-yellow-600",
      },
      WRONG_ANSWER: {
        variant: "outline" as const,
        icon: XCircle,
        color: "text-orange-600",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getAiStatusBadge = (aiStatus: string) => {
    const statusConfig = {
      COMPLETED: { variant: "default" as const, color: "text-green-600" },
      PENDING: { variant: "secondary" as const, color: "text-yellow-600" },
      ERROR: { variant: "destructive" as const, color: "text-red-600" },
    };
    const config =
      statusConfig[aiStatus as keyof typeof statusConfig] ||
      statusConfig.PENDING;

    return <Badge variant={config.variant}>AI: {aiStatus}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group data by student
  const groupedData = data.reduce(
    (acc, submission) => {
      const userId = submission.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: submission.user,
          submissions: [],
          stats: {
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            averageAiScore: 0,
            averageQualityScore: 0,
            optimalSolutions: 0,
          },
        };
      }
      acc[userId].submissions.push(submission);
      return acc;
    },
    {} as Record<
      string,
      {
        user: SubmissionWithDetails["user"];
        submissions: SubmissionWithDetails[];
        stats: {
          totalSubmissions: number;
          acceptedSubmissions: number;
          averageAiScore: number;
          averageQualityScore: number;
          optimalSolutions: number;
        };
      }
    >,
  );

  // Calculate stats for each student
  Object.values(groupedData).forEach((studentData) => {
    const { submissions } = studentData;
    studentData.stats.totalSubmissions = submissions.length;
    studentData.stats.acceptedSubmissions = submissions.filter(
      (s) => s.status === "ACCEPTED",
    ).length;

    const aiEvaluations = submissions.filter((s) => s.aiEvaluation);
    if (aiEvaluations.length > 0) {
      studentData.stats.averageAiScore =
        aiEvaluations.reduce((sum, s) => sum + s.aiEvaluation!.aiScore, 0) /
        aiEvaluations.length;
      studentData.stats.averageQualityScore =
        aiEvaluations.reduce(
          (sum, s) => sum + s.aiEvaluation!.qualityScore,
          0,
        ) / aiEvaluations.length;
      studentData.stats.optimalSolutions = aiEvaluations.filter(
        (s) => s.aiEvaluation!.optimal,
      ).length;
    }
  });

  const studentsArray = Object.values(groupedData);

  // Pagination logic for students
  const totalPages = Math.ceil(studentsArray.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = studentsArray.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader name="AI Results" />
      <div className="mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              AI Evaluation Results
            </h1>
            <p className="text-muted-foreground mt-2">
              Showing {studentsArray.length} student
              {studentsArray.length !== 1 ? "s" : ""} with {data.length}{" "}
              submission{data.length !== 1 ? "s" : ""} analyzed by AI
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>

        {/* Results Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Submissions</TableHead>
                  <TableHead className="text-center">Accepted</TableHead>
                  <TableHead className="text-center">
                    Optimal Solutions
                  </TableHead>
                  <TableHead className="text-center">Avg Quality</TableHead>
                  <TableHead className="text-center">AI Score</TableHead>
                  <TableHead className="text-center">Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((studentData) => (
                  <React.Fragment key={studentData.user.id}>
                    <TableRow
                      className="cursor-pointer  transition-colors"
                      onClick={() => toggleRowExpansion(studentData.user.id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(studentData.user.id);
                          }}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedRows.has(studentData.user.id)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={studentData.user.image} />
                            <AvatarFallback className="text-xs">
                              {studentData.user.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {studentData.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {studentData.user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {studentData.stats.totalSubmissions}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-green-600">
                          {studentData.stats.acceptedSubmissions}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {studentData.stats.optimalSolutions}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {studentData.stats.averageQualityScore > 0
                          ? studentData.stats.averageQualityScore.toFixed(1)
                          : "N/A"}
                        /10
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold text-lg">
                          {studentData.stats.averageAiScore > 0
                            ? Math.round(studentData.stats.averageAiScore)
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="text-blue-600 font-semibold"
                        >
                          {(
                            (studentData.stats.acceptedSubmissions /
                              studentData.stats.totalSubmissions) *
                            100
                          ).toFixed(0)}
                          %
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row - Submissions Details */}
                    {expandedRows.has(studentData.user.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className=" p-0">
                          <div className="px-6 py-5 space-y-5">
                            {/* Compact Summary Stats */}
                            <div className="flex items-center gap-6 rounded-lg border bg-background/50 px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-sm text-muted-foreground">
                                  Optimal
                                </span>
                                <span className="font-bold text-sm">
                                  {studentData.stats.optimalSolutions}
                                </span>
                              </div>
                              <Separator
                                orientation="vertical"
                                className="h-5"
                              />
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">
                                  AI Evaluated
                                </span>
                                <span className="font-bold text-sm">
                                  {
                                    studentData.submissions.filter(
                                      (s) => s.aiEvaluation,
                                    ).length
                                  }
                                </span>
                              </div>
                              <Separator
                                orientation="vertical"
                                className="h-5"
                              />
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-muted-foreground">
                                  Final
                                </span>
                                <span className="font-bold text-sm">
                                  {
                                    studentData.submissions.filter(
                                      (s) => s.isFinal,
                                    ).length
                                  }
                                </span>
                              </div>
                              <Separator
                                orientation="vertical"
                                className="h-5"
                              />
                              <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Attempts
                                </span>
                                <span className="font-bold text-sm">
                                  {studentData.submissions.length}
                                </span>
                              </div>
                            </div>

                            {/* Submissions List */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Submissions ({studentData.submissions.length})
                              </h4>
                              <ScrollArea className="h-fit ">
                                <div className="space-y-2 pr-4">
                                  {studentData.submissions.map((submission) => (
                                    <div
                                      key={submission.id}
                                      className="rounded-lg border bg-background/50 overflow-hidden transition-all"
                                    >
                                      {/* Submission Header */}
                                      <button
                                        onClick={() =>
                                          toggleSubmissionExpansion(
                                            submission.id,
                                          )
                                        }
                                        className="w-full px-4 py-2.5 transition-colors flex items-center gap-3"
                                      >
                                        <ChevronDown
                                          className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${
                                            expandedSubmissions.has(
                                              submission.id,
                                            )
                                              ? "rotate-180"
                                              : ""
                                          }`}
                                        />
                                        <span className="text-sm font-medium truncate flex-1 text-left">
                                          {submission.problem?.title ||
                                            "Unknown Problem"}
                                        </span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <span className="text-xs text-muted-foreground tabular-nums">
                                            {submission.passedTestcases}/
                                            {submission.totalTestcases}
                                          </span>
                                          {getStatusBadge(submission.status)}
                                          {submission.aiEvaluation && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs tabular-nums"
                                            >
                                              AI:{" "}
                                              {submission.aiEvaluation.aiScore}
                                            </Badge>
                                          )}
                                          {submission.isFinal && (
                                            <Badge
                                              variant="default"
                                              className="text-xs"
                                            >
                                              Final
                                            </Badge>
                                          )}
                                        </div>
                                      </button>

                                      {/* Submission Details - Collapsible */}
                                      {expandedSubmissions.has(
                                        submission.id,
                                      ) && (
                                        <div className="border-t p-5 space-y-4">
                                          {/* Inline metadata row */}
                                          <div className="flex items-center gap-3 flex-wrap text-sm">
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {submission.language}
                                            </Badge>
                                            {submission.problem?.difficulty && (
                                              <Badge
                                                variant="outline"
                                                className={`text-xs ${
                                                  submission.problem
                                                    .difficulty === "Easy"
                                                    ? "text-green-600 border-green-300"
                                                    : submission.problem
                                                          .difficulty ===
                                                        "Medium"
                                                      ? "text-amber-600 border-amber-300"
                                                      : "text-red-600 border-red-300"
                                                }`}
                                              >
                                                {submission.problem.difficulty}
                                              </Badge>
                                            )}
                                            <Separator
                                              orientation="vertical"
                                              className="h-4"
                                            />
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              <span className="tabular-nums font-medium">
                                                {submission.passedTestcases}/
                                                {submission.totalTestcases}
                                              </span>
                                              <span>passed</span>
                                            </div>
                                            <Separator
                                              orientation="vertical"
                                              className="h-4"
                                            />
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                              <Clock className="w-3.5 h-3.5" />
                                              <span className="tabular-nums font-medium">
                                                {submission.executionTime}ms
                                              </span>
                                            </div>
                                            <Separator
                                              orientation="vertical"
                                              className="h-4"
                                            />
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                              <MemoryStick className="w-3.5 h-3.5" />
                                              <span className="tabular-nums font-medium">
                                                {submission.memory > 0
                                                  ? `${(submission.memory / 1024).toFixed(0)}K`
                                                  : "N/A"}
                                              </span>
                                            </div>
                                            <Separator
                                              orientation="vertical"
                                              className="h-4"
                                            />
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                              <Calendar className="w-3.5 h-3.5" />
                                              <span className="text-xs">
                                                {formatDate(
                                                  submission.createdAt,
                                                )}
                                              </span>
                                            </div>
                                            {submission.aiEvaluation && (
                                              <>
                                                <Separator
                                                  orientation="vertical"
                                                  className="h-4"
                                                />
                                                <span className="font-semibold tabular-nums">
                                                  AI Score:{" "}
                                                  {
                                                    submission.aiEvaluation
                                                      .aiScore
                                                  }
                                                  /100
                                                </span>
                                              </>
                                            )}
                                          </div>

                                          {/* Tabs */}
                                          <Tabs
                                            defaultValue="analysis"
                                            className="w-full"
                                          >
                                            <TabsList className="w-fit h-8">
                                              <TabsTrigger
                                                value="analysis"
                                                className="text-xs gap-1.5"
                                              >
                                                <Trophy className="w-3 h-3" />
                                                Analysis
                                              </TabsTrigger>
                                              <TabsTrigger
                                                value="code"
                                                className="text-xs gap-1.5"
                                              >
                                                <Code className="w-3 h-3" />
                                                Code
                                              </TabsTrigger>
                                              <TabsTrigger
                                                value="details"
                                                className="text-xs gap-1.5"
                                              >
                                                <AlertCircle className="w-3 h-3" />
                                                Details
                                              </TabsTrigger>
                                            </TabsList>

                                            {/* AI Analysis Tab */}
                                            <TabsContent
                                              value="analysis"
                                              className="mt-3 space-y-3"
                                            >
                                              {submission.aiEvaluation ? (
                                                <div className="space-y-3">
                                                  {/* Scores + Complexity inline */}
                                                  <div className="flex items-center gap-4 flex-wrap text-sm">
                                                    <div className="flex items-baseline gap-1.5">
                                                      <span className="text-muted-foreground">
                                                        AI Score
                                                      </span>
                                                      <span className="text-xl font-bold tabular-nums">
                                                        {
                                                          submission
                                                            .aiEvaluation
                                                            .aiScore
                                                        }
                                                      </span>
                                                      <span className="text-xs text-muted-foreground">
                                                        /100
                                                      </span>
                                                    </div>
                                                    <Separator
                                                      orientation="vertical"
                                                      className="h-6"
                                                    />
                                                    <div className="flex items-baseline gap-1.5">
                                                      <span className="text-muted-foreground">
                                                        Quality
                                                      </span>
                                                      <span className="text-xl font-bold tabular-nums">
                                                        {
                                                          submission
                                                            .aiEvaluation
                                                            .qualityScore
                                                        }
                                                      </span>
                                                      <span className="text-xs text-muted-foreground">
                                                        /10
                                                      </span>
                                                    </div>
                                                    <Separator
                                                      orientation="vertical"
                                                      className="h-6"
                                                    />
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="text-muted-foreground">
                                                        Time
                                                      </span>
                                                      <code className="text-sm font-semibold">
                                                        {
                                                          submission
                                                            .aiEvaluation
                                                            .timeComplexity
                                                        }
                                                      </code>
                                                    </div>
                                                    <Separator
                                                      orientation="vertical"
                                                      className="h-6"
                                                    />
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="text-muted-foreground">
                                                        Space
                                                      </span>
                                                      <code className="text-sm font-semibold">
                                                        {
                                                          submission
                                                            .aiEvaluation
                                                            .spaceComplexity
                                                        }
                                                      </code>
                                                    </div>
                                                    <Separator
                                                      orientation="vertical"
                                                      className="h-6"
                                                    />
                                                    <Badge
                                                      variant={
                                                        submission.aiEvaluation
                                                          .optimal
                                                          ? "default"
                                                          : "outline"
                                                      }
                                                    >
                                                      {submission.aiEvaluation
                                                        .optimal
                                                        ? "Optimal"
                                                        : "Sub-optimal"}
                                                    </Badge>
                                                  </div>

                                                  {/* Feedback */}
                                                  {submission.aiEvaluation
                                                    .feedback && (
                                                    <div className="rounded-lg bg-muted/50 p-4 border max-h-100 h-fit overflow-y-scroll">
                                                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                                                        <div className="markdown-wrapper text-foreground mb-6 ">
                                                          <Markdown
                                                            remarkPlugins={[
                                                              remarkGfm,
                                                            ]}
                                                            rehypePlugins={[
                                                              rehypeHighlight,
                                                            ]}
                                                          >
                                                            {
                                                              submission
                                                                .aiEvaluation
                                                                .feedback
                                                            }
                                                          </Markdown>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                  <p className="text-sm font-medium">
                                                    AI Evaluation Pending
                                                  </p>
                                                </div>
                                              )}
                                            </TabsContent>

                                            {/* Code Tab */}
                                            <TabsContent
                                              value="code"
                                              className="mt-3"
                                            >
                                              <ScrollArea className="h-fit max-h-96 rounded-lg border bg-muted/30">
                                                <pre className="text-xs font-mono p-4 whitespace-pre-wrap break-words">
                                                  <code>
                                                    {submission.sourceCode}
                                                  </code>
                                                </pre>
                                              </ScrollArea>
                                            </TabsContent>

                                            {/* Details Tab */}
                                            <TabsContent
                                              value="details"
                                              className="mt-3"
                                            >
                                              <div className="rounded-lg border divide-y text-sm">
                                                <div className="flex justify-between px-4 py-2.5">
                                                  <span className="text-muted-foreground">
                                                    Submission ID
                                                  </span>
                                                  <span className="font-mono text-xs">
                                                    {submission.id}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between px-4 py-2.5">
                                                  <span className="text-muted-foreground">
                                                    Attempt ID
                                                  </span>
                                                  <span className="font-mono text-xs">
                                                    {submission.attemptId}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between px-4 py-2.5">
                                                  <span className="text-muted-foreground">
                                                    Created
                                                  </span>
                                                  <span className="text-xs">
                                                    {formatDate(
                                                      submission.createdAt,
                                                    )}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-2.5">
                                                  <span className="text-muted-foreground">
                                                    AI Status
                                                  </span>
                                                  {getAiStatusBadge(
                                                    submission.aiStatus,
                                                  )}
                                                </div>
                                                {submission.problem && (
                                                  <>
                                                    <div className="flex justify-between px-4 py-2.5">
                                                      <span className="text-muted-foreground">
                                                        Problem
                                                      </span>
                                                      <span className="font-semibold">
                                                        {
                                                          submission.problem
                                                            .title
                                                        }
                                                      </span>
                                                    </div>
                                                    {submission.problem
                                                      .difficulty && (
                                                      <div className="flex justify-between items-center px-4 py-2.5">
                                                        <span className="text-muted-foreground">
                                                          Difficulty
                                                        </span>
                                                        <Badge
                                                          variant="outline"
                                                          className={`text-xs ${
                                                            submission.problem
                                                              .difficulty ===
                                                            "Easy"
                                                              ? "text-green-600"
                                                              : submission
                                                                    .problem
                                                                    .difficulty ===
                                                                  "Medium"
                                                                ? "text-amber-600"
                                                                : "text-red-600"
                                                          }`}
                                                        >
                                                          {
                                                            submission.problem
                                                              .difficulty
                                                          }
                                                        </Badge>
                                                      </div>
                                                    )}
                                                    <div className="flex justify-between px-4 py-2.5">
                                                      <span className="text-muted-foreground">
                                                        Problem ID
                                                      </span>
                                                      <span className="font-mono text-xs">
                                                        {submission.problemId}
                                                      </span>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </TabsContent>
                                          </Tabs>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pagination */}
        {studentsArray.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, studentsArray.length)} of{" "}
              {studentsArray.length} students
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  const showPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1);

                  if (!showPage) {
                    if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} className="px-2 py-1 text-sm">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
